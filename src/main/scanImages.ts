import fs from 'fs-extra';
import * as LocalMain from '@getflywheel/local/main';
import { SiteImageData, Store } from '../types';
import {
	saveImageDataToDisk,
	getImageFilePaths,
	hasImageBeenCompressed,
	getFileHash,
	getFormattedTimestamp,
} from './utils';

/**
 * Scans a site's wp-content dir for images
 * Currently only supports jpeg
 *
 * @param siteID
 *
 * @returns ImageData[]
 */
export function scanImagesFactory(serviceContainer: LocalMain.ServiceContainerServices, imageDataStore: Store) {
	return async function(siteID: string): Promise<SiteImageData> {
		const site = serviceContainer.siteData.getSite(siteID);

		if (!site) {
			return new Promise((resolve, reject) => reject(new Error('Site not found!')));
		}

		const filePaths = await getImageFilePaths(site);

		const siteImageData = imageDataStore.getStateBySiteID(siteID);
		const imageData = siteImageData.imageData || {};

		const updatedSiteImageData = await filePaths.reduce(async (
			imageDataAccumulator: Promise<SiteImageData['imageData']>,
			filePath: string,
		) => {
			const fileSize = fs.statSync(filePath).size;

			const fileHash = await getFileHash(filePath);

			/**
			 * We don't need to record new data about a file if we have already compressed it
			 */
			if (hasImageBeenCompressed(fileHash, imageData)) {
				return await imageDataAccumulator;
			}

			return {
				...(await imageDataAccumulator),
				[fileHash]: {
					originalImageHash: fileHash,
					filePath,
					originalSize: fileSize,
				},
			};
		}, Promise.resolve({})) as SiteImageData['imageData'];

		const totalImagesSize = await Object.values(updatedSiteImageData).reduce(
			(acc, data) => {
				return acc + data.originalSize;
			}, 0
		);

		const nextSiteImageData = {
			...siteImageData,
			originalTotalSize: totalImagesSize,
			compressedTotalSize: null,
			imageData: updatedSiteImageData,
			lastScan: getFormattedTimestamp(new Date()),
			imageCount: filePaths.length,
		};

		await imageDataStore.setStateBySiteID(siteID, nextSiteImageData);

		saveImageDataToDisk(imageDataStore, serviceContainer);

		return nextSiteImageData;
	}
};
