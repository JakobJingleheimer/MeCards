import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

import type { MediaType } from '../storage/media.ts';


describe('Merchant Info', async () => {
	const mediaFind = mock.fn(async () => false);
	const mediaSave = mock.fn(async () => 'https://cdn.example.com/logo.svg');

	mock.module('../storage/media.ts', {
		namedExports: {
			media: {
				find: mediaFind,
				save: mediaSave,
			},
		},
	});

	const {
		retrieveMerchantLogo,
		composeMerchantSlug,
		ENTITIES_SEARCH_ENDPOINT,
		ENTITY_META_ENDPOINT,
		MEDIA_ENDPOINT,
	} = await import('./merchant-info.ts');

	function jsonResponse(body: unknown, ok = true) {
		return { ok, json: async () => body } as Response;
	}
	function blobResponse(blob: Blob, ok = true) {
		return { ok, blob: async () => blob } as Response;
	}

	beforeEach(() => {
		mediaFind.mock.resetCalls();
		mediaSave.mock.resetCalls();
		mediaFind.mock.mockImplementation(async () => false);
		mediaSave.mock.mockImplementation(async () => 'https://cdn.example.com/logo.svg');
	});

	describe('composeMerchantSlug', () => {
		it('capitalizes a single word', () => {
			assert.equal(composeMerchantSlug('ikea'), 'Ikea');
		});

		it('title-cases each word and joins them with underscores', () => {
			assert.equal(composeMerchantSlug('albert heijn'), 'Albert_Heijn');
		});

		it('normalizes all-caps input to title case', () => {
			assert.equal(composeMerchantSlug('ALDI SUD'), 'Aldi_Sud');
		});

		it('normalizes mixed-case input consistently', () => {
			assert.equal(composeMerchantSlug('mcDONALDs restaurant'), 'Mcdonalds_Restaurant');
		});
	});

	describe('retrieveMerchantLogo', () => {
		it('returns early, without touching the network, if a logo is already stored', async (t) => {
			mediaFind.mock.mockImplementationOnce(async () => true);
			const fetchMock = t.mock.method(globalThis, 'fetch');

			const result = await retrieveMerchantLogo('Albert Heijn');

			assert.equal(result, undefined);
			assert.equal(mediaFind.mock.callCount(), 1);
			assert.deepEqual(mediaFind.mock.calls[0]!.arguments, ['Albert Heijn', 'logo']);
			assert.equal(fetchMock.mock.callCount(), 0);
			assert.equal(mediaSave.mock.callCount(), 0);
		});

		it('checks media.find with the merchant name and the "logo" kind', async (t) => {
			t.mock.method(globalThis, 'fetch', async () => jsonResponse({ results: [] }));

			await assert.rejects(() => retrieveMerchantLogo('Some Store'));

			assert.deepEqual(mediaFind.mock.calls[0]!.arguments, ['Some Store', 'logo']);
		});

		it('throws "Merchant not found" when no result has an exact label match', async (t) => {
			const fetchMock = t.mock.method(globalThis, 'fetch', async () =>
				jsonResponse({
					results: [
						{ id: 'Q1', match: { type: 'alias' } },
						{ id: 'Q2', match: { type: 'alias' } },
					],
				}),
			);

			await assert.rejects(
				() => retrieveMerchantLogo('Nonexistent Merchant'),
				/Merchant not found/,
			);

			assert.equal(fetchMock.mock.callCount(), 1);
			assert.equal(mediaSave.mock.callCount(), 0);
		});

		it('throws "<name> has no logo" when the matched entity has no P154 claim', async (t) => {
			let call = 0;
			const fetchMock = t.mock.method(globalThis, 'fetch', async () => {
				call += 1;
				if (call === 1) {
					return jsonResponse({ results: [{ id: 'Q123', match: { type: 'label' } }] });
				}
				return jsonResponse({ entities: { Q123: { claims: {} } } });
			});

			await assert.rejects(
				() => retrieveMerchantLogo('No Logo Co'),
				/No Logo Co has no logo/,
			);

			assert.equal(fetchMock.mock.callCount(), 2);
			assert.equal(mediaSave.mock.callCount(), 0);
		});

		it('propagates the raw response when an intermediate JSON fetch is not ok', async (t) => {
			t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 500 }));

			await assert.rejects(
				() => retrieveMerchantLogo('Whatever Co'),
				(err: any) => err?.ok === false && err?.status === 500,
			);

			assert.equal(mediaSave.mock.callCount(), 0);
		});

		it('propagates the raw response when the final image fetch fails', async (t) => {
			let call = 0;
			t.mock.method(globalThis, 'fetch', async () => {
				switch (++call) {
					case 1: return jsonResponse({ results: [{ id: 'Q1', match: { type: 'label' } }] });

					case 2: return jsonResponse({
						entities: { Q1: { claims: { P154: [{ mainsnak: { datavalue: { value: 'Logo.svg' } } }] } } },
					});

					case 3: return jsonResponse({ original: { url: 'https://upload.wikimedia.org/broken.svg' } });

					default: return { ok: false, status: 404 } as Response;
				}
			});

			await assert.rejects(
				() => retrieveMerchantLogo('Broken Co'),
				(err: any) => err?.ok === false && err?.status === 404,
			);

			assert.equal(mediaSave.mock.callCount(), 0);
		});

		it('runs the full search → meta → media → download pipeline and saves the logo', async (t) => {
			const blob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' });
			const calls: string[] = [];

			const fetchMock = t.mock.method(globalThis, 'fetch', async (url: string) => {
				calls.push(url.toString());
				switch (calls.length) {
					case 1:
						return jsonResponse({
							results: [
								{ id: 'Q999', match: { type: 'alias' } },
								{ id: 'Q123', match: { type: 'label' } },
							],
						});
					case 2:
						return jsonResponse({
							entities: {
								Q123: {
									claims: {
										P154: [{ mainsnak: { datavalue: { value: 'Albert Heijn Logo.svg' } } }],
									},
								},
							},
						});
					case 3:
						return jsonResponse({ original: { url: 'https://upload.wikimedia.org/logo-original.svg' } });
					case 4:
						return blobResponse(blob);
					default:
						throw new Error(`unexpected fetch call #${calls.length}`);
				}
			});

			mediaSave.mock.mockImplementationOnce(async () => 'https://cdn.example.com/logos/albert-heijn.svg');

			const result = await retrieveMerchantLogo('Albert Heijn');

			assert.equal(result, 'https://cdn.example.com/logos/albert-heijn.svg');
			assert.equal(fetchMock.mock.callCount(), 4);
			assert.equal(calls[0], `${ENTITIES_SEARCH_ENDPOINT}${encodeURIComponent('Albert Heijn')}`);
			assert.equal(calls[1], `${ENTITY_META_ENDPOINT}Q123.json`);
			assert.equal(calls[2], `${MEDIA_ENDPOINT}Albert_Heijn_Logo.svg`);
			assert.equal(calls[3], 'https://upload.wikimedia.org/logo-original.svg');

			assert.equal(mediaSave.mock.callCount(), 1);

			const [savedFile, savedKind] = mediaSave.mock.calls[0]!.arguments as any as [File, MediaType];

			assert.ok(savedFile instanceof File);
			assert.equal(savedFile.name, 'Albert_Heijn.svg');
			assert.equal(savedFile.type, blob.type);
			assert.equal(savedKind, 'logo');
		});

		it('picks the last P154 claim when multiple are present', async (t) => {
			const blob = new Blob(['<svg></svg>'], { type: 'image/svg+xml' });
			let call = 0;

			t.mock.method(globalThis, 'fetch', async () => {
				switch (++call) {
					case 1: return jsonResponse({ results: [{ id: 'Q7', match: { type: 'label' } }] });

					case 2: return jsonResponse({
						entities: {
							Q7: {
								claims: {
									P154: [
										{ mainsnak: { datavalue: { value: 'Old Logo.svg' } } },
										{ mainsnak: { datavalue: { value: 'Current Logo.svg' } } },
									],
								},
							},
						},
					});

					case 3: return jsonResponse({ original: { url: 'https://upload.wikimedia.org/current.svg' } });

					default: return blobResponse(blob);
				}
			});

			await retrieveMerchantLogo('Some Merchant');

			const [savedFile] = mediaSave.mock.calls[0]!.arguments as any as [File];

			assert.equal(savedFile.name, 'Some_Merchant.svg');
		});
	});
});
