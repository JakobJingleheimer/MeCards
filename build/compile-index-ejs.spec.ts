import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type {
	default as esbuild,
	BuildOptions,
	OutputFile,
	PluginBuild,
} from 'esbuild';

import metafile from './metafile.fixt.ts';


describe('Compile index.ejs (esbuild plugin)', { concurrency: true }, async () => {
	const mock_fsRename = mock.fn(async () => {});
	const mock_fsWriteFile = mock.fn(async () => {});

	const noop = () => {};

	const setupOpts = {
		onStart: (noop as PluginBuild['onStart']),
		resolve: (noop as unknown as PluginBuild['resolve']),
		onResolve: (noop as PluginBuild['onResolve']),
		onLoad: (noop as PluginBuild['onLoad']),
		onDispose: (noop as PluginBuild['onDispose']),
		esbuild: ({} as typeof esbuild),
	} satisfies Omit<PluginBuild, 'initialOptions' | 'onEnd'>;

	mock.module('node:fs/promises', {
		exports: {
			readFile,
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

	const ejsTemplatePath = path.resolve(config.outdir!, 'app/index.ejs');
	const outputPath = path.resolve(config.outdir!, 'index.html');

	const decoder = new TextDecoder();
	const outputFiles = [
		{
			contents: new Uint8Array(),
			get text() { return decoder.decode(this.contents) },
			hash: 'e1j2s3',
			path: ejsTemplatePath,
		},
	] satisfies OutputFile[];

	function onEndFactory(
		m = structuredClone(metafile),
		o = structuredClone(outputFiles),
	) {
		const onEnd = (
			(
				cb: (result: {
					metafile: typeof m,
					outputFiles: typeof o,
				}) => void
			) => cb({ metafile: m, outputFiles: o })
		) as any as PluginBuild['onEnd'];

		return {
			metafile: m,
			onEnd,
			outputFiles: o,
		};
	}

	const { compileIndexEJSPlugin: plugin } = await import('./compile-index-ejs.ts');

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

	it('should compile the index.html file', (t) => {
		const inKey = 'docs/app/index.ejs';
		const outKey = 'docs/index.html';
		const { setup } = plugin();

		t.test('in-memory (dev mode)', async (c) => {
			const {
				metafile: m,
				onEnd,
				outputFiles: o,
			} = onEndFactory(metafile, outputFiles);

			// confirm it starts there (so we know the test isn't reporting false success)
			assert.ok(inKey in m.outputs, 'original metafile output key exists');

			await setup({
				...setupOpts,
				initialOptions: {...config, write: false },
				onEnd,
			});

			const entry = o.find((item) => item.path === outputPath);

			c.assert.snapshot(entry!.text);

			assert.ok(outKey in m.outputs, 'new metafile output key exists');
			assert.ok(!(inKey in m.outputs), 'old metafile output key removed');

			assert.equal(mock_fsWriteFile.mock.callCount(), 0, 'did not try to write to disk');
			assert.equal(mock_fsRename.mock.callCount(), 0, 'did not try to rename file(s)');
		});

		t.test('on-disk (prod mode)', async (c) => {
			const {
				metafile: m,
				onEnd,
			} = onEndFactory(metafile, undefined);

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

			assert.equal(writePath, 'index.ejs', 'write location');
			c.assert.snapshot(writeContents);

			const [
				// @ts-expect-error the type is wrong
				renameFrom,
				// @ts-expect-error the type is wrong
				renameTo,
			] = mock_fsRename.mock.calls[0]?.arguments!;

			assert.equal(renameFrom, 'index.ejs', 'rename from');
			assert.equal(renameTo, outputPath, 'rename to');

			assert.ok(outKey in m.outputs, 'new metafile output key exists');
			assert.ok(!(inKey in m.outputs), 'old metafile output key removed');
		});
	});
});
