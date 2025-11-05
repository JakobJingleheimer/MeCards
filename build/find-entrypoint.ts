import type { BuildOptions } from "esbuild";

export function findEntrypoint({ entryPoints }: BuildOptions, filename: string) {
	if (!entryPoints) throw new Error('BuildOptions.entryPoints is required');

	let entrypoint = '';

	for ( const item of
		Array.isArray(entryPoints) ? entryPoints : Object.values(entryPoints)
	) {
		const input = typeof item === 'string' ? item : item.in;

		if (input.endsWith(filename)) {
			entrypoint = input;
			break;
		}
	};

	return entrypoint;
}
