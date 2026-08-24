import {
	readFile,
	rename,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import ejs from 'ejs';
import {
	type OutputFile,
	type Plugin,
} from 'esbuild';

import { composeBuildMetadata } from './build-metadata.ts';
import { findEntrypoint } from './find-entrypoint.ts';
import {
	getInKey,
	getInPrefix,
	getOutPrefix,
	getOutKey,
	getRootPath,
	type FileName,
} from './get-compilation-keys.ts';


export type IndexEJSOptions = Partial<{
	env: 'development' | 'production' | 'test',
	hot: boolean,
}>;

const encoder = new TextEncoder();
const encodeUTF8 = (...args: Parameters<TextEncoder['encode']>) => encoder.encode(...args);

const cwd = `${process.cwd()}${path.sep}`;

const defaultFilename = 'index.ejs';
export const compileIndexEJSPlugin = (
	inName: FileName = defaultFilename,
	{
		env,
		hot,
	}: IndexEJSOptions = {
		env: process.env.NODE_ENV,
		hot: 'HMR' in process.env,
	},
): Plugin => ({
	name: 'Compile index.ejs',
	async setup({ initialOptions: buildConfig, onEnd }) {
		buildConfig.metafile ||= true;
		if (!buildConfig.metafile) throw new Error('BuildOptions.metafile is required');

		const inPath = findEntrypoint(buildConfig, inName);

		if (!inPath) {
			const msg = [`No entry-point found for EJS template "${defaultFilename}".`];
			if (inName === defaultFilename) msg[1] = `Filename is the default ('${defaultFilename}'); perhaps the actual filename is different?`;

			throw new Error(msg.join(' '));
		}

		const inPfx = getInPrefix(inPath, inName, cwd);
		const outName = 'index.html' as FileName;
		const outPfx = getOutPrefix(buildConfig.outdir, cwd);
		const inKey = getInKey(outPfx, inPfx, inName);
		const outKey = getOutKey(outPfx, outName);
		const outPath = getRootPath(buildConfig.outdir, outName);

		onEnd(async ({ metafile, outputFiles }) => {
			const tmpl = await readFile(inPath, 'utf8');
			const assets = composeBuildMetadata(metafile?.outputs!, buildConfig);

			const compiledHTML = ejs.render(tmpl, {
				assets,
				env,
				hot,
			});

			const handler = buildConfig.write ? handleFileOnDisk : handleFileInMemory;

			await handler(
				compiledHTML,
				outPath,
				inName,
				outputFiles!,
			);

			// @ts-expect-error
			metafile.outputs[outKey] = metafile?.outputs[inKey];

			delete metafile?.outputs[inKey];
		});
	},
});

async function handleFileOnDisk(
	compiledHTML: string,
	outPath: string,
	inPath: string,
) {
	await writeFile(inPath, compiledHTML);
	await rename(inPath, outPath);
}

function handleFileInMemory(
	compiledHTML: string,
	outPath: string,
	inName: string,
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

	entry.contents = encodeUTF8(compiledHTML);
	entry.path = outPath;
}
