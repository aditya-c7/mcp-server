const APEX_SEARCH_ENDPOINT = 'https://crt.name/v1/search?apex={domain}';
const KEYED_SUBDOMAIN_ENDPOINT = 'https://www.virustotal.com/api/v3/domains/{domain}/subdomains?limit=40';
const ISSUANCE_SEARCH_ENDPOINT = 'https://api.certspotter.com/v1/issuances?domain={domain}&include_subdomains=true&expand=dns_names';
const WEB_SEARCH_ENDPOINT = 'https://urlscan.io/api/v1/search/?q=domain:{domain}&size=100';
const HOST_SEARCH_ENDPOINT = 'https://api.hackertarget.com/hostsearch/?q={domain}';
const CACHE_KEY_PREFIX = 'https://cache.internal/subdomains/';

const CACHE_TTL_SECONDS = 3600;
const MAX_NAMES = 100;
const TIMEOUT_MS = 4000;
const USER_AGENT = 'subdomain-index/1.0';

const TIMEOUT_TEXT = 'Lookup timed out or was unreachable. Try again.';
const UNAVAILABLE_TEXT = 'Lookup is temporarily unavailable. Cached results still work. Try again later.';
const NO_RESULT_TEXT = 'Lookup returned no usable result. This is not the same as zero names.';
const APEX_ERROR_TEXT = 'Pass the apex domain, for example adityahq.me, not a subdomain.';
const INVALID_TEXT = 'Enter a valid apex domain, such as example.com.';
const NOTE = 'Indexed names only. Not a complete list. Not checked if they are online.';

const HOSTNAME_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const IPV4_RE = /^\d{1,3}(?:\.\d{1,3}){3}$/;

export interface LookupEnv {
	VT_API_KEY?: string;
}

export type LookupOutcome = { ok: true; text: string } | { ok: false; message: string };

function failure(message: string): LookupOutcome {
	return { ok: false, message };
}

function invalid(message: string): { ok: false; message: string } {
	return { ok: false, message };
}

function success(apex: string, names: string[], totalSeen: number, truncated: boolean, cached: boolean): LookupOutcome {
	return {
		ok: true,
		text: JSON.stringify({
			domain: apex,
			count: names.length,
			total_seen: totalSeen,
			truncated,
			subdomains: names,
			cached,
			note: NOTE
		})
	};
}

function normalizeApex(raw: string): { ok: true; apex: string } | { ok: false; message: string } {
	const trimmed = raw.trim().toLowerCase();
	if (trimmed.length === 0 || /\s/.test(trimmed)) {
		return invalid(INVALID_TEXT);
	}
	// A URL (scheme, path, query or fragment) is not a valid apex-domain argument.
	if (/^[a-z][a-z0-9+.-]*:\/\//.test(trimmed) || /[/?#]/.test(trimmed)) {
		return invalid(INVALID_TEXT);
	}

	let host = trimmed;
	const scheme = host.match(/^[a-z][a-z0-9+.-]*:\/\//);
	if (scheme) {
		host = host.slice(scheme[0].length);
	}
	host = host.split(/[/?#]/, 1)[0] ?? '';
	if (host.includes('[') || host.includes(']')) {
		return invalid(INVALID_TEXT);
	}
	const port = host.indexOf(':');
	if (port !== -1) {
		host = host.slice(0, port);
	}
	host = host.replace(/\.+$/, '');

	if (host.length === 0 || !HOSTNAME_RE.test(host) || host === 'localhost' || host.endsWith('.local') || IPV4_RE.test(host)) {
		return invalid(INVALID_TEXT);
	}

	const labels = host.split('.');
	if (labels.length > 2) {
		if (labels[0] === 'www' && labels.length === 3) {
			return { ok: true, apex: labels.slice(1).join('.') };
		}
		return invalid(APEX_ERROR_TEXT);
	}
	if (labels.length < 2) {
		return invalid(INVALID_TEXT);
	}
	return { ok: true, apex: host };
}

interface ParsedNames {
	names: string[];
	totalSeen: number;
	truncated: boolean;
}

function normalizeNames(raw: string[]): ParsedNames {
	const unique = new Set<string>();
	for (const entry of raw) {
		let name = entry.trim().toLowerCase();
		if (name.startsWith('*.')) {
			name = name.slice(2).trim();
		}
		if (name.length > 0 && !/\s/.test(name) && !/[<>"']/.test(name)) {
			unique.add(name);
		}
	}

	const sorted = [...unique].sort();
	return {
		names: sorted.slice(0, MAX_NAMES),
		totalSeen: sorted.length,
		truncated: sorted.length > MAX_NAMES
	};
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function safeJson(text: string): unknown {
	try {
		return JSON.parse(text) as unknown;
	} catch {
		return undefined;
	}
}

type NameParser = (body: string, apex: string) => string[];

const parsePlainLines: NameParser = (body) => body.split(/\r?\n/);

const parseKeyed: NameParser = (body) => {
	const out: string[] = [];
	const parsed = safeJson(body);
	if (isRecord(parsed) && Array.isArray(parsed.data)) {
		for (const item of parsed.data as unknown[]) {
			if (isRecord(item) && typeof item.id === 'string') {
				out.push(item.id);
			}
		}
	}
	return out;
};

const parseIssuances: NameParser = (body) => {
	const out: string[] = [];
	const parsed = safeJson(body);
	if (Array.isArray(parsed)) {
		for (const item of parsed as unknown[]) {
			if (isRecord(item) && Array.isArray(item.dns_names)) {
				for (const name of item.dns_names as unknown[]) {
					if (typeof name === 'string') {
						out.push(name);
					}
				}
			}
		}
	}
	return out;
};

const parseWebSearch: NameParser = (body, apex) => {
	const out: string[] = [];
	const parsed = safeJson(body);
	if (isRecord(parsed) && Array.isArray(parsed.results)) {
		for (const item of parsed.results as unknown[]) {
			if (!isRecord(item)) {
				continue;
			}
			const page = isRecord(item.page) ? item.page.domain : undefined;
			const task = isRecord(item.task) ? item.task.domain : undefined;
			for (const value of [page, task]) {
				if (typeof value !== 'string') {
					continue;
				}
				const lowered = value.toLowerCase();
				if (lowered === apex || lowered.endsWith('.' + apex)) {
					out.push(value);
				}
			}
		}
	}
	return out;
};

const parseHostSearch: NameParser = (body) => {
	const out: string[] = [];
	for (const line of body.split(/\r?\n/)) {
		const comma = line.indexOf(',');
		if (comma > 0) {
			out.push(line.slice(0, comma));
		}
	}
	return out;
};

interface CachedValue {
	names: string[];
	total_seen: number;
	truncated: boolean;
}

function isCachedValue(value: unknown): value is CachedValue {
	if (typeof value !== 'object' || value === null) {
		return false;
	}
	const record = value as Record<string, unknown>;
	return (
		Array.isArray(record.names) &&
		record.names.every((item) => typeof item === 'string') &&
		typeof record.total_seen === 'number' &&
		typeof record.truncated === 'boolean'
	);
}

type FailureReason = 'timeout' | 'unavailable' | 'no_result';

interface SourceTask {
	url: string;
	parse: NameParser;
	apiKey?: string;
}

type FetchAttempt =
	| { ok: true; parsed: ParsedNames }
	| { ok: false; reason: FailureReason };

async function fetchFrom(task: SourceTask, target: string, apex: string): Promise<FetchAttempt> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const headers: Record<string, string> = { 'User-Agent': USER_AGENT };
		if (task.apiKey !== undefined) {
			headers['x-apikey'] = task.apiKey;
		}

		let response: Response;
		try {
			response = await fetch(task.url.replace('{domain}', target), {
				method: 'GET',
				headers,
				signal: controller.signal
			});
		} catch {
			return { ok: false, reason: 'timeout' };
		}

		if (response.status === 429) {
			return { ok: false, reason: 'unavailable' };
		}
		if (response.status !== 200) {
			return { ok: false, reason: 'no_result' };
		}

		let body: string;
		try {
			body = await response.text();
		} catch {
			return { ok: false, reason: 'timeout' };
		}

		let raw: string[];
		try {
			raw = task.parse(body, apex);
		} catch {
			return { ok: false, reason: 'no_result' };
		}

		const parsed = normalizeNames(raw);
		if (parsed.names.length === 0) {
			return { ok: false, reason: 'no_result' };
		}
		return { ok: true, parsed };
	} finally {
		clearTimeout(timer);
	}
}

function selectFailure(reasons: FailureReason[]): string {
	if (reasons.length > 0 && reasons.every((reason) => reason === 'unavailable')) {
		return UNAVAILABLE_TEXT;
	}
	if (reasons.some((reason) => reason === 'timeout')) {
		return TIMEOUT_TEXT;
	}
	return NO_RESULT_TEXT;
}

export async function lookup(rawDomain: string, env: LookupEnv = {}): Promise<LookupOutcome> {
	const normalized = normalizeApex(rawDomain);
	if (!normalized.ok) {
		return failure(normalized.message);
	}
	const apex = normalized.apex;

	const keyRequest = new Request(CACHE_KEY_PREFIX + apex);
	try {
		const cachedResponse = await caches.default.match(keyRequest);
		if (cachedResponse) {
			try {
				const value: unknown = await cachedResponse.json();
				if (isCachedValue(value)) {
					return success(apex, value.names, value.total_seen, value.truncated, true);
				}
			} catch {
				// Ignore a malformed cached entry and refresh it.
			}
		}
	} catch {
		// Cache unavailable; continue with a fresh lookup.
	}

	const target = encodeURIComponent(apex);
	const apiKey = env.VT_API_KEY;

	const tasks: SourceTask[] = [
		{ url: APEX_SEARCH_ENDPOINT, parse: parsePlainLines }
	];
	if (apiKey) {
		tasks.push({ url: KEYED_SUBDOMAIN_ENDPOINT, parse: parseKeyed, apiKey });
	}
	tasks.push(
		{ url: ISSUANCE_SEARCH_ENDPOINT, parse: parseIssuances },
		{ url: WEB_SEARCH_ENDPOINT, parse: parseWebSearch },
		{ url: HOST_SEARCH_ENDPOINT, parse: parseHostSearch }
	);

	const reasons: FailureReason[] = [];
	let parsed: ParsedNames | undefined;
	for (const task of tasks) {
		const attempt = await fetchFrom(task, target, apex);
		if (attempt.ok) {
			parsed = attempt.parsed;
			break;
		}
		reasons.push(attempt.reason);
	}

	if (parsed === undefined) {
		return failure(selectFailure(reasons));
	}

	const cacheBody = JSON.stringify({
		names: parsed.names,
		total_seen: parsed.totalSeen,
		truncated: parsed.truncated
	});
	const cacheResponse = new Response(cacheBody, {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': `max-age=${CACHE_TTL_SECONDS}`
		}
	});
	try {
		await caches.default.put(keyRequest, cacheResponse);
	} catch {
		// Ignore cache write failures.
	}

	return success(apex, parsed.names, parsed.totalSeen, parsed.truncated, false);
}
