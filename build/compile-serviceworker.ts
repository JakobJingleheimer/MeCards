import {
	readFile,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
	type OutputFile,
	type Plugin,
} from 'esbuild';
import {
	getInPrefix,
	getOutPrefix,
	getInKey,
	getOutKey,
	getRootPath,
	type FileName,
} from './get-compilation-keys.ts';
import { findEntrypoint } from './find-entrypoint.ts';


const cwd = `${process.cwd()}${path.sep}`;

const defaultFilename = 'main.ts';
export const compileServiceWorkerPlugin = (
	inName: FileName = defaultFilename,
	outName: FileName = 'sw.js',
): Plugin => ({
	name: 'Compile ServiceWorker',
	async setup({ initialOptions: buildConfig, onEnd }) {
		buildConfig.metafile ||= true;
		if (!buildConfig.metafile) throw new Error('BuildOptions.metafile is required');

		const transName = inName.replace('.ts', '.js') as FileName;
		const outPfx = getOutPrefix(buildConfig.outdir, cwd);
		const outPath = getRootPath(buildConfig.outdir, outName);

		onEnd(async ({ metafile, outputFiles }) => {
			const inPath = findEntrypoint(buildConfig, inName);

			if (!inPath) {
				const msg = [`No entry-point found for "${defaultFilename}".`];
				if (inName === defaultFilename) msg[1] = `Filename is the default ('${defaultFilename}'); perhaps the actual filename is different?`;

				throw new Error(msg.join(' '));
			}

			const inPfx = getInPrefix(inPath, inName, cwd);
			const inKey = getInKey(outPfx, inPfx, transName);
			const outKey = getOutKey(outPfx, outName);

			// @ts-expect-error
			metafile.outputs[outKey] = metafile?.outputs[inKey];

			delete metafile?.outputs[inKey];

			const assets: FileName[] = [];
			for (const output of Object.keys(metafile?.outputs!)) {
				const asset = output!.replace(outPfx, '') as FileName;

				if (asset.endsWith(outName)) continue;
				if (asset.includes('webmanifest')) continue;

				assets.push(asset);
			}

			const handler = buildConfig.write ? handleFileOnDisk : handleFileInMemory;

			await handler(
				assets,
				outPath,
				transName,
				outputFiles!
			);
		});
	},
});

const decoder = new TextDecoder();
const encoder = new TextEncoder();
const encodeUTF8 = (...args: Parameters<TextEncoder['encode']>) => encoder.encode(...args);

async function handleFileOnDisk(
	assets: FileName[],
	outPath: string,
) {
	const sw = await readFile(outPath, 'utf8');

	const replaced = sw.replace('__APP_FILES__', JSON.stringify(assets));

	await writeFile(outPath, replaced);
}

async function handleFileInMemory(
	assets: FileName[],
	outPath: string,
	inName: FileName,
	outputFiles: OutputFile[],
) {
	const entry = outputFiles!.find((item) => item.path.endsWith(inName));

	if (!entry) {
		const msg = [`No entry found for "${inName}".`];
		if (inName === defaultFilename) {
			msg[1] = `Filename is the default ("${defaultFilename}"); perhaps the actual filename is different?`;
		}
		throw new Error(msg.join(' '));
	}

	const replaced = decoder
		.decode(entry.contents)
		.replace('__APP_FILES__', JSON.stringify(assets));

	entry.contents = encodeUTF8(replaced);
	entry.path = outPath;
}
