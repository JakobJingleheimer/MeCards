import {
	readFile,
	rename,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import {
	type BuildOptions,
	type BuildResult,
	type Plugin,
} from 'esbuild';

import { findEntrypoint } from './find-entrypoint.ts';
import {
	getInKey,
	getInPrefix,
	getOutPrefix,
	type FileName,
} from './get-compilation-keys.ts';


export type IndexEJSOptions = Partial<{
	env: 'development' | 'production' | 'test',
	hot: true,
}>;

const encoder = new TextEncoder();
const encodeUTF8 = (...args: Parameters<TextEncoder['encode']>) => encoder.encode(...args);

const cwd = `${process.cwd()}${path.sep}`;

const defaultFilename = 'webmanifest.ts';
export const compileWebmanifestPlugin = (
	inName: FileName = defaultFilename,
	outName: FileName = 'app.webmanifest',
): Plugin => ({
	name: 'Compile app.webmanifest',
	async setup({ initialOptions: buildConfig, onEnd }) {
		buildConfig.metafile ||= true;
		if (!buildConfig.metafile) throw new Error('BuildOptions.metafile is required');

		const inPath = findEntrypoint(buildConfig, inName);

		if (!inPath) {
			const msg = [`No entry-point found for "${defaultFilename}".`];
			if (inName === defaultFilename) msg[1] = `Filename is the default ('${defaultFilename}'); perhaps the actual filename is different?`;

			throw new Error(msg.join(' '));
		}

		const transName = inName.replace(path.extname(inName), '.js') as FileName;
		const inPfx = getInPrefix(inPath, inName, cwd);
		const outPfx = getOutPrefix(buildConfig.outdir, cwd);
		const inKey = getInKey(outPfx, inPfx, transName);
		const outKey = path.join(outPfx, inPfx, outName);
		const outPath = path.join(buildConfig.outdir!, inPfx, outName);

		onEnd(async ({ metafile, outputFiles }) => {
			const handler = buildConfig.write ? handleFileOnDisk : handleFileInMemory;

			await handler(
				buildConfig,
				outPath,
				transName,
				outputFiles,
			);

			// @ts-expect-error
			metafile.outputs[outKey] = metafile?.outputs[inKey];

			delete metafile?.outputs[inKey];
		});
	},
});

async function handleFileOnDisk(
	buildConfig: BuildOptions,
	outPath: string,
	inPath: string,
) {
	const rawContents = await readFile(inPath, 'utf8');

	if (!rawContents) throw new Error(`File is empty "${inPath}".`);

	const json = await compileJSON(rawContents, buildConfig);

	await writeFile(inPath, json);
	await rename(inPath, outPath);
}

async function handleFileInMemory(
	buildConfig: BuildOptions,
	outPath: string,
	inName: string,
	outputFiles: BuildResult['outputFiles'],
) {
	const entry = outputFiles!.find((item) => item.path.endsWith(inName));

	if (!entry) {
		const msg = [`No entry found for "${inName}".`];
		if (inName === defaultFilename) {
			msg[1] = `Filename is the default ("${defaultFilename}"); perhaps the actual filename is different?`;
		}
		throw new Error(msg.join(' '));
	}

	const contents = await compileJSON(entry.text, buildConfig);
	entry.contents = encodeUTF8(contents);
	entry.path = outPath;
}

const compileJSON = (contents: string, buildConfig: BuildOptions) => import(`data:text/javascript;charset=utf-8,${encodeURIComponent(contents)}`)
	.then((m) => JSON.stringify(m.default, null, buildConfig.minify ? 0 : 2))
	.catch((err) => {
		if (
			err.message.includes(ERR_REL_IMPORT)
			&& buildConfig.splitting
		) console.error(
			'A bug in esbuild causes a CJS ↔︎ ESM interop polyfill to be injected into all ES modules,',
			'regardless of whether they need it. If your file does not contain unreplaced imports',
			'(image imports are replaced), but you are seeing this error,',
			'that esbuild bug is likely the cause. See https://github.com/evanw/esbuild/issues/4321',
		);

		throw err;
	});

const ERR_REL_IMPORT = 'Invalid relative URL or base scheme is not hierarchical';
