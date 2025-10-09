import type { FunctionComponent } from 'preact';

import AddBoxedIcon from './icons/add-boxed.svg';
import MobileHomeScreenIcon from './icons/mobile-home-screen.svg';
import ShareMenuIcon from './icons/ios-share.svg';

import { getMobileOS } from './getMobileOS.ts';

const Install = () => {
	const Instrutions = osToInstructions[getMobileOS(navigator, window)];

	return (
		<main className="container stack">
			<h1 className="text-center">Install MeCards to get started</h1>
			<Instrutions />
		</main>
	);
};

export default Install;

const AndroidInstructions = () => (<></>);

const iOSInstructions = () => (
	<ol>
		<li><ShareMenuIcon className="size-m" /> Open the share menu</li>
		<li><AddBoxedIcon className="size-m" /> Tap <em>Add to Home Screen</em></li>
		<li><MobileHomeScreenIcon className="size-m" /> Go to your phone’s home screen</li>
		<li>Tap MeCards’ icon to launch MeCards as an app</li>
	</ol>
);

const Unknown = () => (<p>Could not determine device operating system</p>);

const WindowsInstructions = () => (<></>);

const osToInstructions: Record<ReturnType<typeof getMobileOS>, FunctionComponent> = {
	Android: AndroidInstructions,
	iOS: iOSInstructions,
	Windows: WindowsInstructions,
	'': Unknown,
};
