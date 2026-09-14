import type {
	default as esbuild,
	OutputFile,
	PluginBuild,
} from 'esbuild';

import metafile from './metafile.fixt.ts';


const noop = () => {};

export const setupOpts = {
	onStart: (noop as PluginBuild['onStart']),
	resolve: (noop as unknown as PluginBuild['resolve']),
	onResolve: (noop as PluginBuild['onResolve']),
	onLoad: (noop as PluginBuild['onLoad']),
	onDispose: (noop as PluginBuild['onDispose']),
	esbuild: ({} as typeof esbuild),
} satisfies Omit<PluginBuild, 'initialOptions' | 'onEnd'>;

type MetaFile = typeof metafile;

export function onEndFactory<O extends OutputFile[]>(
	o: O,
	m?: typeof metafile,
): {
	metafile: MetaFile,
	onEnd: PluginBuild['onEnd'],
	outputFiles: O,
};
export function onEndFactory(
	o?: undefined,
	m?: typeof metafile,
): {
	metafile: MetaFile,
	onEnd: PluginBuild['onEnd'],
	outputFiles: undefined,
};
export function onEndFactory(
	o?: OutputFile[],
	m = structuredClone(metafile),
) {
	const outputFiles = o ? structuredClone(o) : o;
	const onEnd = (
		(
			cb: (result: {
				metafile: MetaFile,
				outputFiles: typeof outputFiles,
			}) => void
		) => cb({
			metafile: m,
			outputFiles,
		})
	) as any as PluginBuild['onEnd'];

	return {
		metafile: m,
		onEnd,
		outputFiles,
	};
}
