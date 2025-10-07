import { fileURLToPath } from 'node:url';

import { context, type ServeOptions } from 'esbuild';

import { config, outdir } from './config.ts';

const serveOpts: ServeOptions = {
	certfile: fileURLToPath(import.meta.resolve('../cert.pem')),
	keyfile: fileURLToPath(import.meta.resolve('../key.pem')),
	port: 8080,
	servedir: outdir,
};

const details = await (await context(config)).serve(serveOpts);
const protocol = 'certfile' in serveOpts && 'keyfile' in serveOpts ? 'https' : 'http';

console.log(
	`[esbuild server]: Listening on`,
	...details.hosts.map((host) => `\n  ${protocol}://${host}:${details.port}`)
);
