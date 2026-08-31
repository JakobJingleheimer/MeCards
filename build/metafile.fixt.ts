import type { Metafile } from 'esbuild';

const metafile = {
	outputs: {
		'docs/app/favicon.ico': {
			imports: [],
			exports: [],
			entryPoint: 'src/app/favicon.ico',
			inputs: {},
			bytes: 1,
		},
		'docs/sw/main.js': {
			imports: [],
			exports: [],
			entryPoint: 'src/sw/main.ts',
			inputs: {},
			bytes: 2,
		},
		'docs/sw/register.js': {
			imports: [],
			exports: [],
			entryPoint: 'src/sw/register.ts',
			inputs: {},
			bytes: 3,
		},
		'docs/app/main.js': {
			imports: [],
			exports: [],
			entryPoint: 'src/app/main.tsx',
			cssBundle: 'docs/app/main.css',
			inputs: {},
			bytes: 3,
		},
		'docs/app/main.css': {
			imports: [],
			exports: [],
			entryPoint: 'src/app/main.tsx',
			cssBundle: 'docs/app/main.css',
			inputs: {
					'node_modules/kelpui/css/kelp.css': { bytesInOutput: 1 },
					'src/app/App.module.css': { bytesInOutput: 1 },
					'src/app/CardList.module.css': { bytesInOutput: 1 },
					'src/app/Prerequisites/Prerequisites.module.css': { bytesInOutput: 1 },
			},
			bytes: 3,
		},
		'docs/webmanifest/icons/192p.png': { // should be ignored
			imports: [],
			exports: [],
			inputs: { 'src/webmanifest/icons/192p.png': { bytesInOutput: 3442 } },
			bytes: 3442
		},
		'docs/app/index.ejs': {
			imports: [],
			exports: [],
			entryPoint: 'src/app/index.ejs',
			inputs: { 'src/app/index.ejs': { bytesInOutput: 1425 } },
			bytes: 1425
		},
		'docs/webmanifest/app.webmanifest': {
			imports: [],
			exports: ['default'],
			entryPoint: 'src/webmanifest/webmanifest.ts',
			inputs: {},
			bytes: 5957,
		},
	},
} satisfies Pick<Metafile, 'outputs'>;

export default metafile;
