import { render } from 'preact';

import { App } from './App.tsx';

render(<App />, document.body);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/service-worker.js');
