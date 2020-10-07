import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import { Overview } from './overview';
import { FileListView } from './fileListView/fileListView';
import { IPC_EVENTS } from '../constants';
import { ipcRenderer } from 'electron';
import { Preferences } from '../types';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { combinedStateReducer, STATE_UPDATE_ACTIONS } from './reducers/combinedStateReducer';
import { DatasetType } from '../types';
import { CombinedStateData, ImageData } from '../types'

interface IProps {
	preferences: Preferences;
	match: { params: { siteID: string; } };
}

const ImageOptimizer = (props: IProps) => {
	const [overviewSelected, setOverviewSelected] = useState(true);
	const initialCombinedState = {} as CombinedStateData;
	const [combinedStateData, dispatchCombinedStateData] = useReducer(combinedStateReducer, initialCombinedState);

	const scanForImages = async () => {
		try {
			dispatchCombinedStateData({ type: STATE_UPDATE_ACTIONS.SCAN_REQUEST });
			const scannedImages = await LocalRenderer.ipcAsync(IPC_EVENTS.SCAN_FOR_IMAGES, props.match.params.siteID);
			dispatchCombinedStateData({ type: STATE_UPDATE_ACTIONS.SCAN_SUCCESS, payload: scannedImages });
		} catch (error) {
			dispatchCombinedStateData({ type: STATE_UPDATE_ACTIONS.SCAN_FAILURE, payload: error });
		}
	}
	console.log({combinedStateData});

	// set up initial state for file list view
	useEffect(
		() => {
			const initialImageScan = async () => {
				await fetchImageStateData();
			}
			initialImageScan();
		}, []
	);


	// Retrieve only the images that haven't yet been compressed and populate the state data for File List View
	const fetchImageStateData = async () => {
		const mainImageData = await LocalRenderer.ipcAsync(
			IPC_EVENTS.GET_IMAGE_DATA,
			props.match.params.siteID,
			DatasetType.ONLY_UNCOMPRESSED
		);

		dispatchCombinedStateData({
			type: STATE_UPDATE_ACTIONS.SET_UNCOMPRESSED_IMAGE_DATA, payload: mainImageData
		});
	}
	// listen for optimization events and update status accordingly
	useEffect(
		() => {
			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_SUCCESS,
					(_, newImageData: ImageData) => {
						dispatchCombinedStateData({
							type: STATE_UPDATE_ACTIONS.IMAGE_OPTIMIZE_SUCCESS, payload: newImageData
						});
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_FAIL)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_FAIL,
					(_, originalImageHash, errorMessage) => {
						dispatchCombinedStateData({
							type: STATE_UPDATE_ACTIONS.IMAGE_OPTIMIZE_FAIL, payload: { originalImageHash, errorMessage }
						});
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_STARTED)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_STARTED,
					(_, md5hash) => {
						dispatchCombinedStateData({
							type: STATE_UPDATE_ACTIONS.IMAGE_OPTIMIZE_STARTED, payload: { md5hash }
						});
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE,
					async () => {
						dispatchCombinedStateData({
							type: STATE_UPDATE_ACTIONS.COMPRESS_ALL_IMAGES_COMPLETE
						});
						const updatedScannedImages = await LocalRenderer.ipcAsync(IPC_EVENTS.SCAN_FOR_IMAGES, props.match.params.siteID);
						dispatchCombinedStateData({
							type: STATE_UPDATE_ACTIONS.ON_OPTIMIZE_SUCCESS, payload: updatedScannedImages
						});
					},
				);
			}

			return () => {
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_IMAGE_STARTED);
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_IMAGE_FAIL);
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS);
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE);
			}
		},
		[combinedStateData],
	);

	// handles file selection for final optimization list
	const handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void = (imageID) => (isChecked) => {
		dispatchCombinedStateData({
			type: STATE_UPDATE_ACTIONS.TOGGLE_SELECT_ONE_IMAGE, payload: { imageID, isChecked }
		});
	};

	// select or deselect all files
	const toggleSelectAll = (isChecked) => {
		dispatchCombinedStateData({
			type: STATE_UPDATE_ACTIONS.TOGGLE_SELECT_ALL_IMAGES, payload: { isChecked }
		})
	};

	// compiles the list of images to be sent to the main thread for compression
	const getCompressionList = () => {
		const compressionList: [string, ImageData][] = Object.entries(combinedStateData.imageData);

		const compressionListTotal = compressionList.reduce((acc, [id, data]) => {
			if (data.isChecked) {
				acc.push(id);
			}
			return acc
		}, [])

		dispatchCombinedStateData({ type: STATE_UPDATE_ACTIONS.IS_OPTIMIZING, payload: {
			compressionListTotal: compressionListTotal.length
		} });

		ipcRenderer.send(
			IPC_EVENTS.COMPRESS_IMAGES,
			props.match.params.siteID,
			compressionListTotal,
			props.preferences.stripMetaData,
		);
	}

	// compiles the list of images to be sent to the main thread for compression
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
					combinedStateData={combinedStateData}
					handleCheckBoxChange={handleCheckBoxChange}
					toggleSelectAll={toggleSelectAll}
					getCompressionList={getCompressionList}
					resetToOverview={resetToOverview}
					onCancel={onCancel}
					setOverviewSelected={setOverviewSelected}
				/>
			);

		default:
			return (
				<Overview
					combinedStateData={combinedStateData}
					setOverviewSelected={setOverviewSelected}
					handleScanForImages={scanForImages}
					fetchImageStateData={fetchImageStateData}
				/>
			);
	}

};

export default connect(
	(state) => ({
		preferences: state.preferences,
	}),
)(ImageOptimizer);
