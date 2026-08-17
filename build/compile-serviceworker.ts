import {
	readFile,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
	type BuildOptions,
	type BuildResult,
	type Plugin,
} from 'esbuild';

const defaultFilename = 'sw.ts';
export const compileServiceWorkerPlugin = (
	filename: string = defaultFilename,
): Plugin => ({
	name: 'Compile ServiceWorker',
	async setup({ initialOptions: buildConfig, onEnd }) {
		buildConfig.metafile ||= true;
		if (!buildConfig.metafile) throw new Error('BuildOptions.metafile is required');

		const swOutputFilename = filename.replace('.ts', '.js');

		onEnd(async ({ metafile, outputFiles }) => {
			const assets: string[] = [];
			for (const output of Object.keys(metafile?.outputs!)) {
				const asset = output!.replace('dist', '');

				if (asset.endsWith(swOutputFilename)) continue;
				if (asset.includes('webmanifest')) continue;

				assets.push(asset);
			}

			const swPath = path.join(buildConfig.outdir!, swOutputFilename);
			if (!swPath) {
				const msg = [`No entry-point found for "${defaultFilename}".`];
				if (filename === defaultFilename) msg[1] = `Filename is the default ('${defaultFilename}'); perhaps the actual filename is different?`;

				throw new Error(msg.join(' '));
			}

			const handler = buildConfig.write ? handleFileOnDisk : handleFileInMemory;

			await handler(assets, swPath, outputFiles!);
		});
	},
});

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const encodeUTF8 = (...args: Parameters<TextEncoder['encode']>) => encoder.encode(...args);

async function handleFileOnDisk(
	assets: string[],
	swPath: string,
) {
	const sw = await readFile(swPath, 'utf8');

	const replaced = sw.replace('__APP_FILES__', JSON.stringify(assets));

	await writeFile(swPath, replaced);
}

async function handleFileInMemory(
	assets: string[],
	swPath: string,
	outputFiles: Exclude<BuildResult<BuildOptions>['outputFiles'], undefined>,
) {
	const idx = outputFiles.findIndex((outfile) => outfile.path === swPath);

	if (!idx) throw new Error('Could not find ServiceWorker in outputFiles');

	const replaced = decoder
		.decode(outputFiles[idx]!.contents)
		.replace('__APP_FILES__', JSON.stringify(assets));

	outputFiles[idx] = {
		...outputFiles[idx]!,
		contents: encodeUTF8(replaced),
	};
}
