import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import escapeGlob from 'glob-escape';
import type * as LocalMain from '@getflywheel/local/main';
import { BACKUP_DIR_NAME } from '../constants';
import { Store } from '../types';
import { reportRestoreBackupFailure } from './errorReporting';
import { saveImageDataToDisk } from './utils';
import { RevertToBackupStatus } from '../types';


export function restoreImageFromBackupFactory(serviceContainer: LocalMain.ServiceContainerServices, store: Store) {
	return async function(siteId: string, imageId: string): Promise<{ success: boolean }>{
		/**
		 * Return a properly formatted error response, update the in-memory store and write that value to disk
		 */
		const formatErrorReplyAndSetState = () => {
			store.setStateByImageID(siteId, imageId, {
				revertToBackupStatus: RevertToBackupStatus.FAILURE,
			});

			saveImageDataToDisk(store, serviceContainer);

			return {
				success: false,
			};
		};

		const state = store.getStateBySiteID(siteId);

		const fileData = state.imageData[imageId];

		const site = serviceContainer.siteData.getSite(siteId);
		const { filePath } = fileData;

		// path to the root of the site's backup dir
		const baseBackupDirPath = path.join(site.longPath, BACKUP_DIR_NAME);
		let imageBackupPath = filePath.replace(path.join(site.paths.webRoot, 'wp-content'), baseBackupDirPath);
		const { dir, name, ext } = path.parse(imageBackupPath);

		const globMatcher = `${escapeGlob(`${dir}/${name}`)}?( \\([1-9]*\\))${ext}`;

		let matches;

		try {
			matches = glob.sync(globMatcher);
		} catch(err) {
			reportRestoreBackupFailure(err);
		}

		if (!matches || matches.length === 0) {
			const errorMessage = 'No backups found for this image';
			reportRestoreBackupFailure(errorMessage)
			return formatErrorReplyAndSetState();
		}

		let mostRecentBackup;
		let mostRecentTimeStamp = 0;

		for (const match of matches) {
			const { birthtimeMs } = fs.statSync(match);

			if (birthtimeMs > mostRecentTimeStamp) {
				mostRecentTimeStamp = birthtimeMs;
				mostRecentBackup = match;
			}
		}

		try {
			fs.copySync(mostRecentBackup, filePath);
		} catch (err) {
			reportRestoreBackupFailure(err);
			return formatErrorReplyAndSetState();
		}

		store.setStateByImageID(siteId, imageId, {
			compressedImageHash: null,
			compressedSize: null,
			errorMessage: null,
			revertToBackupStatus: RevertToBackupStatus.SUCCESS,
		});

		saveImageDataToDisk(store, serviceContainer);

		return {
			success: true,
		};
	}
}
