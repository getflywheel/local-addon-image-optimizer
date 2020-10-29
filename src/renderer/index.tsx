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

	const preferences = useStoreSelector((state) => state.preferences);
	const siteImageData = useStoreSelector((state) => state.sites[siteID]);

	const [overviewSelected, setOverviewSelected] = useState(true);

	const scanForImages = () => {
		store.dispatch(actions.scanRequest(siteID));

		ipcRenderer.send(
			IPC_EVENTS.SCAN_FOR_IMAGES,
			siteID,
		);
	}

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

	/**
	 * @todo rename this function since it is technically not a getter
	 */
	// compiles the list of images to be sent to the main thread for compression
	const getCompressionList = () => {
		const compressionList = selectors.selectedSiteImages(store.getState(), props).map((d) => d.originalImageHash);

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

	// cancel image optimization session
	const onCancel = () => {
		ipcRenderer.send(
			IPC_EVENTS.CANCEL_COMPRESSION,
		);
	}

	switch (overviewSelected) {
		case false:
			return(
				<FileListView
					siteImageData={siteImageData}
					handleCheckBoxChange={handleCheckBoxChange}
					toggleSelectAll={toggleSelectAll}
					getCompressionList={getCompressionList}
					resetToOverview={resetToOverview}
					onCancel={onCancel}
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
