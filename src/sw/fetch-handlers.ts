import { CACHE_KEY } from './const.ts';


type FetchEventHandler = (req: FetchEvent['request']) => Promise<Response>;

const cacheFirst: FetchEventHandler = (req) => caches
	.match(req)
	.then((rsp) => rsp || fetch(req));

// const cacheOnly = (req) => caches.match(req);

const networkFirst: FetchEventHandler = (req) => fetch(req)
	.then(
		(rsp) => caches
			.open(CACHE_KEY)
			.then((cache) => cache.put(req, rsp.clone()))
			.then(() => rsp),
		(networkError: DOMException) => caches
			.match(req)
			.then((rsp) => rsp ?? new Response(undefined, { status: 404 })),
	);

const networkOnly: FetchEventHandler = (req) => fetch(req);

const handlers = {
	'cache-first': cacheFirst,
	// 'cache-only': cacheOnly,
	'network-first': networkFirst,
	'network-only': networkOnly,
} satisfies Record<string, FetchEventHandler>;

export default handlers;
