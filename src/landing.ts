const CLAUDE_PATH = 'm4.714 15.956l4.718-2.648l.079-.23l-.08-.128h-.23l-.79-.048l-2.695-.073l-2.337-.097l-2.265-.122l-.57-.121l-.535-.704l.055-.353l.48-.321l.685.06l1.518.104l2.277.157l1.651.098l2.447.255h.389l.054-.158l-.133-.097l-.103-.098l-2.356-1.596l-2.55-1.688l-1.336-.972l-.722-.491L2 6.223l-.158-1.008l.656-.722l.88.06l.224.061l.893.686l1.906 1.476l2.49 1.833l.364.304l.146-.104l.018-.072l-.164-.274l-1.354-2.446l-1.445-2.49l-.644-1.032l-.17-.619a3 3 0 0 1-.103-.729L6.287.133L6.7 0l.995.134l.42.364l.619 1.415L9.735 4.14l1.555 3.03l.455.898l.243.832l.09.255h.159V9.01l.127-1.706l.237-2.095l.23-2.695l.08-.76l.376-.91l.747-.492l.583.28l.48.685l-.067.444l-.286 1.851l-.558 2.903l-.365 1.942h.213l.243-.242l.983-1.306l1.652-2.064l.728-.82l.85-.904l.547-.431h1.032l.759 1.129l-.34 1.166l-1.063 1.347l-.88 1.142l-1.263 1.7l-.79 1.36l.074.11l.188-.02l2.853-.606l1.542-.28l1.84-.315l.832.388l.09.395l-.327.807l-1.967.486l-2.307.462l-3.436.813l-.043.03l.049.061l1.548.146l.662.036h1.62l3.018.225l.79.522l.473.638l-.08.485l-1.213.62l-1.64-.389l-3.825-.91l-1.31-.329h-.183v.11l1.093 1.068l2.003 1.81l2.508 2.33l.127.578l-.321.455l-.34-.049l-2.204-1.657l-.85-.747l-1.925-1.62h-.127v.17l.443.649l2.343 3.521l.122 1.08l-.17.353l-.607.213l-.668-.122l-1.372-1.924l-1.415-2.168l-1.141-1.943l-.14.08l-.674 7.254l-.316.37l-.728.28l-.607-.461l-.322-.747l.322-1.476l.388-1.924l.316-1.53l.285-1.9l.17-.632l-.012-.042l-.14.018l-1.432 1.967l-2.18 2.945l-1.724 1.845l-.413.164l-.716-.37l.066-.662l.401-.589l2.386-3.036l1.439-1.882l.929-1.086l-.006-.158h-.055L4.138 18.56l-1.13.146l-.485-.456l.06-.746l.231-.243l1.907-1.312Z';

const PERPLEXITY_PATH = 'M22.398 7.09h-2.31V.068l-7.51 6.354V.158h-1.156v6.196L4.49 0v7.09H1.602v10.397H4.49V24l6.933-6.36v6.201h1.155v-6.047l6.932 6.181v-6.488h2.888zm-3.466-4.531v4.53h-5.355zm-13.286.067l4.869 4.464h-4.87zM2.758 16.332V8.245h7.847L4.49 14.36v1.972zm2.888 5.04v-6.534l5.776-5.776v7.011zm12.708.025l-5.776-5.15V9.061l5.776 5.776zm2.889-5.065H19.51V14.36l-6.115-6.115h7.848z';

const OPENAI_PATH = 'M22.282 9.821a6 6 0 0 0-.516-4.91a6.05 6.05 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a6 6 0 0 0-3.998 2.9a6.05 6.05 0 0 0 .743 7.097a5.98 5.98 0 0 0 .51 4.911a6.05 6.05 0 0 0 6.515 2.9A6 6 0 0 0 13.26 24a6.06 6.06 0 0 0 5.772-4.206a6 6 0 0 0 3.997-2.9a6.06 6.06 0 0 0-.747-7.073M13.26 22.43a4.48 4.48 0 0 1-2.876-1.04l.141-.081l4.779-2.758a.8.8 0 0 0 .392-.681v-6.737l2.02 1.168a.07.07 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494M3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085l4.783 2.759a.77.77 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646M2.34 7.896a4.5 4.5 0 0 1 2.366-1.973V11.6a.77.77 0 0 0 .388.677l5.815 3.354l-2.02 1.168a.08.08 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.08.08 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667m2.01-3.023l-.141-.085l-4.774-2.782a.78.78 0 0 0-.785 0L9.409 9.23V6.897a.07.07 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.8.8 0 0 0-.393.681zm1.097-2.365l2.602-1.5l2.607 1.5v2.999l-2.597 1.5l-2.607-1.5Z';

const GROK_PATH = 'M9.27 15.29l7.978-5.897c.391-.29.95-.177 1.137.272.98 2.369.542 5.215-1.41 7.169-1.951 1.954-4.667 2.382-7.149 1.406l-2.711 1.257c3.889 2.661 8.611 2.003 11.562-.953 2.341-2.344 3.066-5.539 2.388-8.42l.006.007c-.983-4.232.242-5.924 2.75-9.383.06-.082.12-.164.179-.248l-3.301 3.305v-.01L9.267 15.292M7.623 16.723c-2.792-2.67-2.31-6.801.071-9.184 1.761-1.763 4.647-2.483 7.166-1.425l2.705-1.25a7.808 7.808 0 00-1.829-1A8.975 8.975 0 005.984 5.83c-2.533 2.536-3.33 6.436-1.962 9.764 1.022 2.487-.653 4.246-2.34 6.022-.599.63-1.199 1.259-1.682 1.925l7.62-6.815';

const CURSOR_PATH = 'M11.503.131 1.891 5.678a.84.84 0 0 0-.42.726v11.188c0 .3.162.575.42.724l9.609 5.55a1 1 0 0 0 .998 0l9.61-5.55a.84.84 0 0 0 .42-.724V6.404a.84.84 0 0 0-.42-.726L12.497.131a1.01 1.01 0 0 0-.996 0M2.657 6.338h18.55c.263 0 .43.287.297.515L12.23 22.918c-.062.107-.229.064-.229-.06V12.335a.59.59 0 0 0-.295-.51l-9.11-5.257c-.109-.063-.064-.23.061-.23';

const VSCODE_PATH = 'M23.15 2.587L18.21.21a1.494 1.494 0 0 0-1.705.29l-9.46 8.63-4.12-3.128a.999.999 0 0 0-1.276.057L.327 7.261A1 1 0 0 0 .326 8.74L3.899 12 .326 15.26a1 1 0 0 0 .001 1.479L1.65 17.94a.999.999 0 0 0 1.276.057l4.12-3.128 9.46 8.63a1.492 1.492 0 0 0 1.704.29l4.942-2.377A1.5 1.5 0 0 0 24 20.06V3.939a1.5 1.5 0 0 0-.85-1.352zm-5.146 14.861L10.826 12l7.178-5.448v10.896z';

const WINDSURF_PATH = 'M23.55 5.067c-1.2038-.002-2.1806.973-2.1806 2.1765v4.8676c0 .972-.8035 1.7594-1.7597 1.7594-.568 0-1.1352-.286-1.4718-.7659l-4.9713-7.1003c-.4125-.5896-1.0837-.941-1.8103-.941-1.1334 0-2.1533.9635-2.1533 2.153v4.8957c0 .972-.7969 1.7594-1.7596 1.7594-.57 0-1.1363-.286-1.4728-.7658L.4076 5.1598C.2822 4.9798 0 5.0688 0 5.2882v4.2452c0 .2147.0656.4228.1884.599l5.4748 7.8183c.3234.462.8006.8052 1.3509.9298 1.3771.313 2.6446-.747 2.6446-2.0977v-4.893c0-.972.7875-1.7593 1.7596-1.7593h.003a1.798 1.798 0 0 1 1.4718.7658l4.9723 7.0994c.4135.5905 1.05.941 1.8093.941 1.1587 0 2.1515-.9645 2.1515-2.153v-4.8948c0-.972.7875-1.7594 1.7596-1.7594h.194a.22.22 0 0 0 .2204-.2202v-4.622a.22.22 0 0 0-.2203-.2203Z';

const COPILOT_PATH = 'M23.922 16.997C23.061 18.492 18.063 22.02 12 22.02 5.937 22.02.939 18.492.078 16.997A.641.641 0 0 1 0 16.741v-2.869a.883.883 0 0 1 .053-.22c.372-.935 1.347-2.292 2.605-2.656.167-.429.414-1.055.644-1.517a10.098 10.098 0 0 1-.052-1.086c0-1.331.282-2.499 1.132-3.368.397-.406.89-.717 1.474-.952C7.255 2.937 9.248 1.98 11.978 1.98c2.731 0 4.767.957 6.166 2.093.584.235 1.077.546 1.474.952.85.869 1.132 2.037 1.132 3.368 0 .368-.014.733-.052 1.086.23.462.477 1.088.644 1.517 1.258.364 2.233 1.721 2.605 2.656a.841.841 0 0 1 .053.22v2.869a.641.641 0 0 1-.078.256Zm-11.75-5.992h-.344a4.359 4.359 0 0 1-.355.508c-.77.947-1.918 1.492-3.508 1.492-1.725 0-2.989-.359-3.782-1.259a2.137 2.137 0 0 1-.085-.104L4 11.746v6.585c1.435.779 4.514 2.179 8 2.179 3.486 0 6.565-1.4 8-2.179v-6.585l-.098-.104s-.033.045-.085.104c-.793.9-2.057 1.259-3.782 1.259-1.59 0-2.738-.545-3.508-1.492a4.359 4.359 0 0 1-.355-.508Zm2.328 3.25c.549 0 1 .451 1 1v2c0 .549-.451 1-1 1-.549 0-1-.451-1-1v-2c0-.549.451-1 1-1Zm-5 0c.549 0 1 .451 1 1v2c0 .549-.451 1-1 1-.549 0-1-.451-1-1v-2c0-.549.451-1 1-1Zm3.313-6.185c.136 1.057.403 1.913.878 2.497.442.544 1.134.938 2.344.938 1.573 0 2.292-.337 2.657-.751.384-.435.558-1.15.558-2.361 0-1.14-.243-1.847-.705-2.319-.477-.488-1.319-.862-2.824-1.025-1.487-.161-2.192.138-2.533.529-.269.307-.437.808-.438 1.578v.021c0 .265.021.562.063.893Zm-1.626 0c.042-.331.063-.628.063-.894v-.02c-.001-.77-.169-1.271-.438-1.578-.341-.391-1.046-.69-2.533-.529-1.505.163-2.347.537-2.824 1.025-.462.472-.705 1.179-.705 2.319 0 1.211.175 1.926.558 2.361.365.414 1.084.751 2.657.751 1.21 0 1.902-.394 2.344-.938.475-.584.742-1.44.878-2.497Z';

const CLAUDECODE_PATH = 'M21 10.5h3v3h-3v3h-1.5v3H18v-3h-1.5v3H15v-3H9v3H7.5v-3H6v3H4.5v-3H3v-3H0v-3h3v-6h18Zm-15 0h1.5v-3H6Zm10.5 0H18v-3h-1.5z';

const GEMINI_PATH = 'M11.04 19.32Q12 21.51 12 24q0-2.49.93-4.68.96-2.19 2.58-3.81t3.81-2.55Q21.51 12 24 12q-2.49 0-4.68-.93a12.3 12.3 0 0 1-3.81-2.58 12.3 12.3 0 0 1-2.58-3.81Q12 2.49 12 0q0 2.49-.96 4.68-.93 2.19-2.55 3.81a12.3 12.3 0 0 1-3.81 2.58Q2.49 12 0 12q2.49 0 4.68.96 2.19.93 3.81 2.55t2.55 3.81';

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
  main { max-width:48rem; margin:0 auto; padding:var(--s12) var(--s4) 64px; }
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
  .clients { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(auto-fit,minmax(108px,1fr)); gap:var(--s2); align-items:start; }
  .clients details { border:1px solid var(--border); border-radius:var(--r); background:var(--surface); min-width:0; aspect-ratio:1 / 1; display:flex; flex-direction:column; }
  .clients details[open] { aspect-ratio:auto; }
  .clients summary { position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px; flex:1; padding:var(--s2); cursor:pointer; list-style:none; text-align:center; }
  .clients summary::-webkit-details-marker { display:none; }
  @media (hover:hover) { .clients summary:hover { background:var(--surface-hover); } }
  .logo { width:22px; height:22px; flex:none; }
  .logo-vscode { color:#007ACC; }
  .client-name { font-weight:600; font-size:.8125rem; }
  .client-meta { color:var(--muted); font-size:.625rem; }
  .steps { margin:0; padding:0 var(--s3) var(--s4); color:var(--muted); font-size:.8125rem; border-top:1px solid var(--border); }
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
        <details>
          <summary>${logo(CLAUDECODE_PATH)}<span class="client-name">Claude Code</span><span class="client-meta">CLI</span></summary>
          <ol class="steps">
            <li>Run <code>claude mcp add --transport http adityahq https://server.adityahq.me/mcp</code>.</li>
            <li>Add <code>--scope user</code> to share it across projects.</li>
            <li>Verify with <code>claude mcp list</code>, then list tools in a session.</li>
          </ol>
        </details>
      </li>
      <li>
        <details>
          <summary>${logo(CURSOR_PATH)}<span class="client-name">Cursor</span><span class="client-meta">Editor</span></summary>
          <ol class="steps">
            <li>Open Customize → MCPs → Add to Cursor, or edit <code>~/.cursor/mcp.json</code>.</li>
            <li>Add <code>{ "mcpServers": { "adityahq": { "url": "https://server.adityahq.me/mcp" } } }</code>.</li>
            <li>Restart Cursor and manage the server from Customize → MCPs.</li>
          </ol>
        </details>
      </li>
      <li>
        <details>
          <summary>${logo(VSCODE_PATH, 'logo-vscode')}<span class="client-name">VS Code</span><span class="client-meta">Editor</span></summary>
          <ol class="steps">
            <li>Run Chat: Open Customizations → MCP Servers → Add Server → HTTP.</li>
            <li>Enter the endpoint URL and a unique ID, then save to Copilot Global.</li>
            <li>Or add <code>{ "servers": { "adityahq": { "type": "http", "url": "https://server.adityahq.me/mcp" } } }</code> to <code>.vscode/mcp.json</code>.</li>
          </ol>
        </details>
      </li>
      <li>
        <details>
          <summary>${logo(WINDSURF_PATH)}<span class="client-name">Windsurf</span><span class="client-meta">Editor</span></summary>
          <ol class="steps">
            <li>Open Settings → Tools → Windsurf Settings → Add Server.</li>
            <li>Add <code>{ "mcpServers": { "adityahq": { "url": "https://server.adityahq.me/mcp" } } }</code> to your MCP config.</li>
            <li>Refresh the server list to expose its tools.</li>
          </ol>
        </details>
      </li>
      <li>
        <details>
          <summary>${logo(COPILOT_PATH)}<span class="client-name">GitHub Copilot</span><span class="client-meta">VS Code</span></summary>
          <ol class="steps">
            <li>With Copilot selected, open Chat: Open Customizations → MCP Servers → Add Server → HTTP.</li>
            <li>Enter the endpoint URL and save to Copilot Global.</li>
            <li>Verify with a tool call. An eligible Copilot session and org policy may be required.</li>
          </ol>
        </details>
      </li>
      <li>
        <details>
          <summary>${logo(GROK_PATH)}<span class="client-name">Grok</span><span class="client-meta">Web connector</span></summary>
          <ol class="steps">
            <li>Open <code>grok.com/connectors</code> → New Connector → Custom.</li>
            <li>Paste the endpoint URL and save; tools are discovered automatically.</li>
            <li>Business and Enterprise workspaces need an admin to provision connectors first.</li>
          </ol>
        </details>
      </li>
      <li>
        <details>
          <summary>${logo(GEMINI_PATH)}<span class="client-name">Gemini CLI</span><span class="client-meta">CLI</span></summary>
          <ol class="steps">
            <li>Run <code>gemini mcp add -s user --transport http adityahq https://server.adityahq.me/mcp</code>.</li>
            <li>Or set <code>httpUrl</code> in <code>~/.gemini/settings.json</code> — <code>url</code> means SSE.</li>
            <li>Verify with <code>gemini mcp list</code>. Availability depends on your Google plan.</li>
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
