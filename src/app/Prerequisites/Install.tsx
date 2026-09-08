import type { FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';

import AddBoxedIcon from '@tabler/icons/outline/square-plus.svg';
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
					<p>Using MeCards without first installing will likely result in data-loss. Please install the app before using.</p>

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

const Unknown = () => (<p>Could not determine device operating system</p>);

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
