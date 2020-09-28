import React, { useState, useEffect, useReducer } from 'react';
import { Overview } from './overview';
import { FileListView } from './fileListView/fileListView';
import { IPC_EVENTS } from '../constants';
import { ipcRenderer } from 'electron';
import { RenderedImageData } from './types';
import { scanImageReducer, initialState, SCAN_IMAGES_ACTIONS } from '../scanImageReducer';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { fileListReducer } from './fileListView/fileListReducer';
import { POPULATE_FILE_LIST } from './fileListView/fileListReducer';


export const ImageOptimizer = (props) => {
	const [overviewSelected, setOverviewSelected] = useState(true);
	const initialImageData = {} as RenderedImageData;
	const [siteImageData, dispatchSiteImageData] = useReducer(fileListReducer, initialImageData);
	const [scanImageState, dispatchScanImageData] = useReducer(scanImageReducer, initialState);

	const scanForImages = async () => {
		try {
			dispatchScanImageData({ type: SCAN_IMAGES_ACTIONS.REQUEST });
			const scannedImages = await LocalRenderer.ipcAsync(IPC_EVENTS.SCAN_FOR_IMAGES, props.match.params.siteID);
			dispatchScanImageData({ type: SCAN_IMAGES_ACTIONS.SUCCESS, payload: scannedImages });
		} catch (error) {
			dispatchScanImageData({ type: SCAN_IMAGES_ACTIONS.FAILURE, payload: error });
		}
	}

	// set up initial state for file list view
	useEffect(
		() => {
			const setSiteImageData = async () => {
				await scanForImages();

				const mainImageData = await LocalRenderer.ipcAsync(
					IPC_EVENTS.GET_IMAGE_DATA,
					props.match.params.siteID,
				);

				dispatchSiteImageData({
					type: POPULATE_FILE_LIST.SET_IMAGE_DATA, payload: mainImageData
				});
			}
			setSiteImageData();
		}, []
	);

	// listen for optimization events and update status accordingly
	useEffect(
		() => {
			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_SUCCESS,
					(_, newImageData: ImageData) => {
						dispatchSiteImageData({
							type: POPULATE_FILE_LIST.IMAGE_OPTIMIZE_SUCCESS, payload: newImageData
						});
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_FAIL)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_FAIL,
					(_, originalImageHash, errorMessage) => {
						dispatchSiteImageData({
							type: POPULATE_FILE_LIST.IMAGE_OPTIMIZE_FAIL, payload: { originalImageHash, errorMessage }
						});
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_IMAGE_STARTED)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_IMAGE_STARTED,
					(_, md5hash) => {
						dispatchSiteImageData({
							type: POPULATE_FILE_LIST.IMAGE_OPTIMIZE_STARTED, payload: { md5hash }
						});
					},
				);
			}

			if (!ipcRenderer.listenerCount(IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE)) {
				ipcRenderer.on(
					IPC_EVENTS.COMPRESS_ALL_IMAGES_COMPLETE,
					() => {
						dispatchSiteImageData({
							type: POPULATE_FILE_LIST.COMPRESS_ALL_IMAGES_COMPLETE, payload: { complete: 'complete' }
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
	const handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void = (imageID) => (isChecked) => {
		dispatchSiteImageData({
			type: POPULATE_FILE_LIST.TOGGLE_CHECKED_ONE, payload: { imageID, isChecked }
		});
	};

	// select or deselect all files
	const toggleSelectAll = (isChecked) => {
		dispatchSiteImageData({
			type: POPULATE_FILE_LIST.TOGGLE_CHECKED_ALL, payload: { isChecked }
		})
	};

	// compiles the list of images to be sent to the main thread for compression
	const getCompressionList = () => {
		const compressionList = Object.entries(siteImageData.imageData).reduce((acc, [id, data]) => {
			if (data.isChecked) {
				acc.push(id);
			}
			return acc
		}, [])

		const compressionListTotal = compressionList.length;

		dispatchSiteImageData({ type: POPULATE_FILE_LIST.IS_OPTIMIZING, payload: {compressionListTotal, running: 'running'} });

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
					getCompressionList={getCompressionList}
					isCurrentlyOptimizing={siteImageData.isCurrentlyOptimizing}
					compressionListTotal={siteImageData.compressionListTotal}
					compressionListCompletionPercentage={siteImageData.compressionListCompletionPercentage}
					setOverviewSelected={setOverviewSelected}
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
