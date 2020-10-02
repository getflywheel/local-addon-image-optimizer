import React, { useState, useEffect, useReducer } from 'react';
import { connect } from 'react-redux';
import { Overview } from './overview';
import { FileListView } from './fileListView/fileListView';
import { IPC_EVENTS } from '../constants';
import { ipcRenderer } from 'electron';
import { RenderedImageData, OptimizerStatus } from './types';
import { Preferences } from '../types';
import { scanImageReducer, initialState, SCAN_IMAGES_ACTIONS } from './reducers/scanImageReducer';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { fileListReducer } from './reducers/fileListReducer';
import { POPULATE_FILE_LIST } from './reducers/fileListReducer';
import { DatasetType } from '../types';

interface IProps {
	preferences: Preferences;
	match: { params: { siteID: string; } };
}

const ImageOptimizer = (props: IProps) => {
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
			const initialImageScan = async () => {
				await scanForImages();
				await fetchImageStateData();
			}
			initialImageScan();
		}, []
	);


	const fetchImageStateData = async () => {
		const mainImageData = await LocalRenderer.ipcAsync(
			IPC_EVENTS.GET_IMAGE_DATA,
			props.match.params.siteID,
			DatasetType.ONLY_UNCOMPRESSED
		);

		dispatchSiteImageData({
			type: POPULATE_FILE_LIST.SET_IMAGE_DATA, payload: mainImageData
		});
	}
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
					async () => {
						dispatchSiteImageData({
							type: POPULATE_FILE_LIST.COMPRESS_ALL_IMAGES_COMPLETE, payload: { complete: OptimizerStatus.COMPLETE }
						});
						const updatedScannedImages = await LocalRenderer.ipcAsync(IPC_EVENTS.SCAN_FOR_IMAGES, props.match.params.siteID);
						dispatchScanImageData({
							type: SCAN_IMAGES_ACTIONS.OPTIMIZE_SUCCESS, payload: updatedScannedImages
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

		dispatchSiteImageData({ type: POPULATE_FILE_LIST.IS_OPTIMIZING, payload: {
			compressionListTotal: compressionList.length,
			running: OptimizerStatus.RUNNING
		} });

		ipcRenderer.send(
			IPC_EVENTS.COMPRESS_IMAGES,
			props.match.params.siteID,
			compressionList,
			props.preferences.stripMetaData,
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
					optimizationStatus={siteImageData.optimizationStatus}
					compressionListTotal={siteImageData.compressionListTotal}
					compressionListCompletionPercentage={siteImageData.compressionListCompletionPercentage}
					setOverviewSelected={setOverviewSelected}
					totalFileSizeDeductions={siteImageData.totalFileSizeDeductions}
				/>
			);

		default:
			return (
				<Overview
					scanImageState={scanImageState}
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
