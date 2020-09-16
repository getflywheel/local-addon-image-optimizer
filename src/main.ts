// https://getflywheel.github.io/local-addon-api/modules/_local_main_.html
import * as LocalMain from '@getflywheel/local/main';

import {
	scanImages,
	getImageData,
	compressImages,
} from './main/index';
import { IPC_EVENTS } from './constants';


export default function (context) {
	const { electron } = context;
	const { ipcMain } = electron;

	/**
	 * @todo read from disk any previous image data and store in a runtime cache
	 * this is important because it will help us determine which images have
	 * been compressed thus far
	 */


	/**
	 * Scan a site for images and return the list of all images found
	 */
	LocalMain.addIpcAsyncListener(
		IPC_EVENTS.SCAN_FOR_IMAGES,
		async (siteID: string) => scanImages(siteID),
	);

	/**
	 * Get all image data for a site if it exists (ie been scanned for in the past)
	 */
	LocalMain.addIpcAsyncListener(
		IPC_EVENTS.GET_IMAGE_DATA,
		async (siteID: string) => getImageData(siteID),
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
