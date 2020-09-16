import * as LocalMain from '@getflywheel/local/main';
import { SiteImageData } from '../types';
import { COMPRESSED_IMAGE_DATA_FILE_NAME } from '../constants';
import { scanImagesFactory } from './scanImages';
import { compressImagesFactory } from './compressImages';


const serviceContainer = LocalMain.getServiceContainer().cradle;

const existingImageData = serviceContainer.userData.get(COMPRESSED_IMAGE_DATA_FILE_NAME, {});

// A poor mans state for now. Soon we can make this much stronger 🦾
const imageDataStore = {
	...existingImageData
};

/**
 * Returns images data from a site from a previous scan.
 * This can be from a scan that has since been written/read to disk or from a scan that has happened during
 * the current runtime.
 *
 * Will return an empty SiteImageData object if none is found
 *
 * @param siteID
 *
 * @returns SiteImageData
 */
export function getImageData(siteID: string): SiteImageData {
	return (imageDataStore[siteID] || {} as SiteImageData);
}

export const scanImages = scanImagesFactory(serviceContainer, imageDataStore);
export const compressImages = compressImagesFactory(serviceContainer, imageDataStore);
