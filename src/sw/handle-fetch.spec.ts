import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

import { LocationMock } from '@jedmao/location';

import type handlers from './fetch-handlers.ts';


describe('ServiceWorker > handle fetch', { concurrency: false }, async () => {
	const origin = 'https://example.test';

	globalThis.fetch = mock.fn();
	// @ts-ignore
	globalThis.self = { location: new LocationMock(origin) };

	const cacheFirst = mock.fn(async () => {});
	const networkFirst = mock.fn(async () => {});
	const networkOnly = mock.fn(async () => {});

	const respondWith = mock.fn() as FetchEvent['respondWith'];

	mock.module('./fetch-handlers.ts', {
		exports: {
			default: {
				'cache-first': cacheFirst,
				'network-first': networkFirst,
				'network-only': networkOnly,
			} satisfies Record<keyof typeof handlers, Function>,
		},
	});

	afterEach(() => {
		cacheFirst.mock.resetCalls();
		networkFirst.mock.resetCalls();
		networkOnly.mock.resetCalls();
	});

	const { default: handleFetch } = await import('./handle-fetch.ts');

	it('cors requests > "network-only" strategy', () => {
		handleFetch({
			request: new Request('https://other.test/foo.png'),
			respondWith,
		} as FetchEvent);

		assert.equal(networkOnly.mock.callCount(), 1, 'network-only called');
		assert.equal(networkFirst.mock.callCount(), 0, 'network-first called');
		assert.equal(cacheFirst.mock.callCount(), 0, 'cache-first called');
	});

	describe('app asset files > "network-first" strategy', () => {
		it('based on url', () => {
			handleFetch({
				request: new Request(`${origin}/app/main.js`),
				respondWith,
			} as FetchEvent);

			assert.equal(networkOnly.mock.callCount(), 0, 'network-only called');
			assert.equal(networkFirst.mock.callCount(), 1, 'network-first called');
			assert.equal(cacheFirst.mock.callCount(), 0, 'cache-first called');
		});

		it('based "document" destination', () => {
			handleFetch({
				request: new Request(`${origin}/foo`, {
					headers: { 'sec-fetch-dest': 'document' },
				}),
				respondWith,
			} as FetchEvent);

			assert.equal(networkOnly.mock.callCount(), 0, 'network-only called');
			assert.equal(networkFirst.mock.callCount(), 1, 'network-first called');
			assert.equal(cacheFirst.mock.callCount(), 0, 'cache-first called');
		});

		it('based accepting "html" response', () => {
			handleFetch({
				request: new Request(`${origin}/foo`, {
					headers: { 'accept': 'text/html' },
				}),
				respondWith,
			} as FetchEvent);

			assert.equal(networkOnly.mock.callCount(), 0, 'network-only called');
			assert.equal(networkFirst.mock.callCount(), 1, 'network-first called');
			assert.equal(cacheFirst.mock.callCount(), 0, 'cache-first called');
		});
	});

	describe('card asset files > "cache-first" strategy', () => {
		it('a barcode', () => {
			handleFetch({
				request: new Request(`${origin}/card/abc123.svg`),
				respondWith,
			} as FetchEvent);

			assert.equal(networkOnly.mock.callCount(), 0, 'network-only called');
			assert.equal(networkFirst.mock.callCount(), 0, 'network-first called');
			assert.equal(cacheFirst.mock.callCount(), 1, 'cache-first called');
		});

		it('a logo', () => {
			handleFetch({
				request: new Request(`${origin}/logos/AH.svg`),
				respondWith,
			} as FetchEvent);

			assert.equal(networkOnly.mock.callCount(), 0, 'network-only called');
			assert.equal(networkFirst.mock.callCount(), 0, 'network-first called');
			assert.equal(cacheFirst.mock.callCount(), 1, 'cache-first called');
		});
	});
});
