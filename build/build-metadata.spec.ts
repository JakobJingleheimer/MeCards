import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { composeBuildMetadata } from './build-metadata.ts';
import metafile from './metafile.fixt.ts';
import { config } from './config.ts';


describe('Compose Build Meta', { concurrency: true }, () => {
	it('should find stylesheets', () => {
		const assets = composeBuildMetadata(metafile.outputs, config);

		assert.partialDeepStrictEqual(assets.css, [
			'/app/main.css',
		]);
	});

	it('should find a favicon', () => {
		const assets = composeBuildMetadata(metafile.outputs, config);

		assert.partialDeepStrictEqual(assets.favicon, '/app/favicon.ico');
	});

	it('should find scripts, ignoring service-worker files that are NOT "register"', () => {
		const assets = composeBuildMetadata(metafile.outputs, config);

		assert.partialDeepStrictEqual(assets.scripts, [
			{
				isModule: true,
				src: '/sw/register.js',
			},
			{
				isModule: true,
				src: '/app/main.js',
			},
		]);
	});

	it('should find a web manifest', () => {
		const assets = composeBuildMetadata(metafile.outputs, config);

		assert.partialDeepStrictEqual(assets.webmanifest, '/webmanifest/app.webmanifest');
	});
});
