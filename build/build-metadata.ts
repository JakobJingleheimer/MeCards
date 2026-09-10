import { readFileSync } from 'node:fs';
import { findPackageJSON } from 'node:module';

import { type BuildOptions, type Metafile } from 'esbuild';
import type { PackageJson } from 'type-fest';


export function composeBuildMetadata(
	outputs: Metafile['outputs'],
	buildConfig: BuildOptions,
) {
	const assets = {
		css: [] as string[],
		favicon: '',
		ogImage: '',
		scripts: [] as Array<{ isModule: boolean, src: string }>,
		webmanifest: '',
	};
	const meta = {
		description: '',
		name: '',
	};

	const pjsonPath = findPackageJSON('.', `${process.cwd()}/`);
	let pjson;
	if (pjsonPath) {
		try {
			pjson = JSON.parse(readFileSync(pjsonPath, 'utf8')) as PackageJson;
			if (pjson) {
				meta.description = pjson.description!;
				meta.name = pjson.name!;
			}
		} catch (err) {
			console.error('Could not read meta info from package.json');
		}
	}

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
			case 'jpg': // deliberate fallthru
			case 'png': {
				const base = buildConfig.write && pjson?.homepage || '';
				if (relUrl.endsWith('og.png')) assets.ogImage = `${base}${relUrl}`;
				break;
			}
			case 'webmanifest': assets.webmanifest = relUrl; break;
		}
	}

	return { assets, meta };
}
