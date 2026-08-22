import { clsx } from 'clsx';

import Warning from '@tabler/icons/outline/alert-circle.svg';

import styles from './Prerequisites.module.css';

const NoStorage = () => (
	<main className={clsx('container', 'text-center', styles.Page)}>
		<Warning className="size-6xl" />

		<h1>Persistent storage is not available</h1>

		<p>Do not use this app until that is resolved. Without it, your device may delete the MeCards’ saved data, causing your cards to be lost.</p>
	</main>
);

export default NoStorage;
