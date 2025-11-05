import type { WebAppManifest } from 'web-app-manifest';

import icon192 from './icons/192.png';
import icon512 from './icons/512.png';

export default {
	name: "MeCards",
	background_color: "#1C9AF3",
	theme_color: "#1C9AF3",
	display: "standalone",
	display_override: [
		"standalone",
		"minimal-ui",
	],
	icons: [
		{
			purpose: 'any',
			sizes: '192x192',
			src: icon192,
			type: 'impage/png',
		},
		{
			purpose: 'any',
			sizes: '512x512',
			src: icon512,
			type: 'impage/png',
		},
	],
	start_url: "/",
	prefer_related_applications: false
} satisfies WebAppManifest;
