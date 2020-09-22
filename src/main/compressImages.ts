import childProcess from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import cloneDeep from 'lodash/cloneDeep';
import * as Local from '@getflywheel/local';
import * as LocalMain from '@getflywheel/local/main';
import {
	SiteImageData,
	Store,
} from '../types';
import { BACKUP_DIR_NAME, IPC_EVENTS } from '../constants';
import { getFileHash, saveImageDataToDisk } from './utils';


/**
 * Takes a list of md5 hashed ids for images that should be compressed and compress them one at a time
 * Each time an image is compressed or fails, will emit an IPC event with the file md5 and the status (success/fail)
 * It will also create a backup of the original file before compressing the image
 *
 * @param imageIds
 */
export function compressImagesFactory(serviceContainer: LocalMain.ServiceContainerServices, imageDataStore: Store) {
	return async function(siteID: Local.Site['id'], imageMD5s: string[], stripMetaData?: boolean) {
		const site = serviceContainer.siteData.getSite(siteID);

		if (!site) {
			return;
		}

		const backupDirPath = path.join(
			site.longPath,
			BACKUP_DIR_NAME,
		);

		fs.ensureDir(backupDirPath);

		/**
		 * deep clone this so that the existing store doesn not get corrupted and remains intact until we explicity update it
		 */
		const siteImageData: SiteImageData = cloneDeep(imageDataStore.getStateBySiteID(siteID));

		const updatedImageData: SiteImageData['imageData'] = {};

		for (const md5Hash of imageMD5s) {
			serviceContainer.sendIPCEvent(IPC_EVENTS.COMPRESS_IMAGE_STARTED, md5Hash);

			const currentImageData = siteImageData.imageData[md5Hash];
			const { filePath } = currentImageData;

			if(!fs.existsSync(filePath)) {
				serviceContainer.sendIPCEvent(IPC_EVENTS.COMPRESS_IMAGE_FAIL,
					md5Hash, `File not found!`
				);

				continue;
			}
			/**
			 * We do this step to ensure that image backups are nested under the backup directory in
			 * the same way as they are nested inside wp-conten
			 *
			 * We still include "uploads" in this new file path even though that is the "base" from which we scan
			 * for images so that we can easily expand this to scan other directories within wp-content in the future
			 */
			const backupPath = filePath.replace(path.join(site.paths.webRoot, 'wp-content'), backupDirPath);

			fs.copySync(filePath, backupPath);

			const args: string[] = [];

			/**
			 * @todo write some tests to cover this case
			 */
			if (stripMetaData) {
				args.push('--strip');
			}

			/**
			 * the src and dest args are expected as the last
			 * two argv's by jpeg-recompress, so we make sure they are added last
			 */
			args.push(
				backupPath,
				filePath,
			);

			/**
			 * Wrap this in a promise to ensure that only one image is compressed at a time
			 */
			await new Promise((resolve) => {
				const cp = childProcess.spawn(
					/**
					 * @todo get this guy included with lightning services
					 */
					'jpeg-recompress',
					args,
				);

				cp.on('close', async (code) => {
					/**
					 * @todo test this IPC event
					 */
					if (code !== 0) {
						serviceContainer.sendIPCEvent(IPC_EVENTS.COMPRESS_IMAGE_FAIL, {
							originalImageHash: md5Hash,
							errorMessage: `Failed to process ${filePath}. Exited with code ${code}`,
						});

						resolve();
						return;
					}

					updatedImageData[md5Hash] = {
						...currentImageData,
						compressedImageHash: await getFileHash(filePath),
						compressedSize: fs.statSync(filePath).size,
					};

					serviceContainer.sendIPCEvent(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS, updatedImageData[md5Hash]);

					resolve();
				});
			});

			imageDataStore.setStateBySiteID(siteID, {
				...siteImageData,
				imageData: {
					...siteImageData.imageData,
					...updatedImageData
				},
			});

			saveImageDataToDisk(imageDataStore, serviceContainer);
		}
	}
};
