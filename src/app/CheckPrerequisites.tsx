import type { ComponentChild } from 'preact';
import { useLocation } from 'preact-iso';
import { useState, useEffect } from 'preact/hooks';

function CheckPrerequisites({ children }: { children: ComponentChild }) {
	const [prereq, setPrereq] = useState<'install' | 'no-storage'>();
	const { path, route } = useLocation();

	useEffect(() => {
		if (!window.matchMedia('(display-mode: standalone)').matches) return setPrereq('install');

		console.warn('⚠️ Persistent Storage check is disabled. Re-enable it.');
		// if (typeof navigator.storage?.persist !== 'function') return setPrereq('no-storage');

		// navigator.storage.persist().then((persisted) => {
		// 	if (!persisted) setPrereq('no-storage');
		// });
	}, []);

	const prereqPath = `/${prereq}`;
	if (prereq) {
		if (path !== prereqPath) route(prereq);
	} else if (path === prereqPath) route('/');

	return children;
}

export default CheckPrerequisites;
