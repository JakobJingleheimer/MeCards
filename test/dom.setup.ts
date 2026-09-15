import { GlobalRegistrator } from '@happy-dom/global-registrator';
import { CanvasAdapter } from '@happy-dom/node-canvas-adapter';

GlobalRegistrator.register({
	height: 926,
	settings: {
		canvasAdapter: new CanvasAdapter(),
	},
	url: 'http://localhost:8080',
	width: 428,
});
