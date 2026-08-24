import type { BuildOptions } from 'esbuild';
import path from 'node:path';
import process from 'node:process';


export type FileName = `${string}.${string}`;

export const getInPrefix = (
	inPath: string,
	inName: FileName,
	cwd = process.cwd(),
) => path.join(
	...inPath
		.replace(cwd, '')
		.replace(inName, '')
		.split(path.sep)
		.slice(1) // This assumes source code lives (directly) in a dir like `src/`
);

export const getInKey = (
	outPrefix: string,
	inPrefix: string,
	inName: FileName,
) => path.join(
	outPrefix,
	inPrefix,
	inName,
);

export const getOutPrefix = (
	outdir: BuildOptions['outdir'],
	cwd = process.cwd(),
) => outdir?.replace(cwd, '')!;

export const getOutKey = (
	outPrefix: string,
	outName: FileName,
) => path.join(
	outPrefix,
	outName,
);

export const getRootPath = (
	outdir: BuildOptions['outdir'],
	outName: FileName,
) => path.join(outdir!, outName);
