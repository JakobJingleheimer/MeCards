import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { composeBuildMetadata } from './build-metadata.ts';
import metafile from './metafile.fixt.ts';
import { config } from './config.ts';


describe('Compose Build Meta', { concurrency: true }, () => {
	it('should find assets', (t) => {
		const { assets } = composeBuildMetadata(metafile.outputs, config);

		t.test('stylesheets', () => {
			assert.partialDeepStrictEqual(assets.css, ['/app/main.css']);
		});

		t.test('favicon', () => {
			assert.equal(assets.favicon, '/app/favicon.ico');
		});

		t.test('scripts, ignoring service-worker files that are NOT "register"', () => {
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

		t.test('web manifest', () => {
			assert.equal(assets.webmanifest, '/webmanifest/app.webmanifest');
		});
	});
	it('should include meta', (t) => {
		const { meta } = composeBuildMetadata(metafile.outputs, config);

		t.test('description', () => {
			assert.ok(meta.description);
		});

		t.test('name', () => {
			assert.ok(meta.name);
		});
	});
});
