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

const ctx = await context(config);

await ctx.watch();

const details = await ctx.serve(serveOpts);
const protocol = 'certfile' in serveOpts && 'keyfile' in serveOpts ? 'https' : 'http';

console.log(
	`[esbuild server]: Listening on`,
	...details.hosts.map((host) => `\n  ${protocol}://${host}:${details.port}`)
);
