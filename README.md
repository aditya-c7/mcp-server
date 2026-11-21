# subdomain-index

A small, read-only Model Context Protocol (MCP) server that lists publicly indexed names for one apex domain. It is meant to be consumed as a remote tool server by MCP clients.

- Public MCP URL: `https://server.adityahq.me/mcp`
- Authentication: none (no OAuth, no sign-in, no API key)
- Transport: Streamable HTTP
- Tools: one, `list_subdomains`

The server reads only from a public index. It does not probe hosts, change anything, or require credentials.

## Tool: `list_subdomains`

Lists publicly indexed names for one apex domain.

Input:

```json
{
  "domain": "adityahq.me"
}
```

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `domain` | `string` | yes | A single registrable apex domain, for example `adityahq.me`. |

Public description / behavior (verbatim):

> List publicly indexed names for one apex domain.
> Pass only the registrable apex, such as example.com or adityahq.me.
> Not a URL, not a subdomain, not an IP.
> Results are indexed names only. Not a complete list.
> Not checked for whether they are online.
> On failure, say the lookup failed. Never invent names.

Results are lowercased, deduplicated, sorted, and capped at 100 names. Annotations: `readOnlyHint: true`, `openWorldHint: true`, `destructiveHint: false`.

Sample success payload (shape only; names come from the live index):

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

`wrangler dev` listens on port 8787 by default, so the local MCP endpoint is `http://localhost:8787/mcp`.

Connect with MCP Inspector:

```sh
npx @modelcontextprotocol/inspector@latest
```

In the Inspector UI:

1. Set Transport to Streamable HTTP.
2. Set URL to `http://localhost:8787/mcp`.
3. Connect, then choose List tools. Only `list_subdomains` should appear. Confirm its description and schema contain no lookup URL.
4. Call `list_subdomains` with `{"domain": "adityahq.me"}`. Call it again: the second result should have `cached: true`.

`GET /health` returns the plain-text body `ok`. It is only a liveness check and is not the MCP URL.

## Checks

```sh
npx tsc --noEmit   # type check
npm test           # local JSON-RPC smoke test against http://localhost:8787
```

## Deploy

Deployment is handled by a Cloudflare Workers Git build: pushing to `main` builds and deploys the `mcp-server` Worker that owns the custom domain. Do not run `wrangler deploy` locally.

The public endpoint is `https://server.adityahq.me/mcp`.

## Tested

Verified locally during development:

- MCP Inspector GUI connected to local `http://localhost:8787/mcp` (server title shown). Protocol-level `tools/list` discovery — only `list_subdomains` appears — was verified by the smoke harness.
- `node scripts/smoke.mjs`: SMOKE PASS (49 checks) — health, initialize, `tools/list`, first call `cached: false`, second call `cached: true`, rejection cases (URL, localhost, raw IP, subdomain, `www.example.co.uk`), and the leading-`www` exception.
- `npx tsc --noEmit`: exit 0.
- `node scripts/leak-scan.mjs`: LEAK SCAN PASS.

Production behavior was not verified here; the public endpoint and deployment are not claimed as tested.

## Not tested / user steps

The client connection steps below are provided as user steps only. They have not been tested by the author and must not be claimed as working:

- Claude: Settings -> Connectors -> Add custom connector -> enter the remote URL -> no sign-in. Free plan allows one custom connector.
- Perplexity: Settings or Plugins -> add a custom MCP connector -> Streamable HTTP -> authentication none. If the control is missing, the plan does not include it; do not fake success.
- ChatGPT web: Plugins -> add a custom MCP server -> server URL -> no authentication -> create as a plugin -> then @ it. If the menu is missing, report BLOCKED BY PLAN. Do not add OAuth to force it.

## Demo prompt

```
Use list_subdomains on adityahq.me. Return the tool result only. Do not guess extra names.
```
