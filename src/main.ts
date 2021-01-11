import * as LocalMain from '@getflywheel/local/main';
import {
	scanImages,
	getImageData,
	getImageDataStore,
	compressImages,
	readPreferencesFromDisk,
	savePreferencesToDisk,
	updateCancelCompression,
	deleteSiteData,
	restoreImageFromBackup,
} from './main/index';
import { IPC_EVENTS } from './constants';
import { Preferences } from './types';
import * as Electron from 'electron';


export default function (context: { electron: typeof Electron }): void {
	const { electron } = context;
	const { ipcMain } = electron;

	LocalMain.HooksMain.addAction('siteDeleted', (siteID: string) => {
		deleteSiteData(siteID);

		LocalMain.sendIPCEvent(
			IPC_EVENTS.SITE_DELETED,
			siteID,
		);
	});

	/**
	 * Scan a site for images and return the list of all images found
	 */
	ipcMain.on(
		IPC_EVENTS.SCAN_FOR_IMAGES,
		async (_, siteID: string) => scanImages(siteID),
	);

	/**
	 * Get all image data for a site if it exists (ie been scanned for in the past)
	 */
	LocalMain.addIpcAsyncListener(
		IPC_EVENTS.GET_IMAGE_DATA,
		getImageData,
	);

	LocalMain.addIpcAsyncListener(
		IPC_EVENTS.GET_IMAGE_DATA_STORE,
		getImageDataStore,
	);

	/**
	 * Read a Preferences object from disk
	 */
	LocalMain.addIpcAsyncListener(
		IPC_EVENTS.READ_PREFERENCES_FROM_DISK,
		async () => readPreferencesFromDisk(),
	);

	/**
	 * Save a Preferences object to disk
	 */
	LocalMain.addIpcAsyncListener(
		IPC_EVENTS.SAVE_PREFERENCES_TO_DISK,
		async (preferences: Preferences) => savePreferencesToDisk(preferences),
	);

	/**
	 * Restore an image from a backup
	 */
	LocalMain.addIpcAsyncListener(
		IPC_EVENTS.RESTORE_IMAGE_FROM_BACKUP,
		async (siteId: string, imageId: string) => restoreImageFromBackup(siteId, imageId),
	);

	/**
	 * Visit the preferences page
	 */
	ipcMain.on(
		IPC_EVENTS.GO_TO_PREFERENCES,
		() => {
			const serviceContainer = LocalMain.getServiceContainer().cradle;
			serviceContainer.sendIPCEvent('goToRoute', '/settings/image-optimizer');
		},
	);

	/**
	 * Cancel any outstanding image compression jobs
	 */
	ipcMain.on(
		IPC_EVENTS.CANCEL_COMPRESSION,
		(_, siteID: string) => {
			updateCancelCompression(siteID, true);
		},
	);

	/**
	 * Compress a list of images associated with a site by their md5 has unique ids
	 */
	ipcMain.on(
		IPC_EVENTS.COMPRESS_IMAGES,
		(
			_,
			siteID: string,
			imageMD5s: string[],
			stripMetaData?: boolean,
		) => compressImages(siteID, imageMD5s, stripMetaData),
	);
}
