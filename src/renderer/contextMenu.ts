import { remote, shell } from 'electron';
import { useEffect } from 'react';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from '../constants';
import { selectors, actions, store } from './store/store';
import invokeModal from './invokeModal';
import ConfirmRestoreBackupModalContents from './confirmRestoreBackupModalContents';

const { Menu, MenuItem } = remote;

const isMac = process.platform === 'darwin';
const contextEvent = 'contextmenu';
const menuWillCloseEvent = 'menu-will-close';

export const uncomprepssedImageListNoContextMenu = 'uncompressed-image-list-no-context-menu';
export const uncompressedImageListContextMenu = 'uncompressed-image-list-context-menu';

export const comprepssedImageListNoContextMenu = 'compressed-image-list-no-context-menu';
export const compressedImageListContextMenu = 'compressed-image-list-context-menu';

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

const revertToBackupMenuItem = (imageID: string, filePath: string) => {
	return new MenuItem({
		label: 'Revert to backup',
		async click() {
			const siteID = selectors.activeSiteID();
			invokeModal({
				ModalContents: ConfirmRestoreBackupModalContents,
				onSubmit: async () => {
					const { success } = await LocalRenderer.ipcAsync(IPC_EVENTS.RESTORE_IMAGE_FROM_BACKUP, siteID, imageID)
					let action = actions.revertToBackupSuccess;

					if (!success) {
						action = actions.revertToBackupFailure;
					}

					store.dispatch(action({ siteID, imageID }));
				}
			});
		},
	});
};

export function useContextMenu(parentNodeId: string, contextMenuAreaId: string) {
	useEffect(() => {
		/**
		 * Remove any other context menu's.
		 *
		 * This is necessary because Local will expose a context menu with developer options
		 * if the "Show Developer Options" setting is on.
		 */
		const element = document.getElementById(parentNodeId);
		if (element) {
			element.addEventListener(contextEvent, (e) => {
				e.preventDefault();
			});
		}

		const imageList = document.getElementById(contextMenuAreaId);

		if (!imageList) {
			return;
		}

		imageList.addEventListener(contextEvent, (e) => {
			e.preventDefault();
			const { imageid: imageID } = e.target.dataset;

			if (!imageID) {
				return;
			}

			const menu = new Menu()
			const { filePath, compressedImageHash } = selectors.siteImages()[imageID];

			menu.append(revealPathMenuItem(filePath));
			menu.append(openPathMenuItem(filePath));

			if (compressedImageHash) {
				menu.append(revertToBackupMenuItem(imageID, filePath));
			}

			menu.popup({ window: remote.getCurrentWindow() });
			menu.once(menuWillCloseEvent, () => {
				menu.closePopup();
			});
		});
	}, []);
}
