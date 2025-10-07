import { copyFile, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ejs from 'ejs';
import { build } from 'esbuild';

import { config } from "./config.ts";

const tmpl = await readFile('./src/index.ejs', 'utf8');

const { errors } = await build({
	...config,
	entryNames: '[dir]/[name]-[hash]',
	minify: true,
});

if (errors.length) throw new AggregateError(errors);
