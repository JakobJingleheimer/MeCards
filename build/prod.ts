import { build } from 'esbuild';

import { config } from "./config.ts";

const { errors } = await build({
	...config,
	entryNames: '[dir]/[name]-[hash]',
	minify: true,
});

if (errors.length) throw new AggregateError(errors);
