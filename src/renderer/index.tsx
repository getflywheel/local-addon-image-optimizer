import React, { useState, useEffect } from 'react';
import { Overview } from './overview';
import { FileListView } from './fileListView/fileListView';
import { IPC_EVENTS } from '../constants';
import { ipcRenderer } from 'electron';
import { OptimizerStatus, ImageData } from '../types';
import { store, actions, selectors, useStoreSelector } from './store';

interface IProps {
	match: { params: { siteID: string; } };
}


const ImageOptimizer = (props: IProps) => {
	const { match } = props;
	const { siteID } = match.params;

	const [activeSiteID, preferences, siteImageData] = useStoreSelector((state) => ([
		state.activeSiteID,
		state.preferences,
		state.sites[siteID],
	]));

	// const activeSiteID = useStoreSelector((state) => state.activeSiteID);
	const [overviewSelected, setOverviewSelected] = useState(true);

	const scanForImages = () => {
		store.dispatch(actions.scanRequest(siteID));

		ipcRenderer.send(
			IPC_EVENTS.SCAN_FOR_IMAGES,
			siteID,
		);
	}

	useEffect(
		() => {
			store.dispatch(actions.setActiveSiteID(siteID));
		},
		[siteID],
	);

	// listen for optimization events and update status accordingly
	useEffect(
		() => {
			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_SUCCESS,
					(_, imageData: ImageData) => {
						store.dispatch(actions.optimizeSuccess({ siteID, imageData }));
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_FAIL)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_FAIL,
					(_, imageID, errorMessage) => {
						store.dispatch(actions.optimizeFailure({ siteID, imageID, errorMessage }));
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_STARTED)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_STARTED,
					(_, imageID) => {
						store.dispatch(actions.optimizationStarted({ siteID, imageID }));
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE,
					async () => {
						store.dispatch(actions.optimizationComplete({ siteID }));
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.SCAN_IMAGES_COMPLETE)) {
				ipcRenderer.on(
					IPC_EVENTS.SCAN_IMAGES_COMPLETE,
					(_, siteImageData) => {
						store.dispatch(actions.scanSuccess({ siteID, siteImageData }));
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.SCAN_IMAGES_FAILURE)) {
				ipcRenderer.on(
					IPC_EVENTS.SCAN_IMAGES_COMPLETE,
					(_, error) => {
						store.dispatch(actions.scanFailure({ siteID, error }));
					},
				);
			}

			return () => {
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_IMAGE_STARTED);
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_IMAGE_FAIL);
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS);
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE);
				ipcRenderer.removeAllListeners(IPC_EVENTS.SCAN_IMAGES_COMPLETE);
				ipcRenderer.removeAllListeners(IPC_EVENTS.SCAN_IMAGES_FAILURE);
			}
		},
		[siteImageData],
	);

	// handles file selection for final optimization list
	const handleCheckBoxChange = (imageID: string) => (isChecked: boolean) => {
		store.dispatch(actions.setImageSelected({ siteID, imageID, isChecked }));
	};

	// select or deselect all files
	const toggleSelectAll = (isChecked) => {
		store.dispatch(actions.setAllImagesSelected({ siteID, isChecked }));
	};

	const compressSelectedImages = () => {
		const compressionList = selectors.selectedSiteImages().map((d) => d.originalImageHash);

		store.dispatch(actions.optimizationRequested({ siteID, compressionListTotal: compressionList.length }));

		ipcRenderer.send(
			IPC_EVENTS.COMPRESS_IMAGES,
			siteID,
			compressionList,
			preferences.stripMetaData,
		);
	}

	const resetToOverview = () => {
		setOverviewSelected(true);

		store.dispatch(actions.optimizationStatus({ siteID, optimizationStatus: OptimizerStatus.BEFORE }));
	}

	const cancelImageCompression = () => {
		ipcRenderer.send(
			IPC_EVENTS.CANCEL_COMPRESSION,
		);
	}

	if (!activeSiteID) {
		return null;
	}

	if (!siteImageData) {
		store.dispatch(actions.addSite({ siteID }));

		return null;
	}

	switch (overviewSelected) {
		case false:
			return(
				<FileListView
					siteImageData={siteImageData}
					handleCheckBoxChange={handleCheckBoxChange}
					toggleSelectAll={toggleSelectAll}
					compressSelectedImages={compressSelectedImages}
					resetToOverview={resetToOverview}
					cancelImageCompression={cancelImageCompression}
					setOverviewSelected={setOverviewSelected}
					preferences={preferences}
					siteID={siteID}
				/>
			);

		default:
			return (
				<Overview
					siteImageData={siteImageData}
					setOverviewSelected={setOverviewSelected}
					handleScanForImages={scanForImages}
					siteID={siteID}
				/>
			);
	}

};

export default ImageOptimizer;
