import { fileURLToPath } from 'node:url';

import { type BuildOptions } from 'esbuild';
import svgr from 'esbuild-plugin-svgr';

import { compileIndexEJSPlugin } from './compile-index-ejs.ts';
import { compileWebmanifestPlugin } from './compile-webmanifest.ts';
import { compileServiceWorkerPlugin } from './compile-serviceworker.ts';

export const outdir = fileURLToPath(import.meta.resolve('../docs'));

export const config: BuildOptions = {
	bundle: true,
	entryPoints: [
		fileURLToPath(import.meta.resolve('../src/app/favicon.ico')),
		fileURLToPath(import.meta.resolve('../src/sw/main.ts')),
		fileURLToPath(import.meta.resolve('../src/sw/register.ts')),
		fileURLToPath(import.meta.resolve('../src/app/main.tsx')),
		fileURLToPath(import.meta.resolve('../src/webmanifest/webmanifest.ts')),
		fileURLToPath(import.meta.resolve('../src/app/index.ejs')),
	],
	format: 'esm',
	loader: {
		'.ico': 'copy',
		'.ejs': 'copy',
		'.png': 'file',
		'.woff2': 'file',
	},
	jsx: 'automatic',
	jsxImportSource: 'preact',
	plugins: [
		svgr({
			icon: true, // strip `width` & `height` attrs
		}),
		compileWebmanifestPlugin(),
		compileIndexEJSPlugin(),
		compileServiceWorkerPlugin(),
	],
	outdir,
	splitting: false, // https://github.com/evanw/esbuild/issues/4321
} as const;
