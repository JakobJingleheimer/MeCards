import {
	lazy,
	LocationProvider,
	ErrorBoundary,
	Router,
	Route,
} from 'preact-iso';

import 'kelpui/css/kelp.css';

import BarcodeScanner from './icons/barcode-scanner.svg';
import Menu from './icons/menu.svg';
import styles from './App.module.css';
import CheckPrerequisites from './CheckPrerequisites.tsx';

const CardEdit = lazy(() => import('./CardEdit.tsx'));
const CardList = lazy(() => import('./CardList.tsx'));
const Install = lazy(() => import('./Install.tsx'));
const NoStorage = lazy(() => import('./NoStorage.tsx'));

export function App() {
	return (
		<LocationProvider>
			<ErrorBoundary>
				<CheckPrerequisites>
					<Router>
						<Route path="/install" component={Install} />
						<Route path="/no-storage" component={NoStorage} />
						<Route path="/" component={CardList} />
						<Route path="/edit/:id" component={CardEdit} />
					</Router>
				</CheckPrerequisites>

				<footer className="flex gap-m justify-center padding-4xs" id={styles.head}>
					<a className="flex-inline" href="/">
						<Menu className="size-2xl" />
					</a>
					<a className="flex-inline" href="/edit/new">
						<BarcodeScanner className="size-2xl" />
					</a>
				</footer>
			</ErrorBoundary>
		</LocationProvider>
	);
}
