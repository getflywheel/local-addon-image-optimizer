import {
	remote,
	shell,
} from 'electron';
import { useEffect } from 'react';

const { Menu, MenuItem } = remote;

const isMac = process.platform === 'darwin'

const revealPathMenuItem = (path: string) => {
	return new MenuItem({
		label: isMac ? 'Reveal in Finder' : 'Show folder',
		click() {
			shell.showItemInFolder(path)
		}
	})
}

const openPathMenuItem = (path: string) => {
	return new MenuItem({
		label: 'Open',
		click() {
			shell.openPath(path)
		}
	})
}

export default function useContextMenu() {
	useEffect(() => {
		const element = document.getElementById('no-context-menu');
		if (element) {
			element.addEventListener('contextmenu', (e) => {
				e.preventDefault();
			});
		}

		const IOFileListElement = document.getElementById('io-file-list');
		if (IOFileListElement) {
			IOFileListElement.addEventListener('contextmenu', (e) => {
				e.preventDefault();
				const path = e.target.dataset.path;
				if (path) {
					const menu = new Menu()
					menu.append(revealPathMenuItem(path));
					menu.append(openPathMenuItem(path));
					menu.popup({ window: remote.getCurrentWindow() });
					menu.once('menu-will-close', () => {
						menu.closePopup();
					});
				}
			});
		}
	}, []);
}
