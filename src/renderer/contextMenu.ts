import { remote, shell } from 'electron';
import { useEffect } from 'react';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from '../constants';
import { selectors } from './store/store';
import invokeModal, { BaseModalProps } from './invokeModal';

const { Menu, MenuItem } = remote;

const isMac = process.platform === 'darwin';
const contextEvent = 'contextmenu';
const menuWillCloseEvent = 'menu-will-close';
export const noContextMenuId = 'no-context-menu';
export const ioFileListContextMenuId = 'io-file-list-context-menu';
export const compressedFileList = 'io-compressed-file-list';

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
			// LocalRenderer.ipcAsync(IPC_EVENTS.RESTORE_IMAGE_FROM_BACKUP, siteId, imageID);
			// invokeModal({
			// 	ModalContents: Comp,
			// 	modalContentsProps: { hello: 'hey' },
			// });
		},
	});
};

type TableType = 'revealPath' | 'openPath' | 'revertToBackup';

export function useContextMenu() {
	useEffect(() => {
		const element = document.getElementById(noContextMenuId);
		if (element) {
			element.addEventListener(contextEvent, (e) => {
				e.preventDefault();
			});
		}

		const uncompressedImageList = document.getElementById(ioFileListContextMenuId);
		if (uncompressedImageList) {
			uncompressedImageList.addEventListener(contextEvent, (e) => {
				e.preventDefault();
				const { imageid: imageID } = e.target.dataset;

				if (imageID) {
					const menu = new Menu()

					/**
					 * @todo get these selectors shaped up so that state gets passed in appropriately
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
			});
		}
	}, []);
}
