import { fileURLToPath } from 'node:url';

import { type BuildOptions } from 'esbuild';
import svgr from 'esbuild-plugin-svgr';

import { compileIndexEJSPlugin } from './compile-index-ejs.ts';
import { compileWebmanifestPlugin } from './compile-webmanifest.ts';

export const outdir = fileURLToPath(import.meta.resolve('../dist'));

export const config: BuildOptions = {
	bundle: true,
	entryPoints: [
		fileURLToPath(import.meta.resolve('../src/favicon.ico')),
		fileURLToPath(import.meta.resolve('../src/main.tsx')),
		fileURLToPath(import.meta.resolve('../src/index.ejs')),
		fileURLToPath(import.meta.resolve('../src/webmanifest/webmanifest.ts')),
		fileURLToPath(import.meta.resolve('../src/service-worker.ts')),
	],
	format: 'esm',
	loader: {
		'.ico': 'copy',
		'.ejs': 'copy',
		'.png': 'file',
		'.woff2': 'file',
	},
	metafile: true,
	jsx: 'automatic',
	jsxImportSource: 'preact',
	plugins: [
		svgr(),
		compileWebmanifestPlugin(),
		compileIndexEJSPlugin(),
	],
	outdir,
	splitting: false, // https://github.com/evanw/esbuild/issues/4321
	// write: false,
} as const;
