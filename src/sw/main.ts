import handleFetch from './handle-fetch.ts';
import { CACHE_KEY } from './const.ts';

declare var __APP_FILES__: string[]; // esbuild replaces this with the array of file-paths

// PWA Registration
self.addEventListener('install', function onSWInstall(event) {
	self.skipWaiting();

	event.waitUntil(caches.open(CACHE_KEY).then((cache) => cache.addAll(__APP_FILES__)));
});
self.addEventListener('activate', function onSWActivate(event) {
	return event.waitUntil(clients.claim());
});

self.addEventListener('fetch', handleFetch);
