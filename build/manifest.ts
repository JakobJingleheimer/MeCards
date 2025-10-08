import { type BuildOptions, type Metafile } from 'esbuild';

export function composeManifest(metafile: Metafile, buildConfig: BuildOptions) {
	const assets = {
		css: [] as string[],
		favicon: '',
		scripts: [] as Array<{ isModule: boolean, src: string }>,
		webmanifest: '',
	};

	const isModule = buildConfig.format === 'esm';

	for (const file of Object.keys(metafile.outputs)) {
		const relUrl = file.replace('dist', '.');
		switch (file.split('.').at(-1)) {
			case 'css': assets.css.push(relUrl); break;
			case 'ico': assets.favicon = relUrl; break;
			case 'js': assets.scripts.push({ isModule, src: relUrl }); break;
			case 'webmanifest': assets.webmanifest = relUrl; break;
		}
	}

	return assets;
}
