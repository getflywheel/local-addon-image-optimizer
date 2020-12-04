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
		/**
		 * find the image
		 * find the backup (or backups)
		 */
		// stats.cTimeMs

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
		// path to the nested dir the image should be backed up in
		let imageBackupPath = filePath.replace(path.join(site.paths.webRoot, 'wp-content'), baseBackupDirPath);
		const { dir, name, ext } = path.parse(imageBackupPath);

		// take the basename and build up a glob pattern to account for de-dupes
		// then, get a match of files in imageBackupDir with the glob that was just built up
		// then check each of the files for the most recently created with stats.cTimeMs.

		// /(image)(\s*\(([0-9]+)\))?.(jpg|jpeg)/g

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

		const mostRecentBackup = matches.reduce((mostRecent, match) => {
			const { birthtimeMs } = fs.statSync(match);

			console.log(match, birthtimeMs);

			if (birthtimeMs > mostRecent) {
				mostRecent = birthtimeMs;
			}

			return mostRecent;
		}, 0);

		console.log(mostRecentBackup);
	}
}
