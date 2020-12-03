import { remote, shell } from 'electron';
import { useEffect } from 'react';

const { Menu, MenuItem } = remote;

const isMac = process.platform === 'darwin';
const contextEvent = 'contextmenu';
const menuWillCloseEvent = 'menu-will-close';
export const noContextMenuId = 'no-context-menu';
export const ioFileListContextMenuId = 'io-file-list-context-menu';

const revealPathMenuItem = (path: string) => {
}

const openPathMenuItem = (path: string) => {
}

const menuItems = [
	(path: string) => new MenuItem({
		label: isMac ? 'Reveal in Finder my dude' : 'Show folder',
		click() {
			shell.showItemInFolder(path)
		}
	}),
	(path: string) => new MenuItem({
		label: 'Open',
		click() {
			shell.openPath(path)
		}
	}),
];

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
				const path = e.target.dataset.path;
				if (path) {
					const menu = new Menu()

					menuItems.forEach((menuItem) => menu.append(menuItem(path)));

					// menu.append(revealPathMenuItem(path));
					// menu.append(openPathMenuItem(path));

					menu.popup({ window: remote.getCurrentWindow() });
					menu.once(menuWillCloseEvent, () => {
						menu.closePopup();
					});
				}
			});
		}
	}, []);
}
