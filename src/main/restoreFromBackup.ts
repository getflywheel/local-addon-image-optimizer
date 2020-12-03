import path from 'path';
import fs from 'fs-extra';
import isString from 'lodash';
import * as LocalMain from '@getflywheel/local/main';
import { BACKUP_DIR_NAME, IPC_EVENTS } from '../constants';
import { Store } from '../types';
import { getSupportedFileExtensions } from './utils';


export function restoreImageFromBackupFactory(serviceContainer: LocalMain.ServiceContainerServices, store: Store) {
	return async function(siteId: string, imageId: string) {
		/**
		 * find the image
		 * find the backup (or backups)
		 *
		 */
		// stats.cTimeMs

		const site = serviceContainer.siteData.getSite(siteId);



		const { filePath } = store.getStateBySiteID(siteId).imageData[imageId];
		const baseName = path.basename(filePath);
		// const {  } = fs.statSync(imageData.filePath);

		// path to the root of the site's backup dir
		const baseBackupDirPath = path.join(site.longPath, BACKUP_DIR_NAME);
		// path to the nested dir the image should be backed up in
		let imageBackupDir = filePath.replace(path.join(site.paths.webRoot, 'wp-content'), baseBackupDirPath);

		// take the basename and build up a glob pattern to account for de-dupes
		// then, get a match of files in imageBackupDir with the glob that was just built up
		// then check each of the files for the most recently created with stats.cTimeMs.

		// /(image)(\s*\(([0-9]+)\))?.(jpg|jpeg)/g

		const regex = new RegExp(`(${baseName})(\s*\(([0-9]+)\))?.(${getSupportedFileExtensions().join('|')})`, 'g');

		console.log('regex', regex);


	}
}
