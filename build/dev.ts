import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { context, type ServeOptions } from 'esbuild';

import { config, outdir } from './config.ts';

const serveOpts: ServeOptions = {
	certfile: fileURLToPath(import.meta.resolve('../cert.pem')),
	keyfile: fileURLToPath(import.meta.resolve('../key.pem')),
	fallback: path.join(outdir, 'index.html'),
	port: 8080,
	servedir: outdir,
};

const ctx = await context({
	...config,
	entryNames: '[dir]/[name]',
	assetNames: '[dir]/[name]',
	logLevel: 'info',
	sourcemap: 'inline',
});

await ctx.watch();

await ctx.serve(serveOpts);
