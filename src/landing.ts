export const LANDING_HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>subdomain-index — MCP server</title>
<style>
  :root { color-scheme: light; --ink:#111827; --muted:#6b7280; --line:#e5e7eb; --bg:#f9fafb; --accent:#2563eb; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  main { max-width:780px; margin:0 auto; padding:48px 20px 64px; }
  .badge { display:inline-block; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:var(--muted); border:1px solid var(--line); border-radius:999px; padding:4px 10px; }
  h1 { font-size:30px; margin:16px 0 6px; letter-spacing:-.02em; }
  .sub { color:var(--muted); margin:0 0 28px; }
  .card { background:#fff; border:1px solid var(--line); border-radius:12px; padding:20px; margin:0 0 18px; }
  h2 { font-size:15px; margin:0 0 14px; }
  dl { display:grid; grid-template-columns:130px 1fr; gap:8px 12px; margin:0; }
  dt { color:var(--muted); }
  dd { margin:0; word-break:break-all; }
  code { font:13px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace; background:#f3f4f6; padding:2px 6px; border-radius:5px; }
  .row { display:flex; gap:10px; flex-wrap:wrap; margin-top:18px; }
  a.btn, button { font:inherit; cursor:pointer; border:1px solid var(--line); background:#fff; color:var(--ink); border-radius:8px; padding:9px 14px; text-decoration:none; }
  a.btn.primary { background:var(--accent); border-color:var(--accent); color:#fff; }
  .note { color:var(--muted); font-size:13px; margin:14px 0 0; }
  .clients { display:grid; gap:14px; }
  .client { border-top:1px solid var(--line); padding-top:14px; }
  .client:first-child { border-top:0; padding-top:0; }
  .client b { display:block; margin-bottom:4px; }
  .client span { color:var(--muted); font-size:14px; }
  pre { white-space:pre-wrap; word-break:break-word; background:#f3f4f6; border-radius:8px; padding:12px 14px; margin:0; font:13px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace; }
  footer { color:var(--muted); font-size:13px; margin-top:28px; }
  footer a { color:var(--accent); }
</style>
</head>
<body>
<main>
  <span class="badge">Remote MCP server · read only</span>
  <h1>subdomain-index</h1>
  <p class="sub">One tool, <code>list_subdomains</code>, for publicly indexed names of a single apex domain.</p>

  <section class="card">
    <h2>Connection</h2>
    <dl>
      <dt>Server URL</dt><dd><code id="url">https://server.adityahq.me/mcp</code></dd>
      <dt>Transport</dt><dd>Streamable HTTP</dd>
      <dt>Authentication</dt><dd>None</dd>
      <dt>Tools</dt><dd>1 — <code>list_subdomains</code></dd>
    </dl>
    <div class="row">
      <a class="btn primary" href="https://server.adityahq.me/mcp">Open MCP endpoint</a>
      <button id="copy" type="button">Copy server URL</button>
      <a class="btn" href="https://server.adityahq.me/health">Health</a>
    </div>
    <p class="note">The endpoint speaks MCP over HTTP POST. Opening it in a browser is not a connection test.</p>
  </section>

  <section class="card">
    <h2>Connect from an MCP client</h2>
    <div class="clients">
      <div class="client">
        <b>MCP Inspector</b>
        <span>Run <code>npx @modelcontextprotocol/inspector@latest</code>, choose Streamable HTTP, enter the server URL, then List tools.</span>
      </div>
      <div class="client">
        <b>Claude</b>
        <span>Settings → Connectors → Add custom connector → enter the remote URL → no sign-in. Free plan allows one custom connector.</span>
      </div>
      <div class="client">
        <b>Perplexity</b>
        <span>Settings or Plugins → add a custom MCP connector → Streamable HTTP → authentication none. The control may be plan-dependent.</span>
      </div>
      <div class="client">
        <b>ChatGPT (web)</b>
        <span>Plugins → add a custom MCP server → server URL → no authentication → create as a plugin, then mention it with @.</span>
      </div>
    </div>
    <p class="note">These are client-side steps. Availability depends on your plan and client version.</p>
  </section>

  <section class="card">
    <h2>Demo prompt</h2>
    <pre>Use list_subdomains on example.com. Return the tool result only. Do not guess extra names.</pre>
  </section>

  <footer>
    Source: <a href="https://github.com/aditya-c7/mcp-server">github.com/aditya-c7/mcp-server</a>
  </footer>
</main>
<script>
document.getElementById('copy').addEventListener('click', function () {
  var text = document.getElementById('url').textContent;
  if (navigator.clipboard) { navigator.clipboard.writeText(text); }
  this.textContent = 'Copied';
  var self = this;
  setTimeout(function () { self.textContent = 'Copy server URL'; }, 1500);
});
</script>
</body>
</html>`;
