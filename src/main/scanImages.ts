import path from 'path';
import * as LocalMain from '@getflywheel/local/main';
import { SiteImageData, Store } from '../types';
import { saveImageDataToDisk } from './utils';
import { IPC_EVENTS } from '../constants';
import { reportScanRequest, reportScanSuccess, reportScanFailure } from './errorReporting';

/**
 * Scans a site's wp-content dir for images
 * Currently only supports jpeg
 *
 * @param siteID
 *
 * @returns ImageData[]
 */
export function scanImagesFactory(serviceContainer: LocalMain.ServiceContainerServices, imageDataStore: Store) {
	return async function (siteID: string) {
		try {
			reportScanRequest(siteID);
			const site = serviceContainer.siteData.getSite(siteID);
			let siteData = imageDataStore.getStateBySiteID(siteID);
			const imageData = siteData.imageData || {};

			if (!site) {
				/**
				 * @todo does passing the error object here translate correctly to the UI?
				 */
				serviceContainer.sendIPCEvent(IPC_EVENTS.SCAN_IMAGES_FAILURE, siteID, new Error('Site not found!'));
				return;
			}

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

			const totalCompressedCount = Object.values(updatedImageData).reduce(
				(acc, data) => {
					if (data.compressedImageHash) {
						return acc + 1;
					} else {
						return acc;
					}
				}, 0
			);

			const nextSiteImageData: SiteImageData = {
				...siteData,
				imageData: updatedImageData,
				lastScan: Date.now(),
			};

			imageDataStore.setStateBySiteID(siteID, nextSiteImageData);

			saveImageDataToDisk(imageDataStore, serviceContainer);

			serviceContainer.sendIPCEvent(IPC_EVENTS.SCAN_IMAGES_COMPLETE, siteID, nextSiteImageData);

			reportScanSuccess(siteID, filePaths.length, totalCompressedCount);
		} catch (error) {
			reportScanFailure(siteID, error);
			return error;
		}
	}
};
