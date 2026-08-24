import type { Metafile } from 'esbuild';

const metafile = {
	outputs: {
		'dist/app/favicon.ico': {
			imports: [],
			exports: [],
			entryPoint: 'src/app/favicon.ico',
			inputs: {},
			bytes: 1,
		},
		'dist/sw/main.js': {
			imports: [],
			exports: [],
			entryPoint: 'src/sw/main.ts',
			inputs: {},
			bytes: 2,
		},
		'dist/sw/register.js': {
			imports: [],
			exports: [],
			entryPoint: 'src/sw/register.ts',
			inputs: {},
			bytes: 3,
		},
		'dist/app/main.js': {
			imports: [],
			exports: [],
			entryPoint: 'src/app/main.tsx',
			cssBundle: 'dist/app/main.css',
			inputs: {},
			bytes: 3,
		},
		'dist/app/main.css': {
			imports: [],
			exports: [],
			entryPoint: 'src/app/main.tsx',
			cssBundle: 'dist/app/main.css',
			inputs: {
					'node_modules/kelpui/css/kelp.css': { bytesInOutput: 1 },
					'src/app/App.module.css': { bytesInOutput: 1 },
					'src/app/CardList.module.css': { bytesInOutput: 1 },
					'src/app/Prerequisites/Prerequisites.module.css': { bytesInOutput: 1 },
			},
			bytes: 3,
		},
		'dist/webmanifest/icons/192p.png': { // should be ignored
			imports: [],
			exports: [],
			inputs: { 'src/webmanifest/icons/192p.png': { bytesInOutput: 3442 } },
			bytes: 3442
		},
		'dist/app/index.ejs': {
			imports: [],
			exports: [],
			entryPoint: 'src/app/index.ejs',
			inputs: { 'src/app/index.ejs': { bytesInOutput: 1425 } },
			bytes: 1425
		},
		'dist/webmanifest/app.webmanifest': {
			imports: [],
			exports: ['default'],
			entryPoint: 'src/webmanifest/webmanifest.ts',
			inputs: {},
			bytes: 5957,
		},
	},
} satisfies Pick<Metafile, 'outputs'>;

export default metafile;
