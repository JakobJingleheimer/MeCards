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

export type IndexEJSOptions = Partial<{
	env: 'development' | 'production' | 'test',
	hot: boolean,
}>;

const encoder = new TextEncoder();
const encodeUTF8 = (...args: Parameters<TextEncoder['encode']>) => encoder.encode(...args);

const cwd = `${process.cwd()}${path.sep}`;

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
	async setup({ initialOptions: buildConfig, onEnd }) {
		buildConfig.metafile ||= true;
		if (!buildConfig.metafile) throw new Error('BuildOptions.metafile is required');

		const templatePath = findEntrypoint(buildConfig, filename);

		if (!templatePath) {
			const msg = [`No entry-point found for EJS template "${defaultFilename}".`];
			if (filename === defaultFilename) msg[1] = `Filename is the default ('${defaultFilename}'); perhaps the actual filename is different?`;

			throw new Error(msg.join(' '));
		}

		onEnd(async ({ outputFiles, metafile }) => {
			const tmpl = await readFile(templatePath, 'utf8');
			const assets = composeBuildMetadata(metafile!, buildConfig);

			const compiledHTML = ejs.render(tmpl, {
				assets,
				env,
				hot,
			});

			const handler = buildConfig.write === false ? handleFileOnDisk : handleFileInMemory;

			await handler(
				compiledHTML,
				buildConfig.outdir!,
				filename,
				outputFiles!,
			);

			const inPrefix = path.join(
				...templatePath
					.replace(cwd, '')
					.replace(filename, '')
					.split(path.sep)
					.slice(1) // This assumes source code lives (directly) in a dir like `src/`
			);
			const outPrefix = buildConfig.outdir?.replace(cwd, '')!;

			const templateKey = path.join(outPrefix, inPrefix, filename);
			const replacementKey = path.join(outPrefix, 'index.html');

			// @ts-expect-error
			metafile.outputs[replacementKey] = metafile?.outputs[templateKey];

			delete metafile?.outputs[templateKey];
		});
	},
});

async function handleFileInMemory(
	compiledHTML: string,
	outdir: string,
	ogFilename: string,
) {
	const ogOutpath = path.join(outdir!, ogFilename);
	await writeFile(
		ogOutpath,
		compiledHTML,
	);
	await rename(
		ogOutpath,
		makeFinalOutpath(outdir!),
	);
}

function handleFileOnDisk(
	compiledHTML: string,
	outdir: string,
	ogFilename: string,
	outputFiles: OutputFile[],
) {
	const entry = outputFiles!.find((item) => item.path.endsWith(ogFilename));

	if (!entry) {
		const msg = [`No entry found for "${ogFilename}".`];
		if (ogFilename === defaultFilename) {
			msg[1] = `Filename is the default ("${defaultFilename}"); perhaps the actual filename is different?`;
		}
		throw new Error(msg.join(' '));
	}

	// convertOutputFiles
	entry.contents = encodeUTF8(compiledHTML);
	entry.path = makeFinalOutpath(outdir);
}

const makeFinalOutpath = (outdir: string) => path.join(outdir, 'index.html');
