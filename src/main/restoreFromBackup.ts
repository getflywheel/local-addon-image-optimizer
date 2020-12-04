import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import escapeGlob from 'glob-escape';
import isString from 'lodash';
import * as LocalMain from '@getflywheel/local/main';
import { BACKUP_DIR_NAME, IPC_EVENTS } from '../constants';
import { Store } from '../types';
import { getSupportedFileExtensions } from './utils';
import { stat } from 'fs';


export function restoreImageFromBackupFactory(serviceContainer: LocalMain.ServiceContainerServices, store: Store) {
	return async function(siteId: string, filePath: string) {
		const state = store.getStateBySiteID(siteId);

		// ensure that the filePath is legit
		const fileData = Object.values(state.imageData).find((d) => d.filePath === filePath);
		if (!fileData) {
			/**
			 * @todo handle this as an error or something?
			 */
			return;
		}

		const site = serviceContainer.siteData.getSite(siteId);

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
			/**
			 * @todo send back a message saying that no backup exists
			 */

			return;
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

		console.log(mostRecentBackup, mostRecentTimeStamp);

		try {
			fs.copySync(mostRecentBackup, filePath);
		} catch (err) {
			console.error(err);
		} finally {
			store.setStateByImageID(siteId, fileData.originalImageHash, {
				compressedImageHash: null,
				compressedSize: null,
			});
		}

		return;
	}
}
