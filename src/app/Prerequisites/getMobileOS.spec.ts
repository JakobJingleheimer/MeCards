import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getMobileOS } from './getMobileOS.ts';


describe('Detect Mobile OS', { concurrency: true }, () => {
	const userAgents = [
		['Android',
			[
				[
					'Mozilla/5.0 (Linux; Android 15; SM-S931B Build/AP3A.240905.015.A2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/127.0.6533.103 Mobile Safari/537.36',
					'Samsung Galaxy S25',
				],
				[
					'Mozila/5.0 (Linux; Android 14; SM-S928B/DS) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.230 Mobile Safari/537.36',
					'Samsung Galaxy S24 Ultra',
				],
				[
					'Mozilla/5.0 (Linux; Android 14; Pixel 9 Pro Build/AD1A.240418.003; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.54 Mobile Safari/537.36',
					'Google Pixel 9 Pro',
				],
				[
					'Mozilla/5.0 (Linux; Android 14; Pixel 9 Build/AD1A.240411.003.A5; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/124.0.6367.54 Mobile Safari/537.36',
					'Google Pixel 9',
				],
				[
					'Mozilla/5.0 (Linux; Android 15; moto g - 2025 Build/V1VK35.22-13-2; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/132.0.6834.163 Mobile Safari/537.36',
					'Motorola Moto G (2025)',
				],
				[
					'Dalvik/2.1.0 (Linux; U; Android 15; moto edge 30 neo Build/AP3A.241105.008)',
					'Motorola Moto Edge 30 Neo',
				],
				[
					'Mozilla/5.0 (Linux; Android 14; moto g stylus 5G - 2024 Build/U2UB34.44-86; wv)',
					'Motorola Moto G Stylus 5G (2024)',
				],
				[ // Tablet
					'Dalvik/2.1.0 (Linux; U; Android 14; SM-X306B Build/UP1A.231005.007)',
					'Samsung Galaxy Tab Active5 5G',
				],
			],
		],
		['iOS',
			[
				[
					'Mozilla/5.0 (iPhone17,5; CPU iPhone OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 FireKeepers/1.7.0',
					'Apple iPhone 16e',
				],
				[
					'Mozilla/5.0 (iPhone17,1; CPU iPhone OS 18_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Mohegan Sun/4.7.4',
					'Apple iPhone 16 Pro',
				],
				[
					'Mozilla/5.0 (iPhone16,2; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Resorts/4.7.5',
					'Apple iPhone 15 Pro',
				],
				[ // Tablet
					'Mozilla/5.0 (iPad16,3; CPU OS 18_3_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Tropicana_NJ/5.7.1',
					'Apple iPad Pro (11 5th Gen)',
				],
			],
		],
		['Windows',
			[
				[
					'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1; Microsoft; RM-1152) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Mobile Safari/537.36 Edge/15.15254',
					'Microsoft Lumia 650',
				],
				[
					'Mozilla/5.0 (Windows Phone 10.0; Android 4.2.1; Microsoft; RM-1127_16056) AppleWebKit/537.36(KHTML, like Gecko) Chrome/42.0.2311.135 Mobile Safari/537.36 Edge/12.10536',
					'Microsoft Lumia 550',
				],
			],
		],
		['', [
			[
				'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36 Edg/134.0.0.0',
				'Windows 10-based PC (Edge browser)',
			],
			[
				'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
				'Chromebook (Chrome browser)',
			],
			[
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.3.1 Safari/605.1.15',
				'MacBook',
			],
		]],
	] satisfies [ReturnType<typeof getMobileOS>, [string, string][]][];

	for (const [os, agents] of userAgents) describe(os, () => {
		for (const [ua, device] of agents) it(device, () => {
			const result = getMobileOS({ userAgent: ua } as Navigator, {} as Window);

			assert.equal(result, os);
		});
	});
});
