/* Subdomain Finder — cinematic stage timeline (vanilla JS, no dependencies). */

(function () {
	"use strict";

	/* ---------- Guarded DOM helpers: every query and dataset read is safe ---------- */

	function $(id) {
		return document.getElementById(id) || null;
	}

	function one(selector) {
		try {
			return document.querySelector(selector) || null;
		} catch (err) {
			return null;
		}
	}

	function all(selector) {
		try {
			return Array.prototype.slice.call(document.querySelectorAll(selector) || []);
		} catch (err) {
			return [];
		}
	}

	function on(el, type, handler) {
		if (el && typeof el.addEventListener === "function") el.addEventListener(type, handler);
	}

	function addClass(el, name) {
		if (el && el.classList) el.classList.add(name);
	}

	function removeClass(el, name) {
		if (el && el.classList) el.classList.remove(name);
	}

	function toggleClass(el, name, state) {
		if (el && el.classList) el.classList.toggle(name, !!state);
	}

	function setText(el, value) {
		if (el) el.textContent = value;
	}

	function setAttr(el, name, value) {
		if (el && typeof el.setAttribute === "function") el.setAttribute(name, value);
	}

	function removeAttr(el, name) {
		if (el && typeof el.removeAttribute === "function") el.removeAttribute(name);
	}

	function readAct(btn) {
		var raw = btn && typeof btn.getAttribute === "function" ? btn.getAttribute("data-act") : null;
		var value = Number(raw);
		return value >= 1 && value <= 5 ? value : 0;
	}

	var ACT_DESC = {
		1: "Composing the question.",
		2: "The assistant explains it cannot retrieve a verified list on its own.",
		3: "Enabling the Subdomain Finder tool.",
		4: "Asking again with the tool attached.",
		5: "The lookup succeeds with live subdomains."
	};

	/* ---------- Last-resort fallback: show the authored final Act 5 state ---------- */

	function safeAct5Fallback() {
		try {
			var tag = $("actTag");
			if (tag) tag.innerHTML = "05 <span>/ 05</span>";
			var composer = $("composer");
			if (composer) composer.classList.add("docked");
			var chip = $("chip");
			if (chip) chip.classList.add("on");
			var toggle = $("toolToggle");
			if (toggle) {
				toggle.classList.add("on");
				toggle.setAttribute("aria-checked", "true");
			}
			addClass($("msgUser5"), "show");
			addClass($("result"), "show");
			addClass($("resultHead"), "show");
			addClass($("metrics"), "show");
			setText($("mReturned"), "100");
			setText($("mTotal"), "126");
			setText($("mTrunc"), "Yes");
			all(".disc-card").forEach(function (el) { addClass(el, "show"); });
			var pointerEl = $("cursor");
			if (pointerEl) pointerEl.style.display = "none";
			var rippleLayer = $("ripples");
			if (rippleLayer) rippleLayer.style.display = "none";
			removeClass($("scene"), "fade");
			setText($("liveStatus"), "Act 5 of 5. " + ACT_DESC[5]);
		} catch (err) {
			/* Nothing further can be done safely. */
		}
	}

	try {
		bootstrap();
	} catch (err) {
		safeAct5Fallback();
	}

	function bootstrap() {
		var scene = $("scene");
		var frame = $("frame");
		var composer = $("composer");
		var inputText = $("inputText");
		var inputWrap = $("inputWrap");
		var cursor = $("cursor");
		var cursorArt = $("cursorArt");
		var ripples = $("ripples");
		var plusBtn = $("plusBtn");
		var sendBtn = $("sendBtn");
		var chip = $("chip");
		var toolToggle = $("toolToggle");
		var toolsPop = $("toolsPop");
		var toast = $("toast");
		var msgUser2 = $("msgUser2");
		var thinking = $("thinking");
		var msgAi2 = $("msgAi2");
		var msgUser5 = $("msgUser5");
		var result = $("result");
		var execStatus = $("execStatus");
		var resultHead = $("resultHead");
		var metrics = $("metrics");
		var mReturned = $("mReturned");
		var mTotal = $("mTotal");
		var mTrunc = $("mTrunc");
		var actTag = $("actTag");
		var liveStatus = $("liveStatus");

		/* Optional controls — may be removed from the markup entirely. */
		var playBtn = $("playBtn");
		var playLabel = $("playLabel");
		var replayBtn = $("replayBtn");
		var stageFoot = one(".stage-foot");

		var copyBtn = $("copyBtn");
		var endpointText = $("endpointText");
		var stepBtns = all(".step");
		var discCards = all(".disc-card");

		var motionQuery = typeof window.matchMedia === "function"
			? window.matchMedia("(prefers-reduced-motion: reduce)")
			: null;
		var RM = !!(motionQuery && motionQuery.matches);
		var ENDPOINT = "https://server.adityahq.me/mcp";
		var QUERY = "find subdomain of grafana.com";
		var SCENE_W = 1120;

		var paused = false;
		var running = false;
		var fading = false;
		var token = 0;
		var currentAct = 1;
		var copyTimer = null;

		/* ---------- Exact camera easing: cubic-bezier(0.22, 1, 0.36, 1) ---------- */

		function cubicBezier(x1, y1, x2, y2) {
			function A(a, b) { return 1 - 3 * b + 3 * a; }
			function B(a, b) { return 3 * b - 6 * a; }
			function C(a) { return 3 * a; }
			function calc(t, a, b) { return ((A(a, b) * t + B(a, b)) * t + C(a)) * t; }
			function slope(t, a, b) { return 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a); }
			return function (x) {
				var t = x;
				for (var i = 0; i < 6; i++) {
					var s = slope(t, x1, x2);
					if (Math.abs(s) < 1e-6) break;
					t -= (calc(t, x1, x2) - x) / s;
				}
				t = Math.max(0, Math.min(1, t));
				return calc(t, y1, y2);
			};
		}

		var easeCamera = cubicBezier(0.22, 1, 0.36, 1);

		function nowMs() {
			return typeof performance !== "undefined" && performance.now
				? performance.now()
				: Date.now();
		}

		/* ---------- One cancellable rAF clock drives every timed step ---------- */

		var clock = { raf: 0, last: 0, tasks: [] };

		function cancelAll() {
			++token;
			running = false;
			var pending = clock.tasks.slice();
			clock.tasks.length = 0;
			if (clock.raf) window.clearTimeout(clock.raf);
			clock.raf = 0;
			pending.forEach(function (task) { task.resolve(false); });
		}

		function tick(now) {
			var dt = now - clock.last;
			clock.last = now;
			/* Clamp so a backgrounded tab cannot fast-forward to the end state. */
			if (paused) dt = 0;
			else if (dt > 50) dt = 50;
			for (var i = clock.tasks.length - 1; i >= 0; i--) {
				var task = clock.tasks[i];
				if (task.token !== token) {
					clock.tasks.splice(i, 1);
					task.resolve(false);
					continue;
				}
				task.elapsed += dt;
				var t = task.duration <= 0 ? 1 : Math.min(1, task.elapsed / task.duration);
				try {
					task.update(t);
				} catch (err) {
					/* A bad frame must never kill the shared clock. */
				}
				if (t >= 1) {
					clock.tasks.splice(i, 1);
					task.resolve(true);
				}
			}
			if (clock.tasks.length) {
				clock.raf = window.setTimeout(function () { tick(nowMs()); }, 16);
			} else {
				clock.raf = 0;
			}
		}

		function schedule(duration, update, myToken) {
			return new Promise(function (resolve) {
				if (myToken !== token) {
					resolve(false);
					return;
				}
				clock.tasks.push({
					token: myToken,
					elapsed: 0,
					duration: Math.max(0, duration),
					update: update,
					resolve: resolve
				});
				if (!clock.raf) {
					clock.last = nowMs();
					clock.raf = window.setTimeout(function () { tick(nowMs()); }, 16);
				}
			});
		}

		function wait(ms, myToken) {
			return schedule(ms, function () {}, myToken);
		}

		function sleep(ms, myToken) {
			return wait(ms, myToken);
		}

		/* ---------- Single pointer: continuous glide geometry, press and ripple ---------- */

		var pointer = { x: 1040, y: 640 };

		function setCursor(x, y) {
			pointer.x = x;
			pointer.y = y;
			if (cursor) cursor.style.transform = "translate(" + x + "px," + y + "px)";
		}

		function setCursorMode(mode) {
			if (cursor) toggleClass(cursor, "text", mode === "text");
		}

		function textEndPoint() {
			var x = 0, y = 0;
			if (!inputText || !scene) return { x: x, y: y };
			var sr = scene.getBoundingClientRect();
			var scale = sr.width && SCENE_W ? sr.width / SCENE_W : 1;
			try {
				var node = inputText.firstChild;
				if (node && node.nodeType === 3 && typeof document.createRange === "function") {
					var range = document.createRange();
					range.setStart(node, node.data.length);
					range.collapse(true);
					var rr = range.getBoundingClientRect();
					x = rr.left - sr.left;
					y = rr.top - sr.top;
				}
			} catch (err) { /* fall back to the element box */ }
			if (!x && !y) {
				var box = inputText.getBoundingClientRect();
				x = box.right - sr.left;
				y = box.top - sr.top;
			}
			/* The beam sits at x=12, top=3 inside the 24x30 cursor art.
			   Offset the element so the beam itself lands on the text end. */
			return { x: x / scale - 12, y: y / scale - 3 };
		}

		function cursorToTextEnd() {
			if (!cursor) return;
			var p = textEndPoint();
			setCursor(p.x, p.y);
		}

		function glideTo(x, y, duration, myToken) {
			if (RM) {
				setCursor(x, y);
				return Promise.resolve(true);
			}
			var fromX = pointer.x;
			var fromY = pointer.y;
			return schedule(duration, function (t) {
				var k = easeCamera(t);
				setCursor(fromX + (x - fromX) * k, fromY + (y - fromY) * k);
			}, myToken);
		}

		function clearRipples() {
			if (ripples) ripples.innerHTML = "";
		}

		function ripple(x, y, myToken) {
			if (!ripples || RM) return;
			var node = document.createElement("div");
			node.className = "ripple";
			node.style.left = x + "px";
			node.style.top = y + "px";
			ripples.appendChild(node);
			/* Token-aware cleanup: also runs when cancelAll() resolves the wait false. */
			wait(650, myToken).then(function () {
				if (node.parentNode) node.parentNode.removeChild(node);
			});
		}

		async function clickAt(x, y, myToken) {
			ripple(x, y, myToken);
			addClass(cursor, "press");
			var ok = await wait(140, myToken);
			removeClass(cursor, "press");
			return ok;
		}

		async function pressButton(btn, x, y, myToken) {
			ripple(x, y, myToken);
			addClass(cursor, "press");
			addClass(btn, "press");
			var ok = await wait(150, myToken);
			removeClass(cursor, "press");
			removeClass(btn, "press");
			return ok;
		}

		/* ---------- Human typing with the authored 35-85ms cadence ---------- */

		function reserveTypingSpace() {
			if (inputWrap) inputWrap.style.minWidth = "340px";
			if (inputText) {
				inputText.style.display = "inline-block";
				inputText.style.minHeight = "20px";
			}
		}

		async function typeText(text, myToken) {
			setText(inputText, "");
			for (var i = 0; i < text.length; i++) {
				if (myToken !== token) return false;
				if (inputText) inputText.textContent += text.charAt(i);
				if (cursor && cursor.classList.contains("text")) cursorToTextEnd();
				if (RM) continue;
				if (!await wait(35 + Math.random() * 50, myToken)) return false;
			}
			return true;
		}

		function countUp(el, target, duration, myToken) {
			if (RM) {
				setText(el, String(target));
				return Promise.resolve(true);
			}
			setText(el, "0");
			return schedule(duration, function (t) {
				setText(el, String(Math.round(target * easeCamera(t))));
			}, myToken);
		}

		/* ---------- Scene fitting and display state ---------- */

		function fitScene() {
			if (!frame || !scene) return;
			var w = frame.clientWidth;
			if (w > 0) scene.style.transform = "scale(" + (w / SCENE_W) + ")";
		}

		function clampAct(n) {
			var value = Number(n);
			return value >= 1 && value <= 5 ? Math.floor(value) : 1;
		}

		function revealScene() {
			/* Never un-fade during an intentional cross-fade reset. */
			if (!fading) removeClass(scene, "fade");
		}

		function setAct(n) {
			var act = clampAct(n);
			currentAct = act;
			if (actTag) {
				actTag.innerHTML = String(act < 10 ? "0" + act : act) + " <span>/ 05</span>";
			}
			stepBtns.forEach(function (b) {
				var active = readAct(b) === act;
				toggleClass(b, "active", active);
				if (active) setAttr(b, "aria-current", "step");
				else removeAttr(b, "aria-current");
			});
			setText(liveStatus, "Act " + act + " of 5. " + ACT_DESC[act]);
		}

		function updatePlayBtn() {
			/* Controls are optional; this whole function is a no-op if they were removed. */
			if (!playBtn) return;
			toggleClass(playBtn, "playing", !paused);
			setAttr(playBtn, "aria-label", paused ? "Play the animation" : "Pause the animation");
			if (playLabel) setText(playLabel, paused ? "Play" : "Pause");
			/* The authored caption is informational and is never rewritten. */
			if (stageFoot) { /* intentionally unchanged */ }
		}

		function parkPointer() {
			/* Teleport only while invisible (cross-fade) or in reduced motion. */
			if (RM || (scene && scene.classList && scene.classList.contains("fade"))) {
				setCursor(1040, 640);
			}
		}

		function clearResult() {
			/* Shared teardown for everything Act 5 owns. */
			[execStatus, resultHead, metrics].forEach(function (el) { removeClass(el, "show"); });
			removeClass(metrics, "shimmer");
			removeClass(result, "show");
			discCards.forEach(function (el) { removeClass(el, "show"); });
			setText(mReturned, "0");
			setText(mTotal, "0");
			setText(mTrunc, "\u00A0");
		}

		function resetAll() {
			setCursorMode("pointer");
			removeClass(composer, "docked");
			removeClass(composer, "focused");
			removeClass(composer, "intro");
			removeClass(inputWrap, "has-text");
			removeClass(inputWrap, "typing");
			setText(inputText, "");
			removeClass(chip, "on");
			removeClass(toolToggle, "on");
			setAttr(toolToggle, "aria-checked", "false");
			removeClass(toolsPop, "show");
			removeClass(toast, "show");
			[msgUser2, thinking, msgAi2, msgUser5].forEach(function (el) {
				removeClass(el, "show");
			});
			clearResult();
			removeClass(cursor, "press");
			removeClass(cursorArt, "press");
			removeClass(plusBtn, "press");
			removeClass(sendBtn, "press");
			clearRipples();
			revealScene();
			parkPointer();
		}

		/* ---------- Per-act setup: each teardown resets only what it owns ---------- */

		function setup2() {
			removeClass(composer, "focused");
			removeClass(composer, "intro");
			removeClass(inputWrap, "typing");
			removeClass(inputWrap, "has-text");
			setText(inputText, "");
			addClass(composer, "docked");
			addClass(msgUser2, "show");
			removeClass(thinking, "show");
			removeClass(msgAi2, "show");
			removeClass(msgUser5, "show");
			clearResult();
			revealScene();
		}

		function setup3() {
			addClass(composer, "docked");
			addClass(msgUser2, "show");
			addClass(msgAi2, "show");
			removeClass(thinking, "show");
			removeClass(msgUser5, "show");
			removeClass(toast, "show");
			removeClass(toolsPop, "show");
			removeClass(chip, "on");
			removeClass(toolToggle, "on");
			setAttr(toolToggle, "aria-checked", "false");
			clearResult();
			revealScene();
		}

		function setup4() {
			removeClass(msgUser2, "show");
			removeClass(msgAi2, "show");
			removeClass(thinking, "show");
			removeClass(msgUser5, "show");
			setText(inputText, "");
			removeClass(inputWrap, "typing");
			removeClass(inputWrap, "has-text");
			removeClass(composer, "focused");
			addClass(composer, "docked");
			addClass(chip, "on");
			addClass(toolToggle, "on");
			setAttr(toolToggle, "aria-checked", "true");
			removeClass(toolsPop, "show");
			removeClass(toast, "show");
			clearResult();
			revealScene();
		}

		function setup5() {
			removeClass(composer, "focused");
			removeClass(inputWrap, "typing");
			removeClass(inputWrap, "has-text");
			setText(inputText, "");
			clearResult();
			addClass(msgUser5, "show");
			addClass(result, "show");
			revealScene();
		}

		var setups = { 1: resetAll, 2: setup2, 3: setup3, 4: setup4, 5: setup5 };

		/* ---------- Act performances ---------- */

		async function run1(t) {
			setAct(1);
			resetAll();
			if (RM) {
				setText(inputText, QUERY);
				addClass(inputWrap, "has-text");
				return true;
			}
			removeClass(composer, "intro");
			void (composer && composer.offsetWidth);
			addClass(composer, "intro");
			if (!await sleep(700, t)) return false;

			if (!await glideTo(560, 350, 950, t)) return false;
			if (!await clickAt(560, 350, t)) return false;
			addClass(composer, "focused");
			addClass(inputWrap, "typing");
			addClass(inputWrap, "has-text");
			var textStart = textEndPoint();
			if (!await glideTo(textStart.x, textStart.y, 220, t)) return false;
			setCursorMode("text");
			if (!await typeText(QUERY, t)) return false;
			setCursorMode("pointer");
			removeClass(inputWrap, "typing");
			if (!await sleep(260, t)) return false;

			if (!await glideTo(840, 350, 560, t)) return false;
			if (!await pressButton(sendBtn, 840, 350, t)) return false;
			return await sleep(420, t);
		}

		async function run2(t) {
			setAct(2);
			setup2();
			if (RM) {
				removeClass(thinking, "show");
				addClass(msgAi2, "show");
				return true;
			}
			addClass(thinking, "show");
			if (!await sleep(800, t)) return false;
			removeClass(thinking, "show");
			addClass(msgAi2, "show");
			return await sleep(1400, t);
		}

		async function run3(t) {
			setAct(3);
			setup3();
			if (RM) {
				addClass(chip, "on");
				addClass(toolToggle, "on");
				setAttr(toolToggle, "aria-checked", "true");
				return true;
			}
			if (!await sleep(1500, t)) return false;

			addClass(toast, "show");
			if (!await sleep(500, t)) return false;

			if (!await glideTo(281, 655, 560, t)) return false;
			if (!await pressButton(plusBtn, 281, 655, t)) return false;
			addClass(toolsPop, "show");
			if (!await sleep(360, t)) return false;

			if (!await glideTo(545, 462, 520, t)) return false;
			if (!await clickAt(545, 462, t)) return false;
			addClass(toolToggle, "on");
			setAttr(toolToggle, "aria-checked", "true");
			if (!await sleep(300, t)) return false;

			removeClass(toolsPop, "show");
			addClass(chip, "on");
			removeClass(toast, "show");
			return await sleep(500, t);
		}

		async function run4(t) {
			setAct(4);
			setup4();
			if (RM) {
				addClass(msgUser5, "show");
				return true;
			}
			if (!await sleep(420, t)) return false;

			if (!await glideTo(560, 654, 700, t)) return false;
			if (!await clickAt(560, 654, t)) return false;
			addClass(composer, "focused");
			addClass(inputWrap, "typing");
			addClass(inputWrap, "has-text");
			var textStart = textEndPoint();
			if (!await glideTo(textStart.x, textStart.y, 220, t)) return false;
			setCursorMode("text");
			if (!await typeText(QUERY, t)) return false;
			setCursorMode("pointer");
			removeClass(inputWrap, "typing");
			if (!await sleep(240, t)) return false;

			if (!await glideTo(840, 654, 520, t)) return false;
			if (!await pressButton(sendBtn, 840, 654, t)) return false;
			return await sleep(380, t);
		}

		async function run5(t) {
			setAct(5);
			setup5();
			if (RM) {
				addClass(metrics, "show");
				addClass(resultHead, "show");
				setText(mReturned, "100");
				setText(mTotal, "126");
				setText(mTrunc, "Yes");
				discCards.forEach(function (el) { addClass(el, "show"); });
				return true;
			}

			addClass(execStatus, "show");
			if (!await sleep(1500, t)) return false;
			removeClass(execStatus, "show");
			addClass(resultHead, "show");
			if (!await sleep(360, t)) return false;

			addClass(metrics, "show");
			addClass(metrics, "shimmer");
			var p1 = countUp(mReturned, 100, 720, t);
			var p2 = countUp(mTotal, 126, 820, t);
			if (!await p1) return false;
			if (!await p2) return false;
			setText(mTrunc, "Yes");
			if (!await sleep(140, t)) return false;

			for (var i = 0; i < discCards.length; i++) {
				addClass(discCards[i], "show");
				if (!await sleep(140, t)) return false;
			}
			/* Act 5 holds before the seamless reset. */
			return await sleep(4500, t);
		}

		var acts = [run1, run2, run3, run4, run5];

		/* ---------- Loop orchestration: one run at a time, fade always removed ---------- */

		async function loop(startAct, myToken) {
			var n = clampAct(startAct);
			running = true;
			try {
				while (myToken === token) {
					var ok = await acts[n - 1](myToken);
					if (!ok || myToken !== token) return;
					if (n < 5) {
						n++;
						continue;
					}

					fading = true;
					addClass(scene, "fade");
					try {
						if (!await sleep(460, myToken)) return;
						/* Reset while the stage is invisible: no flash or stale state. */
						clearRipples();
						removeClass(cursor, "press");
						removeClass(plusBtn, "press");
						removeClass(sendBtn, "press");
						resetAll();
						setAct(1);
					} finally {
						fading = false;
						removeClass(scene, "fade");
					}
					if (!await sleep(460, myToken)) return;
					n = 1;
				}
			} finally {
				if (myToken === token) running = false;
			}
		}

		var currentRun = null;

		function startLoop(startAct) {
			cancelAll();
			paused = false;
			if (cursor) cursor.style.display = "";
			if (ripples) ripples.style.display = "";
			removeClass(scene, "fade");
			updatePlayBtn();
			var myToken = token;
			currentRun = loop(startAct, myToken);
			currentRun.catch(function () {
				safeAct5Fallback();
			});
		}

		/* ---------- Reduced motion: static final frame, no timers running ---------- */

		function applyInstant(n) {
			var act = clampAct(n);
			resetAll();
			if (act === 1) {
				setText(inputText, QUERY);
				addClass(inputWrap, "has-text");
			} else if (act === 2) {
				addClass(composer, "docked");
				addClass(msgUser2, "show");
				addClass(msgAi2, "show");
			} else if (act === 3) {
				addClass(composer, "docked");
				addClass(msgUser2, "show");
				addClass(msgAi2, "show");
				addClass(chip, "on");
				addClass(toolToggle, "on");
				setAttr(toolToggle, "aria-checked", "true");
			} else if (act === 4) {
				addClass(composer, "docked");
				addClass(chip, "on");
				addClass(toolToggle, "on");
				setAttr(toolToggle, "aria-checked", "true");
				addClass(msgUser5, "show");
			} else {
				addClass(composer, "docked");
				addClass(chip, "on");
				addClass(toolToggle, "on");
				setAttr(toolToggle, "aria-checked", "true");
				addClass(msgUser5, "show");
				addClass(result, "show");
				addClass(resultHead, "show");
				addClass(metrics, "show");
				setText(mReturned, "100");
				setText(mTotal, "126");
				setText(mTrunc, "Yes");
				discCards.forEach(function (el) { addClass(el, "show"); });
			}
			setAct(act);
		}

		function rmLoop() {
			/* Static Act 5 frame. No clock, no pointer, no timers. */
			cancelAll();
			fading = false;
			paused = true;
			applyInstant(5);
			removeClass(scene, "fade");
			if (cursor) cursor.style.display = "none";
			if (ripples) ripples.style.display = "none";
			updatePlayBtn();
		}

		function applyMotionPreference() {
			if (RM) {
				rmLoop();
			} else {
				startLoop(1);
			}
		}

		/* ---------- Optional controls (listeners only when nodes exist) ---------- */

		function jumpTo(n) {
			var act = clampAct(n);
			if (RM) {
				cancelAll();
				paused = true;
				applyInstant(act);
				updatePlayBtn();
				return;
			}
			/* Single token increment happens inside startLoop(); no double increment. */
			startLoop(act);
		}

		stepBtns.forEach(function (b) {
			on(b, "click", function () {
				var act = readAct(b);
				if (act) jumpTo(act);
			});
		});

		if (playBtn) {
			on(playBtn, "click", function () {
				paused = !paused;
				updatePlayBtn();
				if (!paused && !RM && !running && !clock.raf) startLoop(currentAct);
			});
		}

		if (replayBtn) {
			on(replayBtn, "click", function () {
				startLoop(1);
			});
		}

		on(motionQuery, "change", function (event) {
			RM = !!(event && event.matches);
			applyMotionPreference();
		});

		on(copyBtn, "click", async function () {
			try {
				if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
					await navigator.clipboard.writeText(ENDPOINT);
				}
			} catch (err) {
				/* Clipboard may be unavailable; feedback is still shown. */
			}
			setText(endpointText, "Copied to clipboard");
			addClass(copyBtn, "copied");
			if (copyTimer !== null) window.clearTimeout(copyTimer);
			copyTimer = window.setTimeout(function () {
				setText(endpointText, ENDPOINT);
				removeClass(copyBtn, "copied");
				copyTimer = null;
			}, 1600);
		});

		/* ---------- Boot ---------- */

		reserveTypingSpace();
		[mReturned, mTotal, mTrunc].forEach(function (el) {
			if (el && el.style) el.style.fontVariantNumeric = "tabular-nums";
		});

		fitScene();
		if (frame && typeof ResizeObserver === "function") {
			try {
				new ResizeObserver(fitScene).observe(frame);
			} catch (err) {
				/* ResizeObserver is an enhancement only. */
			}
		}
		on(window, "resize", fitScene);

		updatePlayBtn();
		applyMotionPreference();
	}
})();
