exports[`Compile ServiceWorker (esbuild plugin) > should compile the service worker file > in-memory (dev mode) 1`] = `
"import handleFetch from \\"./handle-fetch.ts\\";\\nimport { CACHE_KEY } from \\"./const.ts\\";\\nself.addEventListener(\\"install\\", function onSWInstall(event) {\\n  self.skipWaiting();\\n  event.waitUntil(caches.open(CACHE_KEY).then((cache) => cache.addAll([\\"/app/favicon.ico\\",\\"/sw/register.js\\",\\"/app/main.js\\",\\"/app/main.css\\",\\"/app/index.ejs\\"])));\\n});\\nself.addEventListener(\\"activate\\", function onSWActivate(event) {\\n  return event.waitUntil(clients.claim());\\n});\\nself.addEventListener(\\"fetch\\", handleFetch);\\n"
`;

exports[`Compile ServiceWorker (esbuild plugin) > should compile the service worker file > on-disk (prod mode) 1`] = `
"import handleFetch from \\"./handle-fetch.ts\\";\\nimport { CACHE_KEY } from \\"./const.ts\\";\\nself.addEventListener(\\"install\\", function onSWInstall(event) {\\n  self.skipWaiting();\\n  event.waitUntil(caches.open(CACHE_KEY).then((cache) => cache.addAll([\\"/app/favicon.ico\\",\\"/sw/register.js\\",\\"/app/main.js\\",\\"/app/main.css\\",\\"/app/index.ejs\\"])));\\n});\\nself.addEventListener(\\"activate\\", function onSWActivate(event) {\\n  return event.waitUntil(clients.claim());\\n});\\nself.addEventListener(\\"fetch\\", handleFetch);\\n"
`;
