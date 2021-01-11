import React, { useEffect } from 'react';
import { Overview } from './overview';
import { FileListView } from './fileListView/fileListView';
import { IPC_EVENTS } from '../constants';
import { ipcRenderer } from 'electron';
import { store, actions, selectors, useStoreSelector } from './store/store';
import { reportAnalytics, ANALYTIC_EVENT_TYPES } from './analytics';

interface IProps {
	match: { params: { siteID: string; } };
}


const ImageOptimizer = (props: IProps) => {
	const { match } = props;
	const { siteID } = match.params;

	const [activeSiteID, preferences, siteData] = useStoreSelector((state) => ([
		state.activeSiteID,
		state.preferences,
		state.sites[siteID],
	]));

	const scanForImages = () => {
		store.dispatch(actions.scanRequest(siteID));

		ipcRenderer.send(
			IPC_EVENTS.SCAN_FOR_IMAGES,
			siteID,
		);
	};

	useEffect(
		() => {
			store.dispatch(actions.setActiveSiteID(siteID));
		},
		[siteID],
	);

	const setOverviewSelected = (isOverviewSelected: boolean) => {
		store.dispatch(actions.isOverviewSelected({ siteID, isOverviewSelected }));
	};

	// handles file selection for final optimization list
	const handleCheckBoxChange = (imageID: string) => (isChecked: boolean) => {
		store.dispatch(actions.setImageSelected({ siteID, imageID, isChecked }));
	};

	// select or deselect all files
	const toggleSelectAll = (isChecked: boolean) => {
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
	};

	const resetToOverview = () => {
		setOverviewSelected(true);

		store.dispatch(actions.optimizationStatusBefore({ siteID }));
	};

	const cancelImageCompression = () => {
		ipcRenderer.send(
			IPC_EVENTS.CANCEL_COMPRESSION,
			siteID,
		);
		reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_CANCEL);
	};

	if (!activeSiteID) {
		return null;
	}

	if (!siteData) {
		store.dispatch(actions.addSite({ siteID }));

		return null;
	}

	const { isOverviewSelected } = siteData;

	switch (isOverviewSelected) {
		case false:
			return (
				<FileListView
					siteData={siteData}
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
					siteData={siteData}
					setOverviewSelected={setOverviewSelected}
					handleScanForImages={scanForImages}
					siteID={siteID}
				/>
			);
	}

};

export default ImageOptimizer;
