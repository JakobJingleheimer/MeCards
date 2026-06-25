import type { WebAppManifest } from 'web-app-manifest';

import icon192 from './icons/192.png';
import icon512 from './icons/512.png';

import screenDesktopEdit from './screenshots/screen-edit-desktop.png';
import screenMobileEdit from './screenshots/screen-edit-mobile.png';
import screenDesktopList from './screenshots/screen-list-desktop.png';
import screenMobileList from './screenshots/screen-list-mobile.png';

export default {
	name: 'MeCards',
	background_color: '#1C9AF3',
	theme_color: '#1C9AF3',
	display: 'standalone',
	display_override: [
		'standalone',
		'minimal-ui',
	],
	icons: [
		{
			purpose: 'any',
			sizes: '192x192',
			src: icon192,
			type: 'image/png',
		},
		{
			purpose: 'any',
			sizes: '512x512',
			src: icon512,
			type: 'image/png',
		},
	],
	screenshots: [
		{
      form_factor: 'narrow',
      sizes: '1290x2796',
      src: screenMobileEdit,
      type: 'image/png',
    },
		{
      form_factor: 'narrow',
      sizes: '1290x2796',
      src: screenMobileList,
      type: 'image/png',
    },
		{
      form_factor: 'wide',
      sizes: '2880x1580',
      src: screenDesktopEdit,
      type: 'image/png',
    },
		{
      form_factor: 'wide',
      sizes: '2880x1580',
      src: screenDesktopList,
      type: 'image/png',
    },
	],
	start_url: '/',
	prefer_related_applications: false
} satisfies WebAppManifest;
