import {
	readFile,
	rename,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
	type BuildOptions,
	type BuildResult,
	type Plugin,
} from 'esbuild';

import { findEntrypoint } from './find-entrypoint.ts';

export type IndexEJSOptions = Partial<{
	env: 'development' | 'production' | 'test',
	hot: true,
}>;

const encoder = new TextEncoder();
const encodeUTF8 = (...args: Parameters<TextEncoder['encode']>) => encoder.encode(...args);

const defaultFilename = 'webmanifest.ts';
export const compileWebmanifestPlugin = (filename: string = defaultFilename): Plugin => ({
	name: 'Compile app.webmanifest',
	async setup({ initialOptions, onEnd }) {
		const outdir = initialOptions.outdir!;
		const outdirName = path.basename(outdir);

		const originalOutputFilename = filename.replace(path.extname(filename), '.js');
		const originalPath = findEntrypoint(initialOptions, filename);

		onEnd(async ({ metafile, outputFiles }) => {
			const {
				finalOutputPath,
				originalOutputPath,
			} = initialOptions.write === false
				? await composeForStream(initialOptions, outputFiles, { filename, originalOutputFilename })
				: await composeForFS(initialOptions, originalPath);

			if (metafile) {
				const originalOutputSegment = path.join(
					outdirName,
					originalOutputPath.replace(outdir, ''),
				);
				const finalOutputSegment = path.join(
					outdirName,
					finalOutputPath.replace(outdir, ''),
				);

				metafile.outputs[finalOutputSegment] = metafile.outputs[originalOutputSegment]!;

				delete metafile.outputs[originalOutputSegment];
			}
		});
	},
});

async function composeForFS(
	initialOptions: BuildOptions,
	originalPath: string,
) {
	const idx = findEndOfLongestPrefix(
		initialOptions.outdir,
		originalPath,
	);
	const outSeg = originalPath.slice(
		idx + 1 + originalPath
		.slice(idx)
		.indexOf(path.sep)
	);

	const originalOutputPath = path.join(
		initialOptions.outdir!,
		outSeg.replace('.ts', '.js'),
	);

	const rawContents = await readFile(originalOutputPath, 'utf8');

	if (!rawContents) throw new Error(`File is empty "${originalOutputPath}".`);

	const json = await compileJSON(rawContents, initialOptions);

	await writeFile(
		originalOutputPath,
		json,
	);

	const finalOutputPath = composeFinalOutputPath(originalOutputPath);
	await rename(
		originalOutputPath,
		finalOutputPath,
	);

	return {
		finalOutputPath,
		originalOutputPath,
	};
}

async function composeForStream(
	initialOptions: BuildOptions,
	outputFiles: BuildResult['outputFiles'],
	{
		filename,
		originalOutputFilename,
	}: {
		filename: string,
		originalOutputFilename: string,
	},
) {
	const entry = outputFiles!.find((item) => item.path.endsWith(originalOutputFilename));
	if (!entry) {
		const msg = [`No entry found for ${originalOutputFilename}.`];
		if (filename === defaultFilename) {
			msg[1] = `Filename is the default ('${defaultFilename}'); perhaps the actual filename is different?`;
		}
		throw new Error(msg.join(' '));
	}

	const contents = await compileJSON(entry.text, initialOptions);
	entry.contents = encodeUTF8(contents);

	const finalOutputPath = composeFinalOutputPath(entry.path);
	const originalOutputPath = entry.path;

	entry.path = finalOutputPath;

	return {
		finalOutputPath,
		originalOutputPath,
	};
}

const composeFinalOutputPath = (outputPath: string) => path.join(
	path.dirname(outputPath),
	'app.webmanifest',
);

const compileJSON = (contents: string, initialOptions: BuildOptions) => import(`data:text/javascript;charset=utf-8,${encodeURIComponent(contents)}`)
	.then((m) => JSON.stringify(m.default, null, initialOptions.minify ? 0 : 2))
	.catch((err) => {
		if (
			err.message.includes(ERR_REL_IMPORT)
			&& initialOptions.splitting
		) console.error(
			'A bug in esbuild causes a CJS ↔︎ ESM interop polyfill to be injected into all ES modules,',
			'regardless of whether they need it. If your file does not contain unreplaced imports',
			'(image imports are replaced), but you are seeing this error,',
			'that esbuild bug is likely the cause. See https://github.com/evanw/esbuild/issues/4321',
		);

		throw err;
	});

const ERR_REL_IMPORT = 'Invalid relative URL or base scheme is not hierarchical';

function findEndOfLongestPrefix(a: string = '', b: string = '') {
	let i = 0;
	while (a[i] === b[i]) i++;

	return i;
}
