import fs from 'fs-extra';
import * as LocalMain from '@getflywheel/local/main';
import { SiteImageData, Store } from '../types';
import {
	saveImageDataToDisk,
	getImageFilePaths,
	getImageIfCompressed,
	getFileHash,
} from './utils';
import { isNumber } from 'lodash';

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

			let compressedImage = getImageIfCompressed(fileHash, imageData)
			if (compressedImage) {
				return {
					...(await imageDataAccumulator),
					[compressedImage.originalImageHash]: compressedImage,
				}
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

		const compressedTotalSize = await Object.values(updatedSiteImageData).reduce(
			(acc, data) => {
				if (typeof data.compressedSize === 'number') {
					return acc + data.compressedSize;
				} else {
					return acc;
				}
			}, 0
		);

		const totalCompressedCount = await Object.values(updatedSiteImageData).reduce(
			(acc, data) => {
				if (data.compressedImageHash) {
					return acc + 1;
				} else {
					return acc;
				}
			}, 0
		);

		const compressedImagesOriginalSize = await Object.values(updatedSiteImageData).reduce(
			(acc, data) => {
				if (data.compressedImageHash) {
					return acc + data.originalSize;
				} else {
					return acc;
				}
			}, 0
		);

		const nextSiteImageData = {
			...siteImageData,
			compressedTotalSize: compressedTotalSize,
			originalTotalSize: totalImagesSize,
			imageData: updatedSiteImageData,
			lastScan: Date.now(),
			imageCount: filePaths.length,
			totalCompressedCount: totalCompressedCount,
			compressedImagesOriginalSize: compressedImagesOriginalSize,
		};

		imageDataStore.setStateBySiteID(siteID, nextSiteImageData);

		saveImageDataToDisk(imageDataStore, serviceContainer);

		return nextSiteImageData;
	}
};
