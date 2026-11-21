#!/usr/bin/env node
// Dependency-free MCP Streamable HTTP smoke harness (plain `node scripts/smoke.mjs`).
// Speaks JSON-RPC over HTTP directly, the same way MCP Inspector does.

const BASE = (process.env.MCP_URL || process.argv[2] || "http://localhost:8787").replace(/\/+$/, "");
const ENDPOINT = `${BASE}/mcp`;
const HEALTH = `${BASE}/health`;
const TIMEOUT_MS = 15_000;

let sessionId = null;
let nextId = 1;
let checks = 0;
const failures = [];

function check(label, condition, detail = "") {
	checks += 1;
	if (condition) {
		console.log(`[ok]   ${label}`);
	} else {
		const suffix = detail ? ` -- ${detail}` : "";
		console.log(`[FAIL] ${label}${suffix}`);
		failures.push(`${label}${suffix}`);
	}
}

function info(label, value) {
	console.log(`[info] ${label}: ${value}`);
}

// Negative check: these needles must never appear in the advertised tool metadata.
const FORBIDDEN_TOOL_TOKENS = ["crt.sh", "crt", "output=json", "quota", "429", "provider", "source"];
const FORBIDDEN_DATA_KEYS = ["source", "provider", "url", "upstream", "quota", "status"];

function parseSse(text, expectedId) {
	const messages = [];
	let buffer = [];
	const flush = () => {
		if (buffer.length === 0) return;
		const payload = buffer.join("\n");
		buffer = [];
		try {
			const parsed = JSON.parse(payload);
			if (parsed && typeof parsed === "object") messages.push(parsed);
		} catch {
			// Ignore non-JSON events (heartbeats/comments, etc.).
		}
	};
	for (const line of text.split(/\r?\n/)) {
		if (line === "") {
			flush();
			continue;
		}
		if (line.startsWith("data:")) {
			let value = line.slice(5);
			if (value.startsWith(" ")) value = value.slice(1);
			buffer.push(value);
		}
		// Ignore event:, id:, retry: and comment lines.
	}
	flush();

	for (const message of messages) {
		if (message.id === expectedId && ("result" in message || "error" in message)) return message;
	}
	for (const message of messages) {
		if ("result" in message) return message;
	}
	return messages.length ? messages[messages.length - 1] : null;
}

async function request(url, init) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		return await fetch(url, { ...init, signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

async function rpc(method, params, { sessionId: explicitSessionId, notification = false } = {}) {
	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json, text/event-stream",
	};
	const sid = explicitSessionId === undefined ? sessionId : explicitSessionId;
	if (sid) headers["Mcp-Session-Id"] = sid;

	const body = { jsonrpc: "2.0", method };
	if (!notification) body.id = nextId++;
	if (params !== undefined) body.params = params;

	const res = await request(ENDPOINT, {
		method: "POST",
		headers,
		body: JSON.stringify(body),
	});

	const returnedSessionId = res.headers.get("mcp-session-id");
	if (returnedSessionId) sessionId = returnedSessionId;

	const contentType = (res.headers.get("content-type") || "").toLowerCase();
	const text = await res.text();
	let message = null;
	if (contentType.includes("text/event-stream")) {
		message = parseSse(text, body.id);
	} else if (text.trim()) {
		try {
			message = JSON.parse(text);
		} catch {
			message = null;
		}
	}

	return { status: res.status, ok: res.ok, message, sessionId: returnedSessionId };
}

function extractText(result) {
	const content = result?.content;
	if (!Array.isArray(content)) return undefined;
	const item = content.find((x) => x && x.type === "text" && typeof x.text === "string");
	return item?.text;
}

function parseToolData(result) {
	const text = extractText(result);
	if (typeof text !== "string") return null;
	try {
		const data = JSON.parse(text);
		return data && typeof data === "object" ? data : null;
	} catch {
		return null;
	}
}

function isSorted(list) {
	return list.every((value, index) => index === 0 || list[index - 1] <= value);
}

async function callTool(domain) {
	return rpc("tools/call", { name: "list_subdomains", arguments: { domain } });
}

async function main() {
	info("base", BASE);
	info("endpoint", ENDPOINT);

	// 1. Health
	console.log("[step] health");
	const healthRes = await request(HEALTH, { method: "GET" });
	const healthBody = await healthRes.text();
	check("health status is 200", healthRes.status === 200, `got ${healthRes.status}`);
	check("health body is exactly ok", healthBody === "ok", `got ${JSON.stringify(healthBody)}`);

	// 2. Initialize
	console.log("[step] initialize");
	const init = await rpc("initialize", {
		protocolVersion: "2025-06-18",
		capabilities: {},
		clientInfo: { name: "smoke", version: "1.0.0" },
	});
	check("initialize HTTP 2xx", init.ok, `status ${init.status}`);
	const initResult = init.message?.result;
	check("initialize returns a result", !!initResult, init.message?.error ? JSON.stringify(init.message.error) : "no result");
	check("initialize protocolVersion present", typeof initResult?.protocolVersion === "string" && initResult.protocolVersion.length > 0, `got ${JSON.stringify(initResult?.protocolVersion)}`);
	check("initialize capabilities present", !!initResult?.capabilities && typeof initResult.capabilities === "object", `got ${JSON.stringify(initResult?.capabilities)}`);
	info("session id", init.sessionId ? "captured" : "not provided by server (stateless)");

	// 3. Initialized notification
	console.log("[step] notifications/initialized");
	const ready = await rpc("notifications/initialized", {}, { notification: true });
	check("initialized notification HTTP 2xx", ready.ok, `status ${ready.status}`);

	// 4. tools/list
	console.log("[step] tools/list");
	const listed = await rpc("tools/list", {});
	check("tools/list HTTP 2xx", listed.ok, `status ${listed.status}`);
	const tools = listed.message?.result?.tools;
	check("tools/list returns a tools array", Array.isArray(tools), `got ${JSON.stringify(listed.message?.error ?? null)}`);
	check("exactly one tool advertised", Array.isArray(tools) && tools.length === 1, `got ${Array.isArray(tools) ? tools.length : "n/a"}`);
	const tool = Array.isArray(tools) ? tools[0] : undefined;
	check("tool name is list_subdomains", tool?.name === "list_subdomains", `got ${JSON.stringify(tool?.name)}`);
	const toolJson = JSON.stringify(tool ?? {}).toLowerCase();
	const toolHits = FORBIDDEN_TOOL_TOKENS.filter((token) => toolJson.includes(token));
	check("tool metadata contains no forbidden tokens", toolHits.length === 0, `found ${toolHits.length} forbidden token(s)`);
	info("tool name", tool?.name);
	info("tool annotations", JSON.stringify(tool?.annotations ?? null));
	info("tool description", tool?.description);

	// 5. First tool call (cache miss)
	console.log("[step] tools/call adityahq.me (first)");
	const first = await callTool("adityahq.me");
	check("first call HTTP 2xx", first.ok, `status ${first.status}`);
	const firstResult = first.message?.result;
	check("first call returns a result", !!firstResult, first.message?.error ? JSON.stringify(first.message.error) : "no result");
	check("first call is not an error", firstResult?.isError !== true, `text=${JSON.stringify(extractText(firstResult))}`);
	check("first content[0] is text", firstResult?.content?.[0]?.type === "text", `got ${JSON.stringify(firstResult?.content?.[0]?.type)}`);
	const firstData = parseToolData(firstResult);
	check("first text parses as JSON object", !!firstData, `text=${JSON.stringify(extractText(firstResult))}`);

	let firstSubs = [];
	if (firstData) {
		firstSubs = Array.isArray(firstData.subdomains) ? firstData.subdomains : [];
		check("domain is adityahq.me", firstData.domain === "adityahq.me", `got ${JSON.stringify(firstData.domain)}`);
		check("subdomains is an array", Array.isArray(firstData.subdomains), `got ${typeof firstData.subdomains}`);
		check("subdomains are sorted", isSorted(firstSubs), "array is not lexicographically sorted");
		check("count equals subdomains length", firstData.count === firstSubs.length, `count=${firstData.count} length=${firstSubs.length}`);
		check("total_seen >= count", typeof firstData.total_seen === "number" && firstData.total_seen >= firstData.count, `total_seen=${firstData.total_seen} count=${firstData.count}`);
		check("truncated is boolean", typeof firstData.truncated === "boolean", `got ${typeof firstData.truncated}`);
		check("cached is false on first call", firstData.cached === false, `got ${JSON.stringify(firstData.cached)}`);
		check("note is a string", typeof firstData.note === "string", `got ${typeof firstData.note}`);
		const badKeys = Object.keys(firstData).filter((key) => FORBIDDEN_DATA_KEYS.includes(key.toLowerCase()));
		check("result has no forbidden keys", badKeys.length === 0, `found ${badKeys.length} forbidden key(s)`);
		check("includes apex domain", firstSubs.includes("adityahq.me"), `got ${JSON.stringify(firstSubs)}`);
		check("includes www subdomain", firstSubs.includes("www.adityahq.me"), `got ${JSON.stringify(firstSubs)}`);
	}
	info("first result", JSON.stringify(firstData, null, 2));

	// 6. Second tool call (cache hit)
	console.log("[step] tools/call adityahq.me (second)");
	const second = await callTool("adityahq.me");
	check("second call HTTP 2xx", second.ok, `status ${second.status}`);
	const secondResult = second.message?.result;
	check("second call is not an error", secondResult?.isError !== true, `text=${JSON.stringify(extractText(secondResult))}`);
	const secondData = parseToolData(secondResult);
	check("second text parses as JSON object", !!secondData, `text=${JSON.stringify(extractText(secondResult))}`);
	if (secondData) {
		check("cached is true on second call", secondData.cached === true, `got ${JSON.stringify(secondData.cached)}`);
		check("second subdomains identical to first", JSON.stringify(secondData.subdomains) === JSON.stringify(firstSubs), `first=${JSON.stringify(firstSubs)} second=${JSON.stringify(secondData.subdomains)}`);
	}
	info("second result", JSON.stringify(secondData, null, 2));

	// 7. Rejected inputs
	console.log("[step] rejected inputs");
	const rejected = [
		"https://adityahq.me/mcp",
		"localhost",
		"127.0.0.1",
		"portfolio.adityahq.me",
		"www.example.co.uk",
	];
	const subdomainCases = new Set(["portfolio.adityahq.me", "www.example.co.uk"]);
	for (const domain of rejected) {
		const response = await callTool(domain);
		const result = response.message?.result;
		const text = extractText(result);
		check(`reject ${domain}: HTTP 2xx`, response.ok, `status ${response.status}`);
		check(`reject ${domain}: isError true`, result?.isError === true, `text=${JSON.stringify(text)}`);
		if (subdomainCases.has(domain)) {
			check(
				`reject ${domain}: apex-domain guidance`,
				typeof text === "string" && text.startsWith("Pass the apex domain"),
				`text=${JSON.stringify(text)}`
			);
		}
		info("rejected", `${domain} | isError=${result?.isError} | text=${JSON.stringify(text)}`);
	}

	// 8. Single leading-www exception
	console.log("[step] tools/call www.adityahq.me");
	const www = await callTool("www.adityahq.me");
	check("www call HTTP 2xx", www.ok, `status ${www.status}`);
	const wwwResult = www.message?.result;
	check("www call is not an error", wwwResult?.isError !== true, `text=${JSON.stringify(extractText(wwwResult))}`);
	const wwwData = parseToolData(wwwResult);
	check("www text parses as JSON object", !!wwwData, `text=${JSON.stringify(extractText(wwwResult))}`);
	if (wwwData) {
		check("www input normalizes to apex domain", wwwData.domain === "adityahq.me", `got ${JSON.stringify(wwwData.domain)}`);
	}
	info("www result", JSON.stringify(wwwData, null, 2));
}

try {
	await main();
} catch (err) {
	const message = err?.message || String(err);
	console.error(`[FAIL] transport/unexpected error: ${message}`);
	failures.push(`transport/unexpected error: ${message}`);
}

if (failures.length === 0) {
	console.log(`SMOKE PASS (${checks} checks)`);
	process.exit(0);
} else {
	console.log(`SMOKE FAIL (${failures.length} failures)`);
	process.exit(1);
}
