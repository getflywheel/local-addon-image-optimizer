import path from 'path';
import fs from 'fs-extra';
import recursiveReaddir from 'recursive-readdir'
import md5 from 'md5';
import * as LocalMain from '@getflywheel/local/main';
import * as Local from '@getflywheel/local';

import {
	ImageData,
	SiteData,
} from '../types';

import { COMPRESSED_IMAGE_DATA_FILE_NAME } from '../constants';


export function saveImageDataToDisk(imageDataStore, serviceContainer: LocalMain.ServiceContainerServices): void {
	const siteData = serviceContainer.userData.get(COMPRESSED_IMAGE_DATA_FILE_NAME, {});

	/**
	 * @todo We will likely need to figure out how to clean this up when sites are deleted
	 */

	serviceContainer.userData.set(COMPRESSED_IMAGE_DATA_FILE_NAME, {
		...siteData,
		...imageDataStore.getState(),
	});
};

export function getFileHash(filePath: string): Promise<string> {
	return new Promise((resolve, reject) => {
		fs.readFile(
			filePath,
			(err, buf) => {
				if (err) {
					reject(err);
				}

				resolve(md5(buf));
			},
		);
	});
};

/**
 * Get all JPG's recursively given a directly
 *
 * @param contentPath
 */
export async function getImageFilePathsHelper(contentPath: string): Promise<string[]> {
	// ignore all files that aren't JPG's.
	// Directories must return false so that they won't be ignored. If they are ignored,
	// they will not be traversed
	const fileFilter = (file, stats) => {
		const ext = path.extname(file)?.toLowerCase();

		return !['.jpg', '.jpeg'].includes(ext) && !stats.isDirectory();
	};

	// if the directory doesn't exist, there aren't any files paths to retrieve
	if (!fs.existsSync(contentPath)) {
		return new Promise((resolve) => resolve([]));
	}

	return new Promise((resolve, reject) => recursiveReaddir(
		contentPath,
		[fileFilter],
		(err, files) => {
			if (err) {
				reject(err)
				return;
			}

			resolve(files);
		},
	));
};

/**
 * Get all JPG's for wp-content/uploads
 *
 * @param site
 */
export async function getImageFilePaths(webRoot: Local.Site['paths']['webRoot']) {
	return getImageFilePathsHelper(
		path.join(webRoot, 'wp-content', 'uploads'),
	);
}

/**
 * Given an MD5 hash of an image, returns wether or not this image is an original copy or has previously been
 * compressed by Local
 *
 * @param fileHash
 * @param imageData
 */
export function getImageIfCompressed(fileHash: string, imageData: SiteData['imageData']) {
	return Object.values(imageData).find((data: ImageData) => data.compressedImageHash === fileHash);
}
