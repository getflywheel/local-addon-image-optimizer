import { SiteImageData } from '../types';
import {
	saveImageDataToDisk,
	getImageFilePaths,
	hasImageBeenCompressed,
	getFileHash,
} from './utils';

/**
 * Scans a site's wp-content dir for images
 * Currently only supports jpeg
 *
 * @param siteID
 *
 * @returns ImageData[]
 */
export function scanImagesFactory(serviceContainer, imageDataStore) {
	return async function(siteID: string, fs): Promise<SiteImageData> {
		const site = serviceContainer.siteData.getSite(siteID);

		if (!site) {
			return new Promise((resolve, reject) => reject(new Error('Site not found!')));
		}

		const filePaths = await getImageFilePaths(site, fs);

		const filesWithHashes = await Promise.all(
			filePaths.map((file: string) => getFileHash(file, fs)),
		);

		const existingImageData = imageDataStore[siteID]?.imageData || {};

		let totalImagesSize = 0;

		const updatedSiteImageData = await filePaths.reduce(async (
			imageData: Promise<SiteImageData['imageData']>,
			filePath: string,
		) => {
			const fileSize = fs.statSync(filePath).size;
			totalImagesSize += fileSize;

			const fileHash = await getFileHash(filePath, fs);

			if (hasImageBeenCompressed(fileHash, existingImageData)) {
				return await imageData;
			}

			return {
				...(await imageData),
				[fileHash]: {
					originalImageHash: fileHash,
					filePath,
					originalSize: fileSize,
				},
			};
		}, Promise.resolve(existingImageData)) as SiteImageData['imageData'];


		/**
		 * @todo read from backup dir and rectify any copied image data
		 */
		const currentSiteImageData = {
			// these should not be overidden by new data if they already exist
			originalTotalSize: totalImagesSize,
			compressedTotalSize: undefined,
			...(imageDataStore[siteID] || {}),
			imageData: updatedSiteImageData,
			lastScan: new Date(),
			imageCount: filesWithHashes.length,
		};

		imageDataStore[siteID] = currentSiteImageData;

		saveImageDataToDisk(siteID, currentSiteImageData, serviceContainer);

		return currentSiteImageData;
	}
};
