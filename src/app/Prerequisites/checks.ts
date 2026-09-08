import type { Dispatch, StateUpdater } from 'preact/hooks';


export const hasPersistedStorage = (set: Dispatch<StateUpdater<Boolean>>) => navigator.storage?.persist?.()
	.then(
		(v) => { set(v); return v },
		() => { set(false); return false },
	);

export const isInstalled = () => window.matchMedia('(display-mode: standalone)').matches;
