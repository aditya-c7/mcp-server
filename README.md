# subdomain-index

Read-only MCP server that lists publicly indexed names for one apex domain. No authentication; Streamable HTTP transport.

- Public MCP URL: `https://server.adityahq.me/mcp`
- Tool: `list_subdomains`

## Tool: `list_subdomains`

Input:

```json
{
  "domain": "adityahq.me"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `domain` | `string` | yes | Single registrable apex domain, e.g. `adityahq.me`. |

Description returned to clients:

> List publicly indexed names for one apex domain.
> Pass only the registrable apex, such as example.com or adityahq.me.
> Not a URL, not a subdomain, not an IP.
> Results are indexed names only. Not a complete list.
> Not checked for whether they are online.
> On failure, say the lookup failed. Never invent names.

Results are lowercased, deduplicated, sorted, and capped at 100. Annotations: `readOnlyHint: true`, `openWorldHint: true`, `destructiveHint: false`.

Example response:

```json
{
  "domain": "adityahq.me",
  "count": 4,
  "total_seen": 4,
  "truncated": false,
  "subdomains": [
    "adityahq.me",
    "intel.adityahq.me",
    "portfolio.adityahq.me",
    "www.adityahq.me"
  ],
  "cached": false,
  "note": "Indexed names only. Not a complete list. Not checked if they are online."
}
```

## Local development

```sh
npm install
npm run dev
```

Local MCP endpoint: `http://localhost:8787/mcp`.

MCP Inspector:

```sh
npx @modelcontextprotocol/inspector@latest
```

1. Transport: Streamable HTTP.
2. URL: `http://localhost:8787/mcp`.
3. Connect, List tools: only `list_subdomains`; confirm its description and schema contain no lookup URL.
4. Call with `{"domain": "adityahq.me"}`, then call again: the second result has `cached: true`.

`GET /health` returns `ok` (liveness only).

## Checks

```sh
npx tsc --noEmit
node scripts/leak-scan.mjs
node scripts/smoke.mjs   # or: npm test
```

## Deploy

Cloudflare Workers Git build on push to `main` deploys the `mcp-server` Worker that owns the custom domain. No local `wrangler deploy`.

## Tested

Locally verified:

- MCP Inspector GUI connected to `http://localhost:8787/mcp`; protocol-level `tools/list` showed only `list_subdomains` (smoke harness).
- `node scripts/smoke.mjs`: SMOKE PASS (49 checks) — health, initialize, `tools/list`, `cached: false` then `cached: true`, rejection cases (URL, localhost, raw IP, subdomain, `www.example.co.uk`), leading-`www` exception.
- `npx tsc --noEmit`: exit 0.
- `node scripts/leak-scan.mjs`: LEAK SCAN PASS.

## Not tested / user steps

The client connection steps below are provided as user steps only. They have not been tested by the author and must not be claimed as working:

- Claude: Settings -> Connectors -> Add custom connector -> enter the remote URL -> no sign-in. Free plan allows one custom connector.
- Perplexity: Settings or Plugins -> add a custom MCP connector -> Streamable HTTP -> authentication none. If the control is missing, the plan does not include it; do not fake success.
- ChatGPT web: Plugins -> add a custom MCP server -> server URL -> no authentication -> create as a plugin -> then @ it. If the menu is missing, report BLOCKED BY PLAN. Do not add OAuth to force it.

## Demo prompt

```
Use list_subdomains on adityahq.me. Return the tool result only. Do not guess extra names.
```
