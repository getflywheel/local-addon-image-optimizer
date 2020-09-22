import React, { useState, useEffect, useReducer } from 'react';
import { Overview } from './overview';
import { FileListView } from './fileListView';
import { IPC_EVENTS } from '../constants';
import { ipcRenderer } from 'electron';
import { SiteImageData } from '../types';

import { scanImageReducer, initialState, SCAN_IMAGES_ACTIONS } from '../scanImageReducer';

// https://getflywheel.github.io/local-addon-api/modules/_local_renderer_.html
import * as LocalRenderer from '@getflywheel/local/renderer';

import { fileListReducer } from './fileListReducer';
import { POPULATE_FILE_LIST } from './fileListReducer';
import { Button, FlyModal, Title, Text } from '@getflywheel/local-components';

export const ImageOptimizer = (props) => {
	const [scanImageState, dispatch] = useReducer(scanImageReducer, initialState);
	const [overviewSelected, setOverviewSelected] = useState(true);
	const initialImageData = {} as SiteImageData;
	const [siteImageData, imageStateUpdate] = useReducer(fileListReducer, initialImageData);

	const scanForImages = async () => {
		try {
			dispatch({ type: SCAN_IMAGES_ACTIONS.REQUEST });
			const scannedImages = await LocalRenderer.ipcAsync(IPC_EVENTS.SCAN_FOR_IMAGES, props.match.params.siteID);
			dispatch({ type: SCAN_IMAGES_ACTIONS.SUCCESS, payload: scannedImages });
		} catch (error) {
			dispatch({ type: SCAN_IMAGES_ACTIONS.FAILURE, payload: error });
		}
	}

	useEffect(
		() => {
			scanForImages();
		}, []
	);

	// set up initial state for file list view
	useEffect(
		() => {
			LocalRenderer.ipcAsync(
				IPC_EVENTS.GET_IMAGE_DATA,
				props.match.params.siteID,
			).then((result: SiteImageData) => {
				imageStateUpdate({
					type: POPULATE_FILE_LIST.SET_IMAGE_DATA, payload: result
				});
			});
		}, []
	);

	// trigger a new image scan
	const handleScanForImages = () => {
		scanForImages();
	}

	// listen for optimization events
	useEffect(
		() => {
			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_SUCCESS,
					(_, newImageData: ImageData) => {
						console.log(newImageData);
						imageStateUpdate({
							type: POPULATE_FILE_LIST.IMAGE_OPTIMIZE_SUCCESS, payload: newImageData
						});
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_FAIL)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_FAIL,
					(_, originalImageHash, errorMessage) => {
						imageStateUpdate({
							type: POPULATE_FILE_LIST.IMAGE_OPTIMIZE_FAIL, payload: { originalImageHash, errorMessage }
						});
						console.log({originalImageHash}, {errorMessage});
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_STARTED)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_STARTED,
					(_, md5hash) => {
						imageStateUpdate({
							type: POPULATE_FILE_LIST.IMAGE_OPTIMIZE_SUCCESS, payload: { md5hash }
						});
					},
				);
			}

			return () => {
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_IMAGE_STARTED);
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_IMAGE_FAIL);
				ipcRenderer.removeAllListeners(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS);
			}
		},
		[siteImageData],
	);

	// handles file selection for final optimization list
	const handleCheckBoxChange = (imageID) => (isChecked) => {
		imageStateUpdate({
			type: POPULATE_FILE_LIST.TOGGLE_CHECKED_ONE, payload: { imageID, isChecked }
		});
	};

	// select or deselect all files
	const toggleSelectAll = (isChecked) => {
		imageStateUpdate({
			type: POPULATE_FILE_LIST.TOGGLE_CHECKED_ALL, payload: { isChecked }
		})
	};

	// remove this - currently used for debugging
	const getImageDataState = () => {
		console.log(siteImageData);
	}

	const getCompressionList = () => {
		const compressionList = Object.entries(siteImageData.imageData).reduce((acc, [id, data]) => {
			if (data.isChecked) {
				acc.push(id);
			}
			return acc
		}, [])

		console.log(compressionList);
		imageStateUpdate({ type: POPULATE_FILE_LIST.IS_OPTIMIZING });

		ipcRenderer.send(
			IPC_EVENTS.COMPRESS_IMAGES,
			props.match.params.siteID,
			compressionList,
		);
	}

	switch (overviewSelected) {
		case false:
			return(
				<FileListView
					imageData={Object.values(siteImageData.imageData)}
					handleCheckBoxChange={handleCheckBoxChange}
					toggleSelectAll={toggleSelectAll}
					toggleSelectAllValue={siteImageData.selectAllFilesValue}
					getImageDataState={getImageDataState}
					getCompressionList={getCompressionList}
					isCurrentlyOptimizing={siteImageData.isCurrentlyOptimizing}
				/>
			);

		default:
			return (
				<Overview
					scanImageState={scanImageState}
					setOverviewSelected={setOverviewSelected}
					handleScanForImages={scanForImages}
				/>
			);
	}

};
