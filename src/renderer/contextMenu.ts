import { remote, shell } from 'electron';
import { useEffect } from 'react';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from '../constants';
import { selectors } from './store/store';

const { Menu, MenuItem } = remote;

const isMac = process.platform === 'darwin';
const contextEvent = 'contextmenu';
const menuWillCloseEvent = 'menu-will-close';
export const noContextMenuId = 'no-context-menu';
export const ioFileListContextMenuId = 'io-file-list-context-menu';

const revealPathMenuItem = (path: string) => {
	return new MenuItem({
		label: isMac ? 'Reveal in Finder' : 'Show folder',
		click() {
			shell.showItemInFolder(path)
		}
	});
}

const openPathMenuItem = (path: string) => {
	return new MenuItem({
		label: 'Open',
		click() {
			shell.openPath(path)
		}
	});
}

const revertToBackupMenuItem = (imageID: string) => {
	return new MenuItem({
		label: 'Revert to backup',
		async click() {
			const siteId = selectors.activeSiteID();
			LocalRenderer.ipcAsync(IPC_EVENTS.RESTORE_IMAGE_FROM_BACKUP, siteId, imageID);
		},
	});
};

export function useContextMenu() {
	useEffect(() => {
		const element = document.getElementById(noContextMenuId);
		if (element) {
			element.addEventListener(contextEvent, (e) => {
				e.preventDefault();
			});
		}

		const IOFileListElement = document.getElementById(ioFileListContextMenuId);
		if (IOFileListElement) {
			IOFileListElement.addEventListener(contextEvent, (e) => {
				e.preventDefault();
				const { imageid: imageID } = e.target.dataset;

				if (imageID) {
					const menu = new Menu()

					/**
					 * @todo get these selectors shaped up so
					 */
					const { filePath, compressedImageHash } = selectors.siteImages()[imageID];

					menu.append(revealPathMenuItem(filePath));
					menu.append(openPathMenuItem(filePath));

					if (compressedImageHash) {
						menu.append(revertToBackupMenuItem(imageID));
					}

					menu.popup({ window: remote.getCurrentWindow() });
					menu.once(menuWillCloseEvent, () => {
						menu.closePopup();
					});
				}

				if (imageID) {

				}
			});
		}
	}, []);
}
