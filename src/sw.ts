const CACHE_KEY = 'v1';

declare var __APP_FILES__: string[]; // esbuild replaces this with the array of file-paths

// PWA Registration
self.addEventListener('install', function onSWInstall(event) {
	self.skipWaiting();

	event.waitUntil(caches.open(CACHE_KEY).then((cache) => cache.addAll(__APP_FILES__)));
});
self.addEventListener('activate', function onSWActivate(event) {
	return event.waitUntil(clients.claim())
});

self.addEventListener('fetch', function onFetch(event) {
	const { request: req } = event;
	const url = isDocReq(req)
		? new URL('/index.html', self.location.origin)
		: new URL(req.url);

	const strategy = url.origin !== self.location.origin
		? 'network-only' // req to external host
		: (url.pathname.startsWith('/app/') || isDocReq(req))
		? 'network-first' // app file
		: 'cache-first'; // card asset

	event.respondWith(
		handlers[strategy](req)
			.catch(() => console.table({
				'req.url': req.url,
				// 'self': self.location.origin,
				'cors': url.origin !== self.location.origin,
				strategy,
			}))
	);
});

const isDocReq = (req: Request) => (
	req.headers.get('sec-fetch-dest') === 'document'
	|| req.headers.get('accept')?.startsWith('text/html')
);

const cacheFirst = (req) => caches
	.match(req)
	.then((rsp) => rsp || fetch(req));

// const cacheOnly = (req) => caches.match(req);

const networkFirst = (req) => fetch(req)
	.then(
		(rsp) => caches
			.open(CACHE_KEY)
			.then((cache) => cache.put(req, rsp.clone()))
			.then(() => rsp),
		(networkError) => caches
			.match(req)
			.then((rsp) => rsp),
	);

const networkOnly = (req) => fetch(req);

const handlers = {
	'cache-first': cacheFirst,
	// 'cache-only': cacheOnly,
	'network-first': networkFirst,
	'network-only': networkOnly,
};
