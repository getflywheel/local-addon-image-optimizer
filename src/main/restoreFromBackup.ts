import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import escapeGlob from 'glob-escape';
import * as LocalMain from '@getflywheel/local/main';
import { BACKUP_DIR_NAME } from '../constants';
import { Store } from '../types';


const formatErrorReply = (error: string) => ({
	success: false,
	error,
});


export function restoreImageFromBackupFactory(serviceContainer: LocalMain.ServiceContainerServices, store: Store) {
	return async function(siteId: string, imageId: string): Promise<{ success: boolean }> {
		const state = store.getStateBySiteID(siteId);

		const fileData = state.imageData[imageId];

		if (!fileData) {
			return formatErrorReply('File data not found');
		}

		const site = serviceContainer.siteData.getSite(siteId);
		const { filePath } = fileData;

		// path to the root of the site's backup dir
		const baseBackupDirPath = path.join(site.longPath, BACKUP_DIR_NAME);
		let imageBackupPath = filePath.replace(path.join(site.paths.webRoot, 'wp-content'), baseBackupDirPath);
		const { dir, name, ext } = path.parse(imageBackupPath);

		const globMatcher = `${escapeGlob(`${dir}/${name}`)}?( \\([1-9]*\\))${ext}`;

		let matches;

		/**
		 * Handle any potential bad glob patterns passed to glob.sync
		 *
		 * @todo log/send this shit to the ui
		 */
		try {
			matches = glob.sync(globMatcher);
		} catch(err) {
			console.error(err);
		}

		if (matches.length === 0) {
			return formatErrorReply('No backups found for this image');
		}

		let mostRecentBackup;
		let mostRecentTimeStamp = 0;

		for (const match of matches) {
			try {

			const { birthtimeMs } = fs.statSync(match);

			if (birthtimeMs > mostRecentTimeStamp) {
				mostRecentTimeStamp = birthtimeMs;
				mostRecentBackup = match;
			}
			}
			catch(err) {
				console.error(err)
			}
		}

		try {
			fs.copySync(mostRecentBackup, filePath);
		} catch (err) {
			console.error(err);
			return formatErrorReply('Compressed image could not be replaced with backup')
		} finally {
			store.setStateByImageID(siteId, fileData.originalImageHash, {
				compressedImageHash: null,
				compressedSize: null,
			});
		}

		return {
			success: true,
		};
	}
}
