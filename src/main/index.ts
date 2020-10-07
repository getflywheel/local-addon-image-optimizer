import * as LocalMain from '@getflywheel/local/main';
import { CombinedStateData, DatasetType } from '../types';
import { COMPRESSED_IMAGE_DATA_FILE_NAME, PREFERENCES_FILE_NAME } from '../constants';
import { Preferences } from '../types';
import { scanImagesFactory } from './scanImages';
import { compressImagesFactory } from './compressImages';
import { createStore, createRuntimeStore}  from './createStore';


const serviceContainer = LocalMain.getServiceContainer().cradle;

const existingImageData = serviceContainer.userData.get(COMPRESSED_IMAGE_DATA_FILE_NAME, {});

const imageDataStore = createStore(existingImageData);

const runtimeStore = createRuntimeStore();

/**
 * Returns images data from a site from a previous scan.
 * This can be from a scan that has since been written/read to disk or from a scan that has happened during
 * the current runtime.
 *
 * Will return an empty CombinedStateData object if none is found
 *
 * @param siteID
 *
 * @returns CombinedStateData
 */
export function getImageData(siteID: string, imageDataset: DatasetType = DatasetType.ALL_FOUND): CombinedStateData {
	const allImages = imageDataStore.getStateBySiteID(siteID);

	if (imageDataset === DatasetType.ALL_FOUND) {
		return allImages;
	}

	const onlyUncompressedImages = Object.entries(allImages.imageData).reduce(
		(acc,[id, data]) => {
			if (data.compressedImageHash) {
				return acc;
			}
			return {
				...acc,
				[id]: {
					...data
				}
			}
		}, {}
	);

	return {
		...allImages,
		imageData: onlyUncompressedImages,
	}

}

export const scanImages = scanImagesFactory(serviceContainer, imageDataStore);
export const compressImages = compressImagesFactory(serviceContainer, imageDataStore, runtimeStore);

export const updateCancelCompression = (setCancelCompression: boolean) => {
	runtimeStore.setState({cancelCompression: setCancelCompression});
}

export function readPreferencesFromDisk(): Preferences {
	return serviceContainer.userData.get(PREFERENCES_FILE_NAME, {});
};

export function savePreferencesToDisk(preferences: Preferences): void {
	serviceContainer.userData.set(
		PREFERENCES_FILE_NAME,
		preferences,
	);
};
