import { render } from 'preact';

// import favicon from './logos/favicon.ico'; // this somehow breaks the shit out of the build
// import './webmanifest/index.ts';

import { App } from './App.tsx';

render(<App />, document.body);

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/service-worker.js');

// Prevent treeshaking stripping these out
// favicon;
