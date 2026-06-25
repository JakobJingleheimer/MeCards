/// <reference lib="webworker" />

declare var __APP_FILES__: string[]; // esbuild replaces this with the array of file-paths

const CACHE_KEY = 'v1';

// PWA setup 1
self.addEventListener('install', (event) => {
	self.skipWaiting();

	event.waitUntil(caches.open(CACHE_KEY).then((cache) => cache.addAll(__APP_FILES__)));
});

// PWA setup 2
self.addEventListener('activate', (event) => event.waitUntil(clients.claim()));

// const cacheFirst = (req) => caches
// 	.match(req)
// 	.then((rsp) => rsp || fetch(req));

const cacheOnly = (req) => caches.match(req);

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
	// 'cache-first': cacheFirst,
	'cache-only': cacheOnly,
	'network-first': networkFirst,
	'network-only': networkOnly,
};

self.addEventListener('fetch', (event) => {
	const { request: req } = event;
	const url = new URL(req.url);

	const strategy = url.origin !== self.location.origin
		? 'network-only' // req to external host
		: url.pathname.startsWith('/app/')
		? 'network-first' // app file
		: 'cache-only'; // card asset

	const handler = handlers[strategy];

	console.log({
		'req.url': req.url,
		'self': self.location.origin,
		'cross-origin': url.origin !== self.location.origin,
		strategy,
	});

	event.respondWith(handler(req));
});
