import path from 'path';
import childProcess from 'child_process';
import fs from 'fs-extra';
import recursiveReaddir from 'recursive-readdir';
import md5 from 'md5';
import cloneDeep from 'lodash/cloneDeep';

// https://getflywheel.github.io/local-addon-api/modules/_local_main_.html
import * as LocalMain from '@getflywheel/local/main';
import * as Local from '@getflywheel/local';

import { IMAGE_OPTIMIZER } from './constants';
import {
	ImageData,
	SiteImageData,
	CachedImageDataBySiteID,
} from './types';


// A poor mans state for now. Soon we can make this much stronger 🦾
const imageDataStore = {};

const serviceContainer = LocalMain.getServiceContainer().cradle;
const {
	sendIPCEvent,
	addIpcAsyncListener,
	userData,
	siteData,
} = serviceContainer;


export default function (context) {
	const { electron } = context;
	const { ipcMain } = electron;

	console.log('Context -----------', context);

	/**
	 * Scan a site for images and return the list of all images found
	 */
	LocalMain.addIpcAsyncListener(
		IMAGE_OPTIMIZER.SCAN_FOR_IMAGES,
		async (siteID: string) => scanForImages(siteID),
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
		) => this.compressImages(siteID, imageMD5s, stripMetaData),
	);
}



function saveImageDataToDisk(siteID: string, data: SiteImageData): void {
	const siteImageData = serviceContainer.userData.get('site-image-data', {});

	/**
	 * @todo We will likely need to figure out how to clean this up when sites are deleted
	 */

	serviceContainer.userData.set('site-image-data', {
		...siteImageData,
		[siteID]: data,
	});
};

function getFileHash(filePath: string): Promise<string> {
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
}

/**
 * Get all JPG's recursively given a directly
 *
 * @param contentPath
 */
async function getImageFilePathsFactory(contentPath: string): Promise<string[]> {
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
				reject(err);
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
async function getImageFilePaths(site: Local.Site) {
	return getImageFilePathsFactory(
		path.join(site.paths.webRoot, 'wp-content', 'uploads'),
	);
}

/**
 * Get all JPG's from <site-root>/.localwp-image-optimizer-backups
 *
 * @param site
 */
async function getBackupImageFilePaths(site: Local.Site): Promise<string[]> {
	return getImageFilePathsFactory(
		/**
		 * @todo why aren't you getting recognized, man?
		 */
		site.paths.imageOptimizerBackups,
	);
}


/**
 * Given an MD5 hash of an image, returns wether or not this image is an original copy or has previously been
 * compressed by Local
 *
 * @param fileHash
 * @param imageData
 */
function hasImageBeenCompressed(fileHash: string, imageData: SiteImageData['imageData']) {
	return Object.values(imageData).some((data: ImageData) => data.compressedImageHash === fileHash);
}


/**
 * Scans a site's wp-content dir for images
 * Currently only supports jpeg
 *
 * @param siteID
 *
 * @returns ImageData[]
 */
async function scanForImages(siteID: string): Promise<SiteImageData> {
	const site = serviceContainer.siteData.getSite(siteID);

	if (!site) {
		/**
		 * @todo improve this error handling?
		 */
		return new Promise((resolve, reject) => reject(new Error('Site not found!')));
	}

	const filePaths = await getImageFilePaths(site);

	const filesWithHashes = await Promise.all(
		filePaths.map((file: string) => getFileHash(file)),
	);

	const existingImageData = imageDataStore[siteID]?.imageData || {};

	let totalImagesSize = 0;

	const updatedSiteImageData = await filePaths.reduce(async (
		imageData: Promise<SiteImageData['imageData']>,
		filePath: string,
	) => {
		const fileSize = fs.statSync(filePath).size;
		totalImagesSize += fileSize;

		const fileHash = await getFileHash(filePath);

		if (hasImageBeenCompressed(fileHash, existingImageData)) {
			return imageData;
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
		...(imageDataStore[siteID] || {}),
		imageData: updatedSiteImageData,
		lastScan: new Date(),
		originalTotalSize: totalImagesSize,
		compressedTotalSize: undefined,
		imageCount: filesWithHashes.length,
	};

	imageDataStore[siteID] = currentSiteImageData;

	saveImageDataToDisk(siteID, currentSiteImageData);

	return currentSiteImageData;
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
function getImageData(siteID: string): SiteImageData {
	return (imageDataStore[siteID] || {} as SiteImageData);
}

/**
 * Takes a list of md5 hashed ids for images that should be compressed and compress them one at a time
 * Each time an image is compressed or fails, will emit an IPC event with the file md5 and the status (success/fail)
 * It will also create a backup of the original file before compressing the image
 *
 * @param imageIds
 */
async function compressImages(siteID: Local.Site['id'], imageMD5s: string[], stripMetaData?: boolean) {
	/**
	 * Backup location = wp-content/local-wp-image-backups
	 */
	const site = serviceContainer.siteData.getSite(siteID);

	if (!site) {
		return;
	}

	/**
	 * @todo why isn't this new class member/getter not getting picked up?
	 */
	const backupDirPath = site.paths.imageOptimizerBackups;

	fs.ensureDir(backupDirPath);

	const siteImageData: SiteImageData = cloneDeep(imageDataStore[siteID]);

	for (const md5Hash of imageMD5s) {
		const currentImageData = siteImageData.imageData[md5Hash];
		const { filePath } = currentImageData;
		// We do this step to ensure that image backups are nested in directories like they are in wp-content
		const backupPath = filePath.replace(path.join(site.paths.webRoot, 'wp-content'), backupDirPath);

		// create file backup
		fs.copySync(filePath, backupPath);

		const args: string[] = [];

		if (stripMetaData) {
			args.push('--strip');
		}

		// the src and dest args are expected as the last
		// two argv's by jpeg-recompress, so we make sure they are added last
		args.push(
			backupPath,
			filePath,
		);

		// Wrap this in a promise to ensure that only one image is compressed at a time
		await new Promise((resolve) => {
			const cp = childProcess.spawn(
				/**
				 * @todo get this guy included with lightning services
				 */
				'jpeg-recompress',
				args,
			);

			cp.on('close', async (code) => {
				if (code !== 0) {
					serviceContainer.sendIPCEvent(IMAGE_OPTIMIZER.COMPRESS_IMAGE_FAIL, {
						originalImageHash: md5Hash,
						errorMessage: `Failed to process ${filePath}. Exited with code ${code}`,
					});

					resolve();
					return;
				}

				siteImageData.imageData[md5Hash] = {
					...currentImageData,
					compressedImageHash: await getFileHash(backupPath),
					compressedSize: fs.statSync(backupPath).size,
				};

				serviceContainer.sendIPCEvent(IMAGE_OPTIMIZER.COMPRESS_IMAGE_SUCCESS, siteImageData.imageData[md5Hash]);

				resolve();
			});
		});

		this._imageData[siteID] = siteImageData;

		this._saveImageDataToDisk(siteID, siteImageData);
	}
};
