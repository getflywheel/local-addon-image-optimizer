import React, { useState, useEffect, useReducer } from 'react';
import { Overview } from './overview';
import { FileListView } from './fileListView';
import { ipcRenderer } from 'electron';
import { IPC_EVENTS } from '../constants';

import { scanImageReducer, initialState, SCAN_IMAGES_ACTIONS } from '../scanImageReducer';

// https://getflywheel.github.io/local-addon-api/modules/_local_renderer_.html
import * as LocalRenderer from '@getflywheel/local/renderer';
// https://github.com/getflywheel/local-components
import { Button, FlyModal, Title, Text } from '@getflywheel/local-components';

export const ImageOptimizer = (props) => {
	const [scanImageState, dispatch] = useReducer(scanImageReducer, initialState);
	const [overviewSelected, setOverviewSelected] = useState(true);

	const [imageData, setImageData] = useState({});

	const scanForImages = async () => {
		dispatch({ type: SCAN_IMAGES_ACTIONS.REQUEST });
		LocalRenderer.ipcAsync(
			IPC_EVENTS.SCAN_FOR_IMAGES,
			props.match.params.siteID,
		).then(scannedImages => {
			dispatch({ type: SCAN_IMAGES_ACTIONS.SUCCESS, payload: scannedImages });
		}).catch(error => dispatch({ type: SCAN_IMAGES_ACTIONS.FAILURE, payload: error }));
	}

	useEffect(
		() => {
			scanForImages();
		}, []
	);

	// retrieve image data from site
	useEffect(
		() => {
			LocalRenderer.ipcAsync(
				IPC_EVENTS.GET_IMAGE_DATA,
				props.match.params.siteID,
			).then(result => {
				setImageData(result);
			});
		}, []
	);

	const handleScanForImages = () => {
		scanForImages();
	}

	switch (overviewSelected) {
		case false:
			return (
				<FileListView />
			);

		default:
			return (
				<Overview
					scanImageState={scanImageState}
					setOverviewSelected={setOverviewSelected}
					onScanForImages={handleScanForImages}
				/>
			);
	}

};
