/// <reference lib="webworker" />

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
	const url = new URL(req.url);

	const strategy = url.origin !== self.location.origin
		? 'network-only' // req to external host
		: url.pathname.startsWith('/app/')
		? 'network-first' // app file
		: 'cache-first'; // card asset

	const handler = handlers[strategy];

	console.log({
		'req.url': req.url,
		'self': self.location.origin,
		'cross-origin': url.origin !== self.location.origin,
		strategy,
	});

	event.respondWith(handler(req));
});

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
