import React, { useState, useEffect } from 'react';
import { Overview } from './overview';
import { FileListView } from './fileListView/fileListView';
import { IPC_EVENTS } from '../constants';
import { ipcRenderer } from 'electron';
import { OptimizerStatus, ImageData } from '../types';
import { store, actions, selectors, useStoreSelector } from './store/store';
import { reportAnalytics, ANALYTIC_EVENT_TYPES } from './analytics';

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

	console.log(siteImageData);

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

	// handles file selection for final optimization list
	const handleCheckBoxChange = (imageID: string) => (isChecked: boolean) => {
		store.dispatch(actions.setImageSelected({ siteID, imageID, isChecked }));
	};

	// select or deselect all files
	const toggleSelectAll = (isChecked) => {
		store.dispatch(actions.setAllImagesSelected({ siteID, isChecked }));
	};

	const compressSelectedImages = () => {
		const selectedImageIDs = selectors.selectedSiteImages().map((d) => d.originalImageHash);

		store.dispatch(actions.optimizationRequested({ siteID, selectedImageIDs }));

		ipcRenderer.send(
			IPC_EVENTS.COMPRESS_IMAGES,
			siteID,
			selectedImageIDs,
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
		reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_CANCEL);
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
			return (
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
