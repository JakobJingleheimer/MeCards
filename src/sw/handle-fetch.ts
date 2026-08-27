import handlers from './fetch-handlers.ts';


export default function handleFetch(event: FetchEvent) {
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
			.catch((err) => {
				if (self.location.search.includes('debug=1')) console.table({
					'req.url': req.url,
					'cors': url.origin !== self.location.origin,
					strategy,
				});
				throw err;
		})
	);
}

const isDocReq = (req: Request) => (
	req.headers.get('sec-fetch-dest') === 'document'
	|| req.headers.get('accept')?.startsWith('text/html')
);
