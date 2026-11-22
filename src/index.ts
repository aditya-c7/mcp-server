import { env } from 'cloudflare:workers';
import { createMcpHandler } from 'agents/mcp/server';
import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { lookup, type LookupEnv } from './lookup';
import { LANDING_HTML } from './landing';

const DESCRIPTION =
	'List publicly indexed names for one apex domain.\n' +
	'Pass only the registrable apex, such as example.com or example.org.\n' +
	'Not a URL, not a subdomain, not an IP.\n' +
	'Results are indexed names only. Not a complete list.\n' +
	'Not checked for whether they are online.\n' +
	'On failure, say the lookup failed. Never invent names.';

const handler = createMcpHandler(
	() => {
		const server = new McpServer({ name: 'subdomain-index', version: '1.0.0' });
		server.registerTool(
			'list_subdomains',
			{
				description: DESCRIPTION,
				inputSchema: z.object({ domain: z.string() }),
				annotations: {
					readOnlyHint: true,
					openWorldHint: true,
					destructiveHint: false
				}
			},
			async ({ domain }) => {
				const result = await lookup(domain, env as Env & LookupEnv);
				if (!result.ok) {
					return {
						isError: true,
						content: [{ type: 'text', text: result.message }]
					};
				}
				return {
					content: [{ type: 'text', text: result.text }]
				};
			}
		);
		return server;
	},
	{
		route: '/mcp',
		allowedHostnames: [
			'server.adityahq.me',
			'REPLACE_WITH_WORKERS_DEV_HOSTNAME',
			'localhost',
			'127.0.0.1',
			'[::1]'
		]
	}
);

const worker = {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		if (url.pathname === '/health' && request.method === 'GET') {
			return new Response('ok', {
				headers: { 'Content-Type': 'text/plain; charset=utf-8' }
			});
		}
		if (url.pathname === '/' && request.method === 'GET') {
			return new Response(LANDING_HTML, {
				headers: { 'Content-Type': 'text/html; charset=utf-8' }
			});
		}
		return handler(request, env, ctx);
	}
};

export default worker;
