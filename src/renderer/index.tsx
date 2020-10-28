import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import { Overview } from './overview';
import { FileListView } from './fileListView/fileListView';
import { IPC_EVENTS } from '../constants';
import { ipcRenderer } from 'electron';
import { SiteImageData, OptimizerStatus, ImageData } from '../types';
import { Preferences } from '../types';
/**
 * @todo delete unused reducer files
 */
import { scanImageReducer, initialState, SCAN_IMAGES_ACTIONS } from './reducers/scanImageReducer';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { fileListReducer } from './reducers/fileListReducer';
import { POPULATE_FILE_LIST } from './reducers/fileListReducer';
import { store, actions, useStoreSelector } from './store';

interface IProps {
	match: { params: { siteID: string; } };
}


const ImageOptimizer = (props: IProps) => {
	const { match } = props;
	const { siteID } = match.params;

	const preferences = useStoreSelector((state) => state.preferences);
	const siteImageData = useStoreSelector((state) => state.sites[siteID]);

	const [overviewSelected, setOverviewSelected] = useState(true);

	// const initialImageData = {} as SiteImageData;
	// const [siteImageData, dispatchSiteImageData] = useReducer(fileListReducer, initialImageData);

	useEffect(() => {
		store.dispatch(actions.setActiveSiteID(siteID));
	}, [siteID]);

	/**
	 * @todo remove this stubbed function
	 */
	const dispatchSiteImageData = (...args) => console.log('Hey, plz upate me', ...args);

	console.log('store', siteID, store.getState());
	console.log('main component state', siteImageData);

	const scanForImages = () => {
		store.dispatch(actions.scanRequest(siteID));

		ipcRenderer.send(
			IPC_EVENTS.SCAN_FOR_IMAGES,
			siteID,
		);
	}

	// set up initial state for file list view
	// useEffect(
	// 	() => {
	// 		(async () => {
	// 			const mainImageData = await LocalRenderer.ipcAsync(
	// 				IPC_EVENTS.GET_IMAGE_DATA,
	// 				siteID,
	// 				DatasetType.ONLY_UNCOMPRESSED
	// 			);

	// 			await fetchImageStateData();
	// 		})();
	// 	}, []
	// );

	/**
	 * @todo rethink the usage of this function now that it has been pared down
	 */
	const fetchImageStateData = async () => {
		// const mainImageData = await LocalRenderer.ipcAsync(
		// 	IPC_EVENTS.GET_IMAGE_DATA,
		// 	siteID,
		// 	DatasetType.ONLY_UNCOMPRESSED
		// );

		store.dispatch(
			actions.setSiteImageDataBeforeIntialCompression({ siteID, siteImageData })
		);

		// dispatchSiteImageData({
		// 	type: POPULATE_FILE_LIST.SET_IMAGE_DATA, payload: mainImageData
		// });
	}

	// listen for optimization events and update status accordingly
	useEffect(
		() => {
			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_SUCCESS,
					(_, imageData: ImageData) => {
						store.dispatch(actions.optimizeSuccess({ siteID, imageData }));

						// dispatchSiteImageData({
						// 	type: POPULATE_FILE_LIST.IMAGE_OPTIMIZE_SUCCESS, payload: newImageData
						// });
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_FAIL)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_FAIL,
					(_, imageID, errorMessage) => {
						store.dispatch(actions.optimizeFailure({ siteID, imageID, errorMessage }));

						// dispatchSiteImageData({
						// 	type: POPULATE_FILE_LIST.IMAGE_OPTIMIZE_FAIL, payload: { originalImageHash, errorMessage }
						// });
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_STARTED)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_STARTED,
					(_, imageID) => {
						store.dispatch(actions.optimizationStarted({ siteID, imageID }));

						// dispatchSiteImageData({
						// 	type: POPULATE_FILE_LIST.IMAGE_OPTIMIZE_STARTED, payload: { md5hash }
						// });
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE,
					async () => {
						store.dispatch(actions.optimizationComplete({ siteID }));

						// dispatchSiteImageData({
						// 	type: POPULATE_FILE_LIST.COMPRESS_ALL_IMAGES_COMPLETE
						// });
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.SCAN_IMAGES_COMPLETE)) {
				ipcRenderer.on(
					IPC_EVENTS.SCAN_IMAGES_COMPLETE,
					(_, siteImageState) => {
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

		// dispatchSiteImageData({
		// 	type: POPULATE_FILE_LIST.TOGGLE_CHECKED_ONE, payload: { imageID, isChecked }
		// });
	};

	// select or deselect all files
	const toggleSelectAll = (isChecked) => {
		store.dispatch(actions.setAllImagesSelected({ siteID, isChecked }));

		// dispatchSiteImageData({
		// 	type: POPULATE_FILE_LIST.TOGGLE_CHECKED_ALL, payload: { isChecked }
		// })
	};

	/**
	 * @todo rename this function since it is technically not a getter
	 */
	// compiles the list of images to be sent to the main thread for compression
	const getCompressionList = () => {
		/**
		 * @todo consider making this a selector
		 */
		const compressionList = Object.entries(siteImageData.imageData).reduce((acc, [id, data]) => {
			if (data.isChecked) {
				acc.push(id);
			}
			return acc
		}, [])

		store.dispatch(actions.optimizationRequested({ siteID, compressionListTotal: compressionList.length }));

		// dispatchSiteImageData({ type: POPULATE_FILE_LIST.IS_OPTIMIZING, payload: {
		// 	compressionListTotal: compressionList.length,
		// 	running: OptimizerStatus.RUNNING
		// } });

		ipcRenderer.send(
			IPC_EVENTS.COMPRESS_IMAGES,
			siteID,
			compressionList,
			preferences.stripMetaData,
		);
	}

	const resetToOverview = () => {
		setOverviewSelected(true);
		scanForImages();
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
				/>
			);

		default:
			return (
				<Overview
					siteImageData={siteImageData}
					setOverviewSelected={setOverviewSelected}
					handleScanForImages={scanForImages}
					fetchImageStateData={fetchImageStateData}
				/>
			);
	}

};

export default ImageOptimizer;
