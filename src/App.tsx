import {
	lazy,
	LocationProvider,
	ErrorBoundary,
	Router,
	Route
} from 'preact-iso';

import 'kelpui/css/kelp.css';

import Menu from './icons/menu.svg';
import styles from './App.module.css';
import { useState, useEffect } from 'preact/hooks';

const CardEdit = lazy(() => import('./CardEdit.tsx'));
const CardList = lazy(() => import('./CardList.tsx'));
const Welcome = lazy(() => import('./Welcome.tsx'));
const NoStorage = lazy(() => import('./NoStorage.tsx'));

export function App() {
	const [installed, setInstalleded] = useState<boolean | null>(null);
	const [persisted, setPersisted] = useState<boolean | null>(null);

	useEffect(() => {
		setInstalleded(window.matchMedia('(display-mode: standalone)').matches);

		if (typeof navigator.storage?.persist !== 'function') setPersisted(false);
		else navigator.storage.persist().then(setPersisted);
	}, []);

	return (
		<LocationProvider>
			<ErrorBoundary>
				<header className="grid" id={styles.head}>
					<Menu className={styles.logo} />
				</header>

				<Router>
						{
							installed === false
							? <Welcome />
							: persisted === false
							? <NoStorage />
							: (
								<>
									<Route path="/" component={CardList} />
									<Route path="/edit/:id" component={CardEdit} />
								</>
							)
						}
				</Router>
			</ErrorBoundary>
		</LocationProvider>
	);
}
