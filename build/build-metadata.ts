import { type BuildOptions, type Metafile } from 'esbuild';

export function composeBuildMetadata(outputs: Metafile['outputs'], buildConfig: BuildOptions) {
	const assets = {
		css: [] as string[],
		favicon: '',
		scripts: [] as Array<{ isModule: boolean, src: string }>,
		webmanifest: '',
	};

	const isModule = buildConfig.format === 'esm';

	for (const file of Object.keys(outputs)) {
		const relUrl = file.replace('docs', '');
		switch (file.split('.').at(-1)) {
			case 'css': assets.css.push(relUrl); break;
			case 'ico': assets.favicon = relUrl; break;
			case 'js': {
				if (!(
					(
						relUrl.includes('sw/')
						|| relUrl.includes('service-worker/')
					)
					&& !relUrl.includes('register')
				)) assets.scripts.push({
					isModule,
					src: relUrl,
				});

				break;
			}
			case 'webmanifest': assets.webmanifest = relUrl; break;
		}
	}

	return assets;
}
