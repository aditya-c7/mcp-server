const SOURCE_ENDPOINT = 'https://crt.name/v1/search?apex={domain}';

const CACHE_TTL_SECONDS = 600;
const MAX_NAMES = 100;
const TIMEOUT_MS = 8000;

const TIMEOUT_TEXT = 'Lookup timed out or was unreachable. Try again.';
const UNAVAILABLE_TEXT = 'Lookup is temporarily unavailable. Cached results still work. Try again later.';
const NO_RESULT_TEXT = 'Lookup returned no usable result. This is not the same as zero names.';
const APEX_ERROR_TEXT = 'Pass the apex domain, for example adityahq.me, not a subdomain.';
const INVALID_TEXT = 'Enter a valid apex domain, such as example.com.';
const NOTE = 'Indexed names only. Not a complete list. Not checked if they are online.';

const HOSTNAME_RE = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const IPV4_RE = /^\d{1,3}(?:\.\d{1,3}){3}$/;

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

function parseNames(text: string): ParsedNames {
	const raw: string[] = [];
	let parsed: unknown;
	try {
		parsed = JSON.parse(text);
	} catch {
		parsed = undefined;
	}

	if (Array.isArray(parsed)) {
		for (const item of parsed) {
			if (typeof item === 'string') {
				raw.push(...item.split(/\r?\n/));
			} else if (item !== null && typeof item === 'object') {
				const value = (item as Record<string, unknown>).name_value;
				if (typeof value === 'string') {
					raw.push(...value.split(/\r?\n/));
				}
			}
		}
	} else {
		raw.push(...text.split(/\r?\n/));
	}

	const unique = new Set<string>();
	for (const entry of raw) {
		let name = entry.trim().toLowerCase();
		if (name.startsWith('*.')) {
			name = name.slice(2).trim();
		}
		if (name.length > 0) {
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

export async function lookup(rawDomain: string): Promise<LookupOutcome> {
	const normalized = normalizeApex(rawDomain);
	if (!normalized.ok) {
		return failure(normalized.message);
	}
	const apex = normalized.apex;

	const keyRequest = new Request(`https://cache.internal/subdomains/${apex}`);
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

	const endpoint = SOURCE_ENDPOINT.replace('{domain}', encodeURIComponent(apex));
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		let response: Response;
		try {
			response = await fetch(endpoint, {
				method: 'GET',
				headers: { 'User-Agent': 'subdomain-index/1.0' },
				signal: controller.signal
			});
		} catch {
			return failure(TIMEOUT_TEXT);
		}

		if (response.status === 429) {
			return failure(UNAVAILABLE_TEXT);
		}
		if (response.status !== 200) {
			return failure(NO_RESULT_TEXT);
		}

		let body: string;
		try {
			body = await response.text();
		} catch {
			return failure(TIMEOUT_TEXT);
		}

		const parsed = parseNames(body);
		if (parsed.names.length === 0) {
			return failure(NO_RESULT_TEXT);
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
	} finally {
		clearTimeout(timer);
	}
}
