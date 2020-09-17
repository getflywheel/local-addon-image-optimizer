import React, { Component, useEffect } from 'react';
import { Overview } from './overview';
import { FileListView } from './fileListView';
import { ipcRenderer } from 'electron';
import { IPC_EVENTS } from '../constants';


// https://getflywheel.github.io/local-addon-api/modules/_local_renderer_.html
import * as LocalRenderer from '@getflywheel/local/renderer';

// https://github.com/getflywheel/local-components
import { Button, FlyModal, Title, Text } from '@getflywheel/local-components';

export const ImageOptimizer = (props) =>  {
	const [overviewSelected, setOverviewSelected] = React.useState(true);

	const [imageData, setImageData] = React.useState({});

	React.useEffect(
		() => {
			LocalRenderer.ipcAsync(
				IPC_EVENTS.SCAN_FOR_IMAGES,
				props.match.params.siteID,
			)
		}
	);

	React.useEffect(
		() => {
			LocalRenderer.ipcAsync(
				IPC_EVENTS.GET_IMAGE_DATA,
				props.match.params.siteID,
			).then(result => {
				setImageData(result);
			});
		}
	);

	console.log( {imageData} );

	switch(overviewSelected) {
		case false:
			return(
				<FileListView />
			);

		default:
			return(
				<Overview
					setOverviewSelected = {setOverviewSelected}
				/>
			);
	}

};
