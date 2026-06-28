if ('serviceWorker' in navigator) {
	navigator.serviceWorker.register('/sw.js', {
		scope: '/',
		type: 'module',
	});
}

const ready = await navigator.serviceWorker.ready;

export default ready;
