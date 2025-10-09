import { clsx } from 'clsx';

import Warning from './icons/warning.svg';

import styles from './NoStorage.module.css';

const NoStorage = () => (
	<main className={clsx('container', styles.Page)}>
		<Warning className={styles.WarnIcon} />

		<h1>Persistent storage is not available</h1>

		<p>Do not use this app until that is resolved. Without it, your device may delete the MeCards’ saved data, causing your cards to be lost.</p>
	</main>
);

export default NoStorage;
