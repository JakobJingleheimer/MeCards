self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then((rsp) => {
      return rsp || fetch(event.request);
    })
  );
});
