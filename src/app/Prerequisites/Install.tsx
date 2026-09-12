import type { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';

import AddBoxedIcon from '@tabler/icons/outline/square-plus.svg';
import DesktopDeviceDownload from '@tabler/icons/outline/device-desktop-down.svg';
import DotsMenuVertical from '@tabler/icons/outline/dots-vertical.svg';
import MobileDeviceDownload from '@tabler/icons/outline/device-mobile-down.svg';
import MobileHomeScreenIcon from '@tabler/icons/outline/device-mobile.svg';
import ShareMenuIcon from '@tabler/icons/outline/share-2.svg';

import { useToaster } from '../toaster/context.tsx';
import { isInstalled } from './checks.ts';
import { getMobileOS } from './getMobileOS.ts';

const Install = () => {
	if (isInstalled()) return null;

	const { push } = useToaster();

	const Instructions = osToInstructions[getMobileOS(navigator, window)];

	useEffect(() => {
		push({
			dismissable: true,
			duration: -1,
			kind: 'danger',
			message: (
				<>
					<p>Please install MeCards before using it; using without installing will likely result in data-loss.</p>

					<Instructions />
				</>
			),
		});
	}, []);
};

export default Install;

const AndroidInstructions = () => (
	<details>
		<summary>Instructions for Android</summary>

		<h1 className="h5">Brave & Chrome</h1>
		<ol>
			<li><MobileDeviceDownload className="size-m" />Tap <em>Install</em></li>
		</ol>

		<h1 className="h5">Chromium</h1>
		<ol>
			<li><DotsMenuVertical className="size-m" /> Open the settings menu</li>
			<li>Tap <em>Install</em></li>
		</ol>

		<h1 className="h5">Firefox</h1>
		<ol>
			<li><DotsMenuVertical className="size-m" /> Open the settings menu</li>
			<li>Tap <em>Add to Home Screen</em></li>
		</ol>
	</details>
);

const iOSInstructions = () => (
	<details>
		<summary>Instructions for iOS</summary>

		<ol>
			<li><ShareMenuIcon className="size-m" /> Open the share menu</li>
			<li><AddBoxedIcon className="size-m" /> Tap <em>Add to Home Screen</em></li>
			<li><MobileHomeScreenIcon className="size-m" /> Go to your phone’s home screen</li>
			<li>Tap MeCards icon to launch MeCards as an app</li>
		</ol>
	</details>
);

const Unknown = () => (
	<details>
		<summary>Instructions for Desktop</summary>

		<ol>
			<li>Tap <DesktopDeviceDownload /> (in the address/url bar)</li>
		</ol>
	</details>
);

const WindowsInstructions = () => (
	<details>
		<summary>Instructions for Windows Mobile</summary>
	</details>
);

const osToInstructions = {
	Android: AndroidInstructions,
	iOS: iOSInstructions,
	Windows: WindowsInstructions,
	'': Unknown,
} satisfies Record<ReturnType<typeof getMobileOS>, FunctionComponent>;
