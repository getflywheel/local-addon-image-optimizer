import React, { useState, useEffect, useReducer } from 'react';
import { Overview } from './overview';
import { FileListView } from './fileListView';
import { IPC_EVENTS } from '../constants';
import { SiteImageData } from '../types';

import { scanImageReducer, initialState, SCAN_IMAGES_ACTIONS } from '../scanImageReducer';

// https://getflywheel.github.io/local-addon-api/modules/_local_renderer_.html
import * as LocalRenderer from '@getflywheel/local/renderer';

export const ImageOptimizer = (props) => {
	const [scanImageState, dispatch] = useReducer(scanImageReducer, initialState);
	const [overviewSelected, setOverviewSelected] = useState(true);

	const [imageData, setImageData] = useState({});

	const scanForImages = async () => {
		try {
			dispatch({ type: SCAN_IMAGES_ACTIONS.REQUEST });
			const scannedImages = await LocalRenderer.ipcAsync(IPC_EVENTS.SCAN_FOR_IMAGES, props.match.params.siteID);
			dispatch({ type: SCAN_IMAGES_ACTIONS.SUCCESS, payload: scannedImages });
		} catch (error) {
			dispatch({ type: SCAN_IMAGES_ACTIONS.FAILURE, payload: error });
		}
	}
	const [siteImageData, setImageData] = React.useState({} as SiteImageData);

	const [toggleSelectAllValue, setToggleAll] = React.useState(true);

	const [isCurrentlyOptimizing, setOptimizeStart] = React.useState(false);


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
			).then((result: SiteImageData) => {
				setImageData({
					...result,
					imageData:
						Object.entries(result.imageData).reduce((acc, [id, data]) => {
							return {
								...acc,
								[id]: {
									...data,
									isChecked: true,
								},
							};
						}, {})
				});
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
					handleScanForImages={scanForImages}
				/>
			);
	}

};
