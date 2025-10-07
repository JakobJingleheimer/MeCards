import {
	readFile,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import ejs from 'ejs';
import {
	type Plugin,
} from 'esbuild';

import { composeManifest } from './manifest.ts';

export type IndexEJSOptions = Partial<{
	env: 'development' | 'production' | 'test',
	hot: true,
}>;

export const compileIndexEJS = (
	templatePath: string,
	{
		env,
		hot,
	}: IndexEJSOptions = {
		env: process.env.NODE_ENV,
	},
): Plugin => ({
	name: 'Compile index.ejs',
	async setup({ initialOptions, onEnd }) {
		const buildConfig = initialOptions;
		if (!buildConfig.metafile) throw new Error('BuildOptions.metafile is required');

		const tmpl = await readFile(templatePath, 'utf8');

		onEnd(async ({ metafile }) => {
			const assets = composeManifest(metafile!, buildConfig);

			await writeFile(
				path.join(buildConfig.outdir!, 'index.html'),
				ejs.render(tmpl, {
					assets,
					env: process.env.NODE_ENV,
					hot: 'HMR' in process.env,
				})
			);
		});
	},
});
