import { fileURLToPath } from 'node:url';

import { type BuildOptions } from 'esbuild';
import svgr from 'esbuild-plugin-svgr';

import { compileIndexEJS } from './compileIndexEJS.ts';

export const outdir = fileURLToPath(import.meta.resolve('../dist'));

export const config = {
	bundle: true,
	entryPoints: [
		fileURLToPath(import.meta.resolve('../src/main.tsx')),
		fileURLToPath(import.meta.resolve('../src/service-worker.ts')),
	],
	format: 'esm',
	loader: {
		'.ico': 'copy',
		'.webmanifest': 'copy',
		'.woff2': 'file',
	},
	metafile: true,
	jsx: 'automatic',
	jsxImportSource: 'preact',
	plugins: [
		svgr(),
		compileIndexEJS(
			fileURLToPath(import.meta.resolve('../src/index.ejs')),
		),
	],
	outdir,
	splitting: true,
} as const satisfies BuildOptions;
