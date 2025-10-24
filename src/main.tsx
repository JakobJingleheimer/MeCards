import { render } from 'preact';

// import favicon from './favicon.ico'; // this somehow breaks the shit out of the build
import webmanifest from './app.webmanifest' with { type: 'json' };

import { App } from './App.tsx';

render(<App />, document.body);

// [1] Prevent treeshaking stripping these out

// favicon; // [1]
webmanifest; // [1]

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
