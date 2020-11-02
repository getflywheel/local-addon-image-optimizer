import { ipcRenderer } from 'electron';
import { IPC_EVENTS } from '../constants';
import { ImageData, SiteImageData } from '../types';
import { store, actions } from './store/store';

export function setupListeners() {
	const listeners = [
		{
			channel: IPC_EVENTS.COMPRESS_IMAGE_SUCCESS,
			cb: (_, siteID: string, imageData: ImageData) => {
				store.dispatch(actions.optimizeSuccess({ siteID, imageData }));
			},
		},
		{
			channel: IPC_EVENTS.COMPRESS_IMAGE_FAIL,
			cb: (_, siteID: string, imageID: string, errorMessage: string) => {
				store.dispatch(actions.optimizeFailure({ siteID, imageID, errorMessage }));
			},
		},
		{
			channel: IPC_EVENTS.COMPRESS_IMAGE_STARTED,
			cb: (_, siteID: string, imageID: string) => {
				store.dispatch(actions.optimizationStarted({ siteID, imageID }));
			},
		},
		{
			channel: IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE,
			cb: (_, siteID: string) => {
				store.dispatch(actions.optimizationComplete({ siteID }));
			},
		},
		{
			channel: IPC_EVENTS.SCAN_IMAGES_COMPLETE,
			cb: (_, siteID: string, siteImageData: SiteImageData) => {
				store.dispatch(actions.scanSuccess({ siteID, siteImageData }));
			},
		},
		{
			channel: IPC_EVENTS.SCAN_IMAGES_FAILURE,
			cb: (_, siteID: string, error: Error) => {
				store.dispatch(actions.scanFailure({ siteID, error }));
			},
		},
	];

	listeners.forEach(({ channel, cb }) => {
		if (!ipcRenderer.listenerCount(channel)) {
			ipcRenderer.on(channel, cb);
		}
	});
}
