import { render } from 'preact';

import webmanifest from './app.webmanifest' with { type: 'json' };
import { App } from './App.tsx';

console.log({ webmanifest });

render(<App />, document.body);
