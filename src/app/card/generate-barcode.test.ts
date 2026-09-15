import assert from 'node:assert/strict';
import { describe, it } from 'node:test';


import { generateBarcodeFile } from './generate-barcode.ts';

describe('Generate barcode', { concurrency: true }, () => {
	describe('contents', { concurrency: true }, () => {
		it('should produce an SVG with the barcode', async (t) => {
			const id = 'a1b2c3';
			const file = generateBarcodeFile('123', id);

			assert.match(file.name, /\.svg$/);
			assert.match(file.name, new RegExp(id));
			assert.equal(file.type, 'image/svg+xml');

			t.assert.snapshot(await file.text());
		});
	});
});
