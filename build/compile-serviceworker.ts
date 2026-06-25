import {
	readFile,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
	type Plugin,
} from 'esbuild';

const defaultFilename = 'service-worker.ts';
export const compileServiceWorkerPlugin = (
	filename: string = defaultFilename,
): Plugin => ({
	name: 'Compile ServiceWorker',
	async setup({ initialOptions, onEnd }) {
		const buildConfig = initialOptions;
		if (!buildConfig.metafile) throw new Error('BuildOptions.metafile is required');

		const swOutputFilename = filename.replace('.ts', '.js');

		onEnd(async ({ metafile }) => {
			const assets = [];
			for (const output of Object.keys(metafile?.outputs!)) {
				const asset = output!.replace('dist', '');

				if (asset.endsWith(swOutputFilename)) continue;
				if (asset.includes('webmanifest')) continue;

				assets.push(asset);
			}

			const swPath = path.join(initialOptions.outdir!, swOutputFilename);

			if (!swPath) {
				const msg = [`No entry-point found for "${defaultFilename}".`];
				if (filename === defaultFilename) msg[1] = `Filename is the default ('${defaultFilename}'); perhaps the actual filename is different?`;

				throw new Error(msg.join(' '));
			}

			const sw = await readFile(swPath, 'utf8');

			const replaced = sw.replace('__APP_FILES__', JSON.stringify(assets));

			await writeFile(swPath, replaced);
		});
	},
});
