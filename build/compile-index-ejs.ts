import {
	readFile,
	rename,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import ejs from 'ejs';
import {
	type Plugin,
} from 'esbuild';

import { composeBuildMetadata } from './build-metadata.ts';
import { findEntrypoint } from './find-entrypoint.ts';

export type IndexEJSOptions = Partial<{
	env: 'development' | 'production' | 'test',
	hot: boolean,
}>;

const defaultFilename = 'index.ejs';
export const compileIndexEJSPlugin = (
	filename: string = defaultFilename,
	{
		env,
		hot,
	}: IndexEJSOptions = {
		env: process.env.NODE_ENV,
		hot: 'HMR' in process.env,
	},
): Plugin => ({
	name: 'Compile index.ejs',
	async setup({ initialOptions, onEnd }) {
		const buildConfig = initialOptions;
		if (!buildConfig.metafile) throw new Error('BuildOptions.metafile is required');

		const templatePath = findEntrypoint(initialOptions, filename);

		if (!templatePath) {
			const msg = [`No entry-point found for EJS template "${defaultFilename}".`];
			if (filename === defaultFilename) msg[1] = `Filename is the default ('${defaultFilename}'); perhaps the actual filename is different?`;

			throw new Error(msg.join(' '));
		}

		const encoder = new TextEncoder();
		const encodeUTF8 = (...args: Parameters<TextEncoder['encode']>) => encoder.encode(...args);

		onEnd(async ({ outputFiles, metafile }) => {
			const tmpl = await readFile(templatePath, 'utf8');
			const assets = composeBuildMetadata(metafile!, buildConfig);

			const compiledHTML = ejs.render(tmpl, {
				assets,
				env,
				hot,
			});

			if (initialOptions.write === false) {
				const entry = outputFiles!.find((item) => item.path.endsWith(filename));

				if (!entry) {
					const msg = [`No entry found for "${templatePath}".`];
					if (filename === defaultFilename) {
						msg[1] = `Filename is the default ("${defaultFilename}"); perhaps the actual filename is different?`;
					}
					throw new Error(msg.join(' '));
				}

				// convertOutputFiles
				entry.contents = encodeUTF8(compiledHTML);
				entry.path = entry.path.replace('.ejs', '.html');
			} else {
				const ogOutname = path.join(buildConfig.outdir!, filename);
				await writeFile(
					ogOutname,
					compiledHTML,
				);
				await rename(
					ogOutname,
					path.join(buildConfig.outdir!, 'index.html'),
				);
			}
		});
	},
});

