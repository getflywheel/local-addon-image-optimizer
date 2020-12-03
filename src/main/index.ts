import * as LocalMain from '@getflywheel/local/main';
import { SiteData, SiteDataBySiteID } from '../types';
import { COMPRESSED_IMAGE_DATA_FILE_NAME, PREFERENCES_FILE_NAME } from '../constants';
import { Preferences } from '../types';
import { scanImagesFactory } from './scanImages';
import { compressImagesFactory } from './compressImages';
import { restoreImageFromBackupFactory } from './restoreFromBackup';
import { createStore, createRuntimeStore}  from './createStore';
import { filterDeletedSiteData } from './filterDeletedSiteData';
import { saveImageDataToDisk } from './utils';

const serviceContainer = LocalMain.getServiceContainer().cradle;

const existingSiteData: SiteDataBySiteID = serviceContainer.userData.get(COMPRESSED_IMAGE_DATA_FILE_NAME, {});

const imageDataStore = createStore(
	filterDeletedSiteData(existingSiteData, serviceContainer)
);

serviceContainer.userData.set(COMPRESSED_IMAGE_DATA_FILE_NAME, imageDataStore.getState());

const runtimeStore = createRuntimeStore();

/**
 * Returns images data from a site from a previous scan.
 * This can be from a scan that has since been written/read to disk or from a scan that has happened during
 * the current runtime.
 *
 * Will return an empty SiteData object if none is found
 *
 * @param siteID
 *
 * @returns SiteData
 */
export function getImageData(siteID: string): SiteData {
	return imageDataStore.getStateBySiteID(siteID);
}

export function getImageDataStore(): SiteDataBySiteID {
	return imageDataStore.getState();
}

export function deleteSiteData(siteID: string) {
	imageDataStore.deleteSiteData(siteID);
	saveImageDataToDisk(imageDataStore, serviceContainer);
}

export const scanImages = scanImagesFactory(serviceContainer, imageDataStore);
export const compressImages = compressImagesFactory(serviceContainer, imageDataStore, runtimeStore);
export const restoreImageFromBackup = restoreImageFromBackupFactory(serviceContainer, imageDataStore);

export const updateCancelCompression = (siteID: string, cancelCompression: boolean) => {
	runtimeStore.setCancelCompressionBySiteID(siteID, cancelCompression);
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
