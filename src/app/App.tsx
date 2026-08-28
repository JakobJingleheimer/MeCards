import {
	lazy,
	LocationProvider,
	ErrorBoundary,
	Router,
	Route,
} from 'preact-iso';
import 'kelpui/css/kelp.css';

import './kelpui.css';
import './App.module.css';

import CheckPrerequisites from './Prerequisites/CheckPrerequisites.tsx';
import { Footer } from './Footer.tsx';
import { ToasterProvider } from './toaster/context.tsx';
import Toaster from './toaster/Toaster.tsx';

const About = lazy(() => import('./About.tsx'));
const CardEdit = lazy(() => import('./CardEdit.tsx'));
const CardList = lazy(() => import('./CardList.tsx'));
const Install = lazy(() => import('./Prerequisites/Install.tsx'));
const NoStorage = lazy(() => import('./Prerequisites/NoStorage.tsx'));

export function App() {
	return (
		<LocationProvider>
			<ErrorBoundary>
				<ToasterProvider>
					<CheckPrerequisites>
						<Toaster />

						<Router>
							<Route path="/about" component={About} />
							<Route path="/install" component={Install} />
							<Route path="/no-storage" component={NoStorage} />
							<Route path="/" component={CardList} />
							<Route path="/card/:id" component={({ path }) => <CardEdit key={path} />} />
						</Router>
					</CheckPrerequisites>

					<Footer />
				</ToasterProvider>
			</ErrorBoundary>
		</LocationProvider>
	);
}
