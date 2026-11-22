const CLAUDE_PATH = 'm4.714 15.956l4.718-2.648l.079-.23l-.08-.128h-.23l-.79-.048l-2.695-.073l-2.337-.097l-2.265-.122l-.57-.121l-.535-.704l.055-.353l.48-.321l.685.06l1.518.104l2.277.157l1.651.098l2.447.255h.389l.054-.158l-.133-.097l-.103-.098l-2.356-1.596l-2.55-1.688l-1.336-.972l-.722-.491L2 6.223l-.158-1.008l.656-.722l.88.06l.224.061l.893.686l1.906 1.476l2.49 1.833l.364.304l.146-.104l.018-.072l-.164-.274l-1.354-2.446l-1.445-2.49l-.644-1.032l-.17-.619a3 3 0 0 1-.103-.729L6.287.133L6.7 0l.995.134l.42.364l.619 1.415L9.735 4.14l1.555 3.03l.455.898l.243.832l.09.255h.159V9.01l.127-1.706l.237-2.095l.23-2.695l.08-.76l.376-.91l.747-.492l.583.28l.48.685l-.067.444l-.286 1.851l-.558 2.903l-.365 1.942h.213l.243-.242l.983-1.306l1.652-2.064l.728-.82l.85-.904l.547-.431h1.032l.759 1.129l-.34 1.166l-1.063 1.347l-.88 1.142l-1.263 1.7l-.79 1.36l.074.11l.188-.02l2.853-.606l1.542-.28l1.84-.315l.832.388l.09.395l-.327.807l-1.967.486l-2.307.462l-3.436.813l-.043.03l.049.061l1.548.146l.662.036h1.62l3.018.225l.79.522l.473.638l-.08.485l-1.213.62l-1.64-.389l-3.825-.91l-1.31-.329h-.183v.11l1.093 1.068l2.003 1.81l2.508 2.33l.127.578l-.321.455l-.34-.049l-2.204-1.657l-.85-.747l-1.925-1.62h-.127v.17l.443.649l2.343 3.521l.122 1.08l-.17.353l-.607.213l-.668-.122l-1.372-1.924l-1.415-2.168l-1.141-1.943l-.14.08l-.674 7.254l-.316.37l-.728.28l-.607-.461l-.322-.747l.322-1.476l.388-1.924l.316-1.53l.285-1.9l.17-.632l-.012-.042l-.14.018l-1.432 1.967l-2.18 2.945l-1.724 1.845l-.413.164l-.716-.37l.066-.662l.401-.589l2.386-3.036l1.439-1.882l.929-1.086l-.006-.158h-.055L4.138 18.56l-1.13.146l-.485-.456l.06-.746l.231-.243l1.907-1.312Z';

const PERPLEXITY_PATH = 'M22.398 7.09h-2.31V.068l-7.51 6.354V.158h-1.156v6.196L4.49 0v7.09H1.602v10.397H4.49V24l6.933-6.36v6.201h1.155v-6.047l6.932 6.181v-6.488h2.888zm-3.466-4.531v4.53h-5.355zm-13.286.067l4.869 4.464h-4.87zM2.758 16.332V8.245h7.847L4.49 14.36v1.972zm2.888 5.04v-6.534l5.776-5.776v7.011zm12.708.025l-5.776-5.15V9.061l5.776 5.776zm2.889-5.065H19.51V14.36l-6.115-6.115h7.848z';

const OPENAI_PATH = 'M22.282 9.821a6 6 0 0 0-.516-4.91a6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9a6.05 6.05 0 0 0 .743 7.097a5.98 5.98 0 0 0 .51 4.911a6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206a6 6 0 0 0 3.997-2.9a6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081l4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085l4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354l-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023l-.141-.085l-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365l2.602-1.5l2.607 1.5v2.999l-2.597 1.5l-2.607-1.5Z';

const MCP_PATH = 'M13.85 0a4.16 4.16 0 0 0-2.95 1.217L1.456 10.66a.835.835 0 0 0 0 1.18a.835.835 0 0 0 1.18 0l9.442-9.442a2.49 2.49 0 0 1 3.541 0a2.49 2.49 0 0 1 0 3.541L8.59 12.97l-.1.1a.835.835 0 0 0 0 1.18a.835.835 0 0 0 1.18 0l.1-.098l7.03-7.034a2.49 2.49 0 0 1 3.542 0l.049.05a2.49 2.49 0 0 1 0 3.54l-8.54 8.54a1.96 1.96 0 0 0 0 2.755l1.753 1.753a.835.835 0 0 0 1.18 0a.835.835 0 0 0 0-1.18l-1.753-1.753a.266.266 0 0 1 0-.394l8.54-8.54a4.185 4.185 0 0 0 0-5.9l-.05-.05a4.16 4.16 0 0 0-2.95-1.218c-.2 0-.401.02-.6.048a4.17 4.17 0 0 0-1.17-3.552A4.16 4.16 0 0 0 13.85 0m0 3.333a.84.84 0 0 0-.59.245L6.275 10.56a4.186 4.186 0 0 0 0 5.902a4.186 4.186 0 0 0 5.902 0L19.16 9.48a.835.835 0 0 0 0-1.18a.835.835 0 0 0-1.18 0l-6.985 6.984a2.49 2.49 0 0 1-3.54 0a2.49 2.49 0 0 1 0-3.54l6.983-6.985a.835.835 0 0 0 0-1.18a.84.84 0 0 0-.59-.245';

function logo(path: string, className = ''): string {
	return '<svg class="logo ' + className + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + path + '"/></svg>';
}

const CLI_COMMAND = 'npx -y @modelcontextprotocol/inspector --server-url https://server.adityahq.me/mcp --transport http';

export const LANDING_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>subdomain-index — MCP server</title>
<style>
  :root {
    color-scheme: light dark;
    --bg:#ffffff; --surface:#ffffff; --surface-hover:#f9fafb;
    --text:#111827; --muted:#4b5563; --border:#e5e7eb; --border-strong:#6b7280;
    --accent:#2563eb; --accent-soft:#eff6ff; --shadow:0 1px 2px rgb(16 24 40 / .05);
    --font:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
    --mono:ui-monospace,"Cascadia Code",SFMono-Regular,Menlo,Consolas,monospace;
    --r:8px; --s2:8px; --s3:12px; --s4:16px; --s6:24px; --s8:32px; --s12:48px;
    --highlight:inset 0 1px 0 rgba(255,255,255,.06);
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg:#0d1117; --surface:#0d1117; --surface-hover:#161b22;
      --text:#e6edf3; --muted:#8b949e; --border:#30363d; --border-strong:#8b949e;
      --accent:#58a6ff; --accent-soft:#111d2e; --shadow:none;
    }
  }
  * { box-sizing:border-box; }
  html { font:400 16px/1.5 var(--font); }
  body { margin:0; background:var(--bg); color:var(--text); }
  main { max-width:42rem; margin:0 auto; padding:var(--s12) var(--s4) 64px; }
  h1 { font-size:1.75rem; line-height:1.25; font-weight:600; margin:var(--s3) 0 var(--s2); }
  h2 { font-size:1.125rem; line-height:1.35; font-weight:600; margin:0 0 var(--s4); }
  p { margin:0 0 var(--s4); }
  .sub { color:var(--muted); margin-bottom:var(--s12); }
  .card { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); box-shadow:var(--shadow), var(--highlight); padding:var(--s6); margin-bottom:var(--s6); }
  .badges { display:flex; flex-wrap:wrap; gap:var(--s2); margin:var(--s3) 0; }
  .badge { display:inline-flex; align-items:center; padding:3px 9px; border-radius:999px; border:1px solid var(--border); background:var(--surface); color:var(--muted); font:500 11px/1.4 var(--font); }
  .snippet { border:1px solid var(--border); border-radius:var(--r); background:var(--bg); overflow:hidden; box-shadow:var(--highlight); }
  .snippet__bar { display:flex; align-items:center; justify-content:space-between; gap:var(--s3); padding:var(--s2) var(--s3); border-bottom:1px solid var(--border); font-size:.75rem; color:var(--muted); }
  .snippet pre { margin:0; padding:var(--s3) var(--s4); overflow:auto; white-space:pre-wrap; word-break:break-word; }
  .field { margin-bottom:var(--s4); }
  code, pre { font-family:var(--mono); font-size:.9375rem; }
  button { font:inherit; cursor:pointer; color:var(--text); background:var(--surface); border:1px solid var(--border-strong); border-radius:var(--r); padding:var(--s2) var(--s3); white-space:nowrap; }
  button.copy { min-width:72px; text-align:center; }
  @media (hover:hover) { button:hover { background:var(--surface-hover); border-color:var(--accent); } }
  button.primary { background:var(--accent); border-color:var(--accent); color:#fff; }
  a { color:var(--accent); }
  :where(a,button,summary):focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  .note { font-size:.8125rem; color:var(--muted); margin:var(--s3) 0 0; }
  .clients { list-style:none; margin:0; padding:0; display:grid; gap:var(--s2); }
  .clients details { border:1px solid var(--border); border-radius:var(--r); background:var(--surface); }
  .clients summary { display:flex; align-items:center; gap:var(--s4); padding:var(--s3) var(--s4); cursor:pointer; min-height:44px; list-style:none; }
  .clients summary::-webkit-details-marker { display:none; }
  @media (hover:hover) { .clients summary:hover { background:var(--surface-hover); } }
  .clients summary:after { content:"+"; margin-left:auto; color:var(--muted); font-size:1.1rem; }
  .clients details[open] summary:after { content:"\\2212"; }
  .logo { width:24px; height:24px; flex:none; }
  .client-name { font-weight:600; }
  .client-meta { color:var(--muted); font-size:.8125rem; }
  .steps { margin:0; padding:var(--s4) var(--s4) var(--s6) 56px; color:var(--muted); font-size:.875rem; }
  .steps li { margin-bottom:var(--s2); }
  footer { color:var(--muted); font-size:.8125rem; border-top:1px solid var(--border); padding-top:var(--s4); margin-top:var(--s12); }
  .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); white-space:nowrap; border:0; }
  @media (prefers-reduced-motion: reduce) { *,*::before,*::after { animation-duration:.01ms !important; transition-duration:.01ms !important; scroll-behavior:auto !important; } }
</style>
</head>
<body>
<main>
  <div class="badges">
    <span class="badge">MCP server</span>
    <span class="badge">Read only</span>
    <span class="badge">No auth</span>
  </div>
  <h1>subdomain-index</h1>
  <p class="sub">One tool, <code>list_subdomains</code>, for publicly indexed names of a single apex domain.</p>

  <section class="card" aria-labelledby="connect-heading">
    <h2 id="connect-heading">Connect</h2>
    <div class="field">
      <div class="snippet">
        <div class="snippet__bar"><span>MCP endpoint · Streamable HTTP · no authentication</span><button type="button" class="copy primary" data-copy="server-url" aria-label="Copy MCP endpoint URL">Copy URL</button></div>
        <pre><code id="server-url">https://server.adityahq.me/mcp</code></pre>
      </div>
      <p class="note">Machine-to-machine endpoint. A browser GET returns 405; copy the URL into an MCP client.</p>
    </div>
    <div class="field">
      <div class="snippet">
        <div class="snippet__bar"><span>MCP Inspector · local</span><button type="button" class="copy" data-copy="inspector-cmd" aria-label="Copy MCP Inspector command">Copy</button></div>
        <pre><code id="inspector-cmd">${CLI_COMMAND}</code></pre>
      </div>
      <p class="note">Requires Node 22.23.4+, 24.22.1+, or 26.12.1+.</p>
    </div>
    <span id="copy-status" class="sr-only" role="status" aria-live="polite"></span>
  </section>

  <section class="card" aria-labelledby="clients-heading">
    <h2 id="clients-heading">Add this server to a client</h2>
    <p class="note" style="margin:0 0 var(--s4)">Published setup steps. Availability depends on your plan and client version; these are instructions, not a connection guarantee.</p>
    <ul class="clients">
      <li>
        <details>
          <summary>${logo(CLAUDE_PATH)}<span class="client-name">Claude</span><span class="client-meta">Custom connector</span></summary>
          <ol class="steps">
            <li>Open Customize → Connectors, then Add → Add custom connector.</li>
            <li>Enter a name and the endpoint URL above.</li>
            <li>Choose No sign-in under Authentication, then Add and Connect.</li>
            <li>Enable it for a chat from + → Connectors. Free plan allows one custom connector.</li>
          </ol>
        </details>
      </li>
      <li>
        <details>
          <summary>${logo(PERPLEXITY_PATH)}<span class="client-name">Perplexity</span><span class="client-meta">Custom MCP connector</span></summary>
          <ol class="steps">
            <li>Open Plugins → Add custom → Add MCP connector → Remote.</li>
            <li>Enter a name and the endpoint URL.</li>
            <li>Under Advanced set Authentication to None, Transport to Streamable HTTP, Network access to Public.</li>
            <li>Confirm and enable the connector. Org admins may need to allow custom connectors; some plans restrict them.</li>
          </ol>
        </details>
      </li>
      <li>
        <details>
          <summary>${logo(OPENAI_PATH)}<span class="client-name">ChatGPT</span><span class="client-meta">Custom MCP server</span></summary>
          <ol class="steps">
            <li>Open Plugins → + → Add custom MCP server.</li>
            <li>Enter a name and paste the endpoint URL under Connection.</li>
            <li>Acknowledge the warning, then Create as a plugin and review the tools.</li>
            <li>Start a new chat and mention the plugin with @. Custom MCP connections are plan- and web-limited.</li>
          </ol>
        </details>
      </li>
      <li>
        <details open>
          <summary>${logo(MCP_PATH)}<span class="client-name">MCP Inspector</span><span class="client-meta">Developer tool</span></summary>
          <ol class="steps">
            <li>Run the command above in a terminal.</li>
            <li>Open the printed local URL with its access token.</li>
            <li>Set transport to Streamable HTTP and the server URL to the endpoint above, then Connect.</li>
            <li>List tools; only <code>list_subdomains</code> should appear.</li>
          </ol>
        </details>
      </li>
    </ul>
  </section>

  <section class="card" aria-labelledby="demo-heading">
    <h2 id="demo-heading">Demo prompt</h2>
    <div class="snippet">
      <div class="snippet__bar"><span>Prompt</span><button type="button" class="copy" data-copy="prompt" aria-label="Copy demo prompt">Copy</button></div>
      <pre><code id="prompt">Use list_subdomains on example.com. Return the tool result only. Do not guess extra names.</code></pre>
    </div>
  </section>

  <footer>
    <p>Source: <a href="https://github.com/aditya-c7/mcp-server">github.com/aditya-c7/mcp-server</a> · <a href="https://server.adityahq.me/health">Health</a></p>
    <p>Client logos are trademarks of their respective owners, shown only to identify the clients.</p>
  </footer>
</main>
<script>
(function () {
  var status = document.getElementById('copy-status');
  Array.prototype.forEach.call(document.querySelectorAll('button[data-copy]'), function (button) {
    button.addEventListener('click', function () {
      var text = document.getElementById(button.getAttribute('data-copy')).textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          status.textContent = 'Copied to clipboard';
          button.textContent = 'Copied';
          setTimeout(function () { button.textContent = button.getAttribute('data-copy') === 'server-url' ? 'Copy URL' : 'Copy'; }, 2000);
        }, function () {
          status.textContent = 'Select the text and copy manually';
        });
      } else {
        status.textContent = 'Select the text and copy manually';
      }
    });
  });
})();
</script>
</body>
</html>`;
