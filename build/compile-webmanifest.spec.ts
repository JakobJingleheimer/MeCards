import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { afterEach, describe, it, mock } from 'node:test';
import path from 'node:path';

import esbuild, {
	type BuildOptions,
	type OutputFile,
	type PluginBuild,
} from 'esbuild';

import { findEntrypoint } from './find-entrypoint.ts';
import { onEndFactory, setupOpts } from './plugin.fixt.ts';


describe('Compile WebManifest (esbuild plugin)', { concurrency: true }, async () => {
	async function readManifestOrig() {
		const swOrig = await readFile(
			findEntrypoint(config, 'webmanifest/webmanifest.ts')!,
			'utf8',
		);

		return (await esbuild.transform(swOrig, { loader: 'ts' })).code;
	}
	const mock_fsReadFile = mock.fn(async () => readManifestOrig());
	const mock_fsRename = mock.fn(async () => {});
	const mock_fsWriteFile = mock.fn(async () => {});

	mock.module('node:fs/promises', {
		exports: {
			readFile: mock_fsReadFile,
			rename: mock_fsRename,
			writeFile: mock_fsWriteFile,
		},
	});

	afterEach(() => {
		mock_fsRename.mock.resetCalls();
		mock_fsWriteFile.mock.resetCalls();
	});

	// transient import of node:fs/promises, so must come after mock.module
	const { config } = await import('./config.ts');

	const wmTransPath = path.resolve(config.outdir!, 'webmanifest/webmanifest.js');
	const outputPath = path.resolve(config.outdir!, 'app.webmanifest');

	const encoder = new TextEncoder();
	const outputFiles = [
		{
			contents: encoder.encode(await readManifestOrig()),
			get text() { return 'replace me after cloning' },
			hash: 's1w2k3',
			path: wmTransPath,
		},
	] satisfies OutputFile[];

	const { compileWebManifestPlugin: plugin } = await import('./compile-webmanifest.ts');

	it('should error when no entry point is found', async () => {
		const mock_onEnd = mock.fn();

		const { setup } = plugin();

		await assert.rejects(
			() => setup({
				...setupOpts,
				initialOptions: ({ entryPoints: [] } as BuildOptions),
				onEnd: (mock_onEnd as PluginBuild['onEnd']),
			}) as Promise<void>,
			/entry-point/,
		);

		assert.equal(mock_onEnd.mock.callCount(), 0);
		assert.equal(mock_fsRename.mock.callCount(), 0);
		assert.equal(mock_fsWriteFile.mock.callCount(), 0);
	});

	it('should compile the service worker file', (t) => {
		const inKey = 'docs/webmanifest/webmanifest.js';
		const outKey = 'docs/webmanifest/app.webmanifest';
		const { setup } = plugin();

		t.test('in-memory (dev mode)', {
			expectFailure: /ERR_UNSUPPORTED_RESOLVE_REQUEST/, // [1]
		}, async (c) => {
			const {
				metafile: m,
				onEnd,
				outputFiles: o,
			} = onEndFactory(outputFiles);

			// confirm it starts there (so we know the test isn't reporting false success)
			assert.ok(inKey in m.outputs, 'original metafile output key exists');

			await setup({
				...setupOpts,
				initialOptions: {...config, write: false },
				onEnd,
			});

			const entry = o.find((item) => item.path === wmTransPath);

			c.assert.snapshot(entry!.text);

			assert.ok(outKey in m.outputs, 'new metafile output key exists');
			assert.ok(!(inKey in m.outputs), 'old metafile output key removed');

			assert.equal(mock_fsWriteFile.mock.callCount(), 0, 'did not try to write to disk');
			assert.equal(mock_fsRename.mock.callCount(), 0, 'did not try to rename file(s)');
		});

		t.test('on-disk (prod mode)', {
			expectFailure: /ERR_UNSUPPORTED_RESOLVE_REQUEST/, // [1]
		}, async (c) => {
			const {
				metafile: m,
				onEnd,
			} = onEndFactory();

			// confirm it starts there (so we know the test isn't reporting false success)
			assert.ok(inKey in m.outputs, 'original metafile output key exists');

			await setup({
				...setupOpts,
				initialOptions: {...config, write: true },
				onEnd,
			});

			const [
				// @ts-expect-error the type is wrong
				writePath,
				// @ts-expect-error the type is wrong
				writeContents,
			] = mock_fsWriteFile.mock.calls[0]?.arguments!;

			assert.equal(writePath, outputPath, 'write location');
			c.assert.snapshot(writeContents);

			const [
				// @ts-expect-error the type is wrong
				renameFrom,
				// @ts-expect-error the type is wrong
				renameTo,
			] = mock_fsRename.mock.calls[0]?.arguments!;

			assert.equal(renameFrom, wmTransPath, 'rename from');
			assert.equal(renameTo, outputPath, 'rename to');

			assert.ok(outKey in m.outputs, 'new metafile output key exists');
			assert.ok(!(inKey in m.outputs), 'old metafile output key removed');
		});
	});
});
