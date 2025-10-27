import {
	copyFile,
	readdir,
	readFile,
	stat,
	writeFile,
} from 'node:fs/promises';
import path from 'node:path';

import {
	type Plugin,
} from 'esbuild';
import type { WebAppManifest } from 'web-app-manifest';

export type IndexEJSOptions = Partial<{
	env: 'development' | 'production' | 'test',
	hot: true,
}>;

export const compileWebmanifest = (): Plugin => ({
	name: 'Compile app.webmanifest',
	async setup({ onEnd, onLoad, resolve }) {
		onLoad({ filter: /\.webmanifest/ }, async ({ path: manifestFSPath }) => {
			// const contents = await getManifestContents(filepath);
			console.log('filepath:', manifestFSPath)
			let contents = await readFile(manifestFSPath, 'utf8');

			const iconsBaseFSPath = path.join(path.dirname(manifestFSPath), 'icons');
			const icons = [];
			for (const iconFilename of await readdir(iconsBaseFSPath)) {
				if (!iconFilename.endsWith('.png')) continue;

				const iconFSPath = path.join(iconsBaseFSPath, iconFilename);

				icons.push(iconFSPath);

				console.log('resolve result:', await resolve(`./icons/${iconFilename}`, {
					importer: manifestFSPath,
					kind: 'import-statement',
					namespace: 'file',
					resolveDir: path.join(path.dirname(manifestFSPath), 'icons'),
				}));
			}

			console.log('[Compile app.webmanifest] icons:', icons)

			contents = JSON.stringify(Object.assign(JSON.parse(contents), {
				icons: icons.map((iconFSPath) => {
					const size = path.basename(iconFSPath, '.png');

					return {
						"src": `./icons/${size}.png`,
						"type": "image/png",
						"sizes": `${size}x${size}`,
					};
				}),
			}), null, 2);

			// if (!contents) return;

			// const icons = contents.icons.map((filepath) => {
			// 	copyFile(filepath)
			// });

			return {
				contents,
				loader: 'copy',
				watchFiles: icons,
			};
		});

		onEnd(async ({ metafile }) => {
			console.log('metafile:', metafile)
		});
	},
});

function buildWebmanifest(contents: string) {
	const manifest: WebAppManifest = JSON.parse(contents);
}

// const cache: {
// 	manifest: {
// 		changed: number,
// 		contents: object,
// 	},
// 	icons: { [key: string]: number },
// } = {
// 	manifest: {
// 		contents: {},
// 		changed: 0,
// 	},
// 	icons: {},
// };
// async function getManifestContents(filepath: string) {
// 	let hasAnythingChanged = false;

// 	const { mtimeMs: manifestChanged } = await stat(filepath);
// 	let manifest = cache.manifest.contents;
// 	if (manifestChanged > cache.manifest.changed) {
// 		hasAnythingChanged = true;
// 		cache.manifest.contents = manifest = JSON.parse(await readFile(filepath, 'utf8'));
// 		cache.manifest.changed = manifestChanged;
// 	}

// 	const icons = [];
// 	for (const iconFSPath of await readdir(path.join(path.dirname(filepath), 'icons'))) {
// 		icons.push(iconFSPath);

// 		const { mtimeMs: iconChanged } = await stat(iconFSPath);

// 		if (iconChanged > (cache.icons[iconFSPath] ?? 0)) {
// 			cache.icons[iconFSPath] = iconChanged;
// 		}
// 	}

// 	if (hasAnythingChanged) return {
// 		icons,
// 		manifest,
// 	};

// 	return;
// }

// async function getManifestIcons(manifestLocation: string) {
// 	return ().filter((filename) => filename.endsWith('.png'));
// }
