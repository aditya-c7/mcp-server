<div align="center">

# subdomain-index

### Read-only MCP server for indexed apex-domain names

[![Public endpoint](https://img.shields.io/badge/Public_endpoint-server.adityahq.me-2563EB)](https://server.adityahq.me/mcp)
[![Transport](https://img.shields.io/badge/Transport-Streamable_HTTP-0891B2)](#tool-contract)
[![Deployment](https://img.shields.io/badge/Deployment-Cloudflare_Workers-F38020?logo=cloudflare&logoColor=white)](#deployment)

</div>

## What it does

Exposes one MCP tool, `list_subdomains`, which returns publicly indexed names for a single apex domain. No authentication. Results are lowercased, deduplicated, sorted, and capped at 100.

## Tool contract

Input:

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `domain` | `string` | yes | Single registrable apex domain, e.g. `example.com` |

Response fields:

| Field | Type | Description |
| --- | --- | --- |
| `domain` | `string` | Queried apex domain |
| `count` | `number` | Names returned |
| `total_seen` | `number` | Names found before truncation |
| `truncated` | `boolean` | Whether results were capped |
| `subdomains` | `string[]` | Indexed names, deduplicated and sorted |
| `cached` | `boolean` | Whether the result came from cache |
| `note` | `string` | Fixed disclaimer text |

Description returned to clients:

> List publicly indexed names for one apex domain.
> Pass only the registrable apex, such as example.com or example.org.
> Not a URL, not a subdomain, not an IP.
> Results are indexed names only. Not a complete list.
> Not checked for whether they are online.
> On failure, say the lookup failed. Never invent names.

Annotations: `readOnlyHint: true`, `openWorldHint: true`, `destructiveHint: false`.

Example input:

```json
{ "domain": "example.com" }
```

Example response:

```json
{
  "domain": "example.com",
  "count": 4,
  "total_seen": 4,
  "truncated": false,
  "subdomains": [
    "api.example.com",
    "docs.example.com",
    "example.com",
    "www.example.com"
  ],
  "cached": false,
  "note": "Indexed names only. Not a complete list. Not checked if they are online."
}
```

## How it works

1. Client sends a JSON-RPC request to `/mcp` over Streamable HTTP.
2. The handler validates the `Host` header against an allowlist.
3. Tool input is checked: only a single registrable apex domain is accepted.
4. Names are read from a public index, normalized, deduplicated, sorted, capped, and cached.
5. Success returns a JSON-RPC tool result; failure returns `isError: true` with a plain message.

`GET /health` returns `ok` (liveness only).

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
3. Connect, List tools: only `list_subdomains`; confirm its description and input schema match the contract above.
4. Call with `{"domain": "example.com"}`, then call again: the second result has `cached: true`.

## Verification

```sh
npx tsc --noEmit
node scripts/leak-scan.mjs
node scripts/smoke.mjs   # or: npm test
```

For a warm cache, run with `SMOKE_EXPECT_MISS=0`. Point at production with `MCP_URL=https://server.adityahq.me`.

## Deployment

Cloudflare Workers Git build on push to `main` deploys the `mcp-server` Worker that owns the custom domain. No local `wrangler deploy`.

## Tested

- MCP Inspector GUI connected to `http://localhost:8787/mcp` and to `https://server.adityahq.me/mcp`. Both showed one tool, `list_subdomains`, and a successful call with a non-empty result.
- Production cold lookup `cloudflare.com`: HTTP 200 in 1.4 s, `cached:false`, 100 returned names, `truncated:true`.
- `aryanbudke.in`: 5 names returned in 703 ms (`cached:true`).
- `node scripts/smoke.mjs`: local SMOKE PASS (49 checks, cold cache) — health, initialize, `tools/list`, `cached: false` then `cached: true`, rejection cases, leading-`www` exception. Production SMOKE PASS (48 checks, warm cache; `SMOKE_EXPECT_MISS=0`).
- `npx tsc --noEmit`: exit 0.
- `node scripts/leak-scan.mjs`: LEAK SCAN PASS.

## Not tested / user steps

The client connection steps below are provided as user steps only. They have not been tested by the author and must not be claimed as working:

- Claude: Settings -> Connectors -> Add custom connector -> enter the remote URL -> no sign-in. Free plan allows one custom connector.
- Perplexity: Settings or Plugins -> add a custom MCP connector -> Streamable HTTP -> authentication none. If the control is missing, the plan does not include it; do not fake success.
- ChatGPT web: Plugins -> add a custom MCP server -> server URL -> no authentication -> create as a plugin -> then @ it. If the menu is missing, report BLOCKED BY PLAN. Do not add OAuth to force it.

## Demo prompt

```
Use list_subdomains on example.com. Return the tool result only. Do not guess extra names.
```
