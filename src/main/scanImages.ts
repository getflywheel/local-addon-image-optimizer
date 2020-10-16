import path from 'path';
import * as LocalMain from '@getflywheel/local/main';
import { SiteImageData, Store } from '../types';
import { saveImageDataToDisk } from './utils';
import { IPC_EVENTS } from '../constants';


/**
 * Scans a site's wp-content dir for images
 * Currently only supports jpeg
 *
 * @param siteID
 *
 * @returns ImageData[]
 */
export function scanImagesFactory(serviceContainer: LocalMain.ServiceContainerServices, imageDataStore: Store) {
	return async function(siteID: string) {
		const site = serviceContainer.siteData.getSite(siteID);
		let siteData = imageDataStore.getStateBySiteID(siteID);
		const imageData = siteData.imageData || {};

		if (!site) {
			serviceContainer.sendIPCEvent(IPC_EVENTS.SCAN_IMAGES_FAILURE, new Error('Site not found!'));
			return;
		}

		const scanningSiteImageData: Partial<SiteImageData> = {
			scanInProgress: true,
		};

		imageDataStore.setStateBySiteID(siteID, scanningSiteImageData);

		saveImageDataToDisk(imageDataStore, serviceContainer);

		siteData = imageDataStore.getStateBySiteID(siteID);

		/**
		 * @todo - remove @ts-ignore once the new Local api changes are published
		 */
		// @ts-ignore
		const childProcess = LocalMain.workerFork(
			path.join(__dirname, 'scanImagesProcess'),
		);

		/**
		 * @todo - remove @ts-ignore once the new Local api changes are published
		 */
		// @ts-ignore
		const processMessageHelper: (name: string, payload?: any) => any = LocalMain.childProcessMessagePromiseFactory(childProcess);

		/**
		 * @todo - remove @ts-ignore once the new Local api changes are published
		 */
		// @ts-ignore
		const filePaths = await processMessageHelper<string[]>(
			'get-file-paths',
			{
				webRoot: site.paths.webRoot,
			},
		);

		/**
		 * @todo - remove @ts-ignore once the new Local api changes are published
		 */
		// @ts-ignore
		const updatedImageData = await processMessageHelper<SiteImageData['imageData']>(
			'get-image-stats',
			{
				filePaths,
				imageData,
			},
			/**
			 * @todo - kill the type casting once this is exposed in Local API
			 */
		) as SiteImageData['imageData'];

		const totalImagesSize = await Object.values(updatedImageData).reduce(
			(acc, data) => {
				return acc + data.originalSize;
			}, 0
		);

		const compressedTotalSize = await Object.values(updatedImageData).reduce(
			(acc, data) => {
				if (typeof data.compressedSize === 'number') {
					return acc + data.compressedSize;
				} else {
					return acc;
				}
			}, 0
		);

		const totalCompressedCount = await Object.values(updatedImageData).reduce(
			(acc, data) => {
				if (data.compressedImageHash) {
					return acc + 1;
				} else {
					return acc;
				}
			}, 0
		);

		const compressedImagesOriginalSize = await Object.values(updatedImageData).reduce(
			(acc, data) => {
				if (data.compressedImageHash) {
					return acc + data.originalSize;
				} else {
					return acc;
				}
			}, 0
		);

		const nextSiteImageData = {
			...siteData,
			imageData: updatedImageData,
			scanInProgress: false,
			lastScan: Date.now(),
			originalTotalSize: totalImagesSize,
			compressedTotalSize: compressedTotalSize,
			imageCount: filePaths.length,
			totalCompressedCount: totalCompressedCount,
			compressedImagesOriginalSize: compressedImagesOriginalSize,
		};

		imageDataStore.setStateBySiteID(siteID, nextSiteImageData);

		saveImageDataToDisk(imageDataStore, serviceContainer);

		serviceContainer.sendIPCEvent(IPC_EVENTS.SCAN_IMAGES_COMPLETE, nextSiteImageData);
	}
};
