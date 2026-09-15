import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';


describe('Prerequisite checks', { concurrency: true }, async () => {
	const mock_persistStorage = mock.fn();
	const mock_matchMedia = mock.fn();

	Object.assign(globalThis.navigator, {
		storage: { persist: mock_persistStorage },
	});

	Object.assign(globalThis, {
		window: { matchMedia: mock_matchMedia },
	});

	const {
		hasPersistedStorage,
		isInstalled,
	} = await import('./checks.ts');

	describe('persisted storage', () => {
		it('should signal whether persisted', (t) => {
			t.test('persisted', async () => {
				mock_persistStorage.mock.mockImplementationOnce(
					// @ts-ignore
					async () => true
				);
				const set = mock.fn();
				const result = await hasPersistedStorage(set);

				assert.equal(set.mock.calls[0]?.arguments[0], true, 'setter');
				assert.equal(result, true, 'return');
			});

			t.test('NOT persisted', async () => {
				mock_persistStorage.mock.mockImplementationOnce(
					// @ts-ignore
					async () => false
				);
				const set = mock.fn();
				const result = await hasPersistedStorage(set);

				assert.equal(set.mock.calls[0]?.arguments[0], false, 'setter');
				assert.equal(result, false, 'return');
			});
		});

		it('should signal when something went wrong', async () => {
			mock_persistStorage.mock.mockImplementationOnce(
				// @ts-ignore
				async () => { throw new Error('Oh snap!') }
			);
			const set = mock.fn();
			const result = await hasPersistedStorage(set);

			assert.equal(set.mock.calls[0]?.arguments[0], false, 'setter');
			assert.equal(result, false, 'return');
		});
	});

	describe('is installed', () => {
		it('should signal whether installed', (t) => {
			t.test('installed', () => {
				mock_matchMedia.mock.mockImplementationOnce(
					// @ts-ignore
					() => ({ matches: true })
				);

				assert.equal(isInstalled(), true);
			});

			t.test('NOT installed', () => {
				mock_matchMedia.mock.mockImplementationOnce(
					// @ts-ignore
					() => ({ matches: false })
				);

				assert.equal(isInstalled(), false);
			});
		});
	});
});
