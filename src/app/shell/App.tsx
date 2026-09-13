import {
	lazy,
	LocationProvider,
	ErrorBoundary,
	Router,
	Route,
} from 'preact-iso';
import 'kelpui/css/kelp.css';

import '../kelpui.css';

import { AppNav } from './AppNav.tsx';
import Install from '../Prerequisites/Install.tsx';
import { ToasterProvider } from '../toaster/context.tsx';
import Toaster from '../toaster/Toaster.tsx';

const About = lazy(() => import('../About.tsx'));
const CardEdit = lazy(() => import('../card/CardEdit.tsx'));
const CardList = lazy(() => import('../card/CardList.tsx'));

export function App() {
	return (
		<LocationProvider>
			<ErrorBoundary>
				<ToasterProvider>
					<Toaster />

					<Install />

					<Router>
						<Route path="/" component={CardList} />
						<Route path="/about" component={About} />
						<Route path="/card/:id" component={({ path }) => <CardEdit key={path} />} />
					</Router>

					<AppNav />
				</ToasterProvider>
			</ErrorBoundary>
		</LocationProvider>
	);
}
