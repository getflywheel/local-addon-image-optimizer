import childProcess from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import cloneDeep from 'lodash/cloneDeep';
import * as Local from '@getflywheel/local';
import {
	SiteImageData,
} from '../types';
import { IPC_EVENTS } from '../constants';
import { getFileHash } from './utils';


export const backupFileName = '.localwp-image-optimizer-backups';

/**
 * Takes a list of md5 hashed ids for images that should be compressed and compress them one at a time
 * Each time an image is compressed or fails, will emit an IPC event with the file md5 and the status (success/fail)
 * It will also create a backup of the original file before compressing the image
 *
 * @param imageIds
 */
export function compressImagesFactory(serviceContainer, imageDataStore) {
	return async function(siteID: Local.Site['id'], imageMD5s: string[], stripMetaData?: boolean) {
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
		const backupDirPath = path.join(
			site.paths.imageOptimizerBackups,
			backupFileName,
		);

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
						serviceContainer.sendIPCEvent(IPC_EVENTS.COMPRESS_IMAGE_FAIL, {
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

					serviceContainer.sendIPCEvent(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS, siteImageData.imageData[md5Hash]);

					resolve();
				});
			});

			this._imageData[siteID] = siteImageData;

			this._saveImageDataToDisk(siteID, siteImageData, serviceContainer);
		}
	}
};
