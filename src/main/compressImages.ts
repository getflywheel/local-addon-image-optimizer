import childProcess from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import cloneDeep from 'lodash/cloneDeep';
import * as Local from '@getflywheel/local';
import * as LocalMain from '@getflywheel/local/main';
import {
	SiteData,
	Store,
	RuntimeStore,
	ImageData,
} from '../types';
import { BACKUP_DIR_NAME, IPC_EVENTS } from '../constants';
import { getFileHash, saveImageDataToDisk } from './utils';
import { updateCancelCompression } from './index';
import {
	reportCompressRequest,
	reportCompressSuccess,
	reportCompressFailure,
	reportNoBinFound,
	reportBinOutput,
} from './errorReporting';

let jpegRecompressBinName;

switch(process.platform) {
	case 'win32':
		jpegRecompressBinName = 'jpeg-recompress.exe';
		break;
	default:
		jpegRecompressBinName = 'jpeg-recompress';
		break;
}

const jpegRecompressBin = path.join(__dirname, '..', '..', 'vendor', process.platform, jpegRecompressBinName);

if (!fs.existsSync(jpegRecompressBin)) {
	reportNoBinFound(jpegRecompressBin);
}

function mergeImageData(imageData: ImageData, newFields: Partial<ImageData>): ImageData {
	return {
		...imageData,
		...newFields,
	}
}

/**
 * Takes a list of md5 hashed ids for images that should be compressed and compress them one at a time
 * Each time an image is compressed or fails, will emit an IPC event with the file md5 and the status (success/fail)
 * It will also create a backup of the original file before compressing the image
 *
 * @param imageIds
 */
export function compressImagesFactory(serviceContainer: LocalMain.ServiceContainerServices, imageDataStore: Store, runtimeStore: RuntimeStore) {
	return async function (siteID: Local.Site['id'], imageMD5s: string[], stripMetaData?: boolean) {
		try {
			reportCompressRequest(siteID);

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
			const siteData: SiteData = cloneDeep(imageDataStore.getStateBySiteID(siteID));

			const updatedImageData: SiteData['imageData'] = {};

			for (const md5Hash of imageMD5s) {
				if (runtimeStore.getStateBySiteID(siteID).cancelCompression) {
					break;
				}

				serviceContainer.sendIPCEvent(IPC_EVENTS.COMPRESS_IMAGE_STARTED, siteID, md5Hash);

				const currentImageData = siteData.imageData[md5Hash];
				const { filePath } = currentImageData;

				if (!fs.existsSync(filePath)) {
					const errorMessage = 'File not found!';
					serviceContainer.sendIPCEvent(
						IPC_EVENTS.COMPRESS_IMAGE_FAIL,
						siteID,
						md5Hash,
						errorMessage
					);

					updatedImageData[md5Hash] = mergeImageData(currentImageData, { errorMessage });

					continue;
				}

				/**
				 * We do this step to ensure that image backups are nested under the backup directory in
				 * the same way as they are nested inside wp-conten
				 *
				 * We still include "uploads" in this new file path even though that is the "base" from which we scan
				 * for images so that we can easily expand this to scan other directories within wp-content in the future
				 */
				let backupPath = filePath.replace(path.join(site.paths.webRoot, 'wp-content'), backupDirPath);
				const { dir, name, ext } = path.parse(backupPath);

				let deDupeCounter = 1;

				while (fs.existsSync(backupPath)) {
					const tempName = `${name} (${deDupeCounter})${ext}`;
					backupPath = path.join(dir, tempName);

					deDupeCounter++;
				}

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
						jpegRecompressBin,
						args,
					);

					const stdioCB = (data) => reportBinOutput(filePath, jpegRecompressBin, data);

					cp.stderr.on('data', stdioCB);
					cp.stdout.on('data', stdioCB);

					cp.on('close', async (code) => {
						if (code !== 0) {
							const errorMessage = `Failed to process ${filePath}. Exited with code ${code}`;
							serviceContainer.sendIPCEvent(
								IPC_EVENTS.COMPRESS_IMAGE_FAIL,
								siteID,
								md5Hash,
								errorMessage,
							);

							updatedImageData[md5Hash] = mergeImageData(currentImageData, { errorMessage });

							resolve();
							return;
						}

						updatedImageData[md5Hash] = mergeImageData(currentImageData, {
							compressedImageHash: await getFileHash(filePath),
							compressedSize: fs.statSync(filePath).size,
						});

						serviceContainer.sendIPCEvent(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS, siteID, updatedImageData[md5Hash]);

						resolve();
					});
				});

				imageDataStore.setStateBySiteID(siteID, {
					...siteData,
					imageData: {
						...siteData.imageData,
						...updatedImageData
					},
				});
				saveImageDataToDisk(imageDataStore, serviceContainer);
			}

			updateCancelCompression(siteID, false);
			serviceContainer.sendIPCEvent(IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE, siteID);
			reportCompressSuccess(siteID, imageMD5s.length);
		} catch (error) {
			reportCompressFailure(siteID, error);
			/**
			 * @todo add ipc event emitter error here to report errors to the UI
			 */
			return error;
		}
	}
};
