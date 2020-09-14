// https://getflywheel.github.io/local-addon-api/modules/_local_main_.html
import * as LocalMain from '@getflywheel/local/main';

import {
	scanImages,
	getImageData,
	compressImages,
} from './main/index';
import { IMAGE_OPTIMIZER } from './constants';


export default function (context) {
	const { electron, fileStystem: fs } = context;
	const { ipcMain } = electron;

	console.log('Context -----------', context);

	/**
	 * Scan a site for images and return the list of all images found
	 */
	LocalMain.addIpcAsyncListener(
		IMAGE_OPTIMIZER.SCAN_FOR_IMAGES,
		async (siteID: string) => scanImages(siteID),
	);

	/**
	 * Get all image data for a site if it exists (ie been scanned for in the past)
	 */
	ipcMain.on(
		IMAGE_OPTIMIZER.GET_IMAGE_DATA,
		(event, siteID: string) => {
			event.returnValue = getImageData(siteID);
		},
	);

	/**
	 * Compress a list of images associated with a site by their md5 has unique ids
	 */
	ipcMain.on(
		IMAGE_OPTIMIZER.COMPRESS_IMAGES,
		(
			_,
			siteID: string,
			imageMD5s: string[],
			stripMetaData?: boolean,
		) => compressImages(siteID, imageMD5s, stripMetaData),
	);
}
