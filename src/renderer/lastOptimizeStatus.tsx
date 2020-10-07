import React from 'react';
import { getFormattedTimestamp } from './utils';
import {Button, Text, TableList, TableListRow, TextButton } from '@getflywheel/local-components';
import classnames from 'classnames';
import { ipcRenderer } from 'electron';
import { IPC_EVENTS } from '../constants';
import { formatCompressedPercentage, calculateToMb } from './utils';

interface IProps {
	handleScanForImages: () => void,
	combinedStateData: GenericObject,
}

// open preferences tab for addon
const openPreferences = () => {
	ipcRenderer.send(IPC_EVENTS.GO_TO_PREFERENCES);
}

const LastOptimizeStatus: React.FC<IProps> = (props: IProps) => {
	const {
		handleScanForImages,
		combinedStateData,
	} = props;

	const {
		originalTotalSize,
		compressedTotalSize,
		lastUpdated,
		imageCount,
		totalCompressedCount,
		compressedImagesOriginalSize,
	} = combinedStateData;

	return (
		<TableList className="lastOptimizeStatus_Table">
			<TableListRow className={classnames(
						"lastOptimizeStatus_Row",
						"lastOptimizeStatus_Header_Row",
					)}>
				<Text
				className="lastOptimizeStatus_Text"
				privateOptions={{
					fontWeight: "bold"
				}}
				> {'Last updated: '} {lastUpdated === 0 ? '--' : getFormattedTimestamp(lastUpdated)}</Text>
				<TextButton className="lastOptimizeStatus_Button" onClick={openPreferences}>
					Settings
				</TextButton>
				<Button
						className="lastOptimizeStatus_Rescan_Button"
						onClick={() => handleScanForImages()}
						privateOptions={{
							color: 'green',
							form: 'fill'
						}}
						disabled={props.combinedStateData.scanLoading}
					>
						{props.combinedStateData.scanLoading ? 'Scanning...' : 'Scan'}
					</Button>
			</TableListRow>
			<TableListRow className="lastOptimizeStatus_Row">
				<Text className="lastOptimizeStatus_Text">Total reductions</Text>
				<Text className="lastOptimizeStatus_Text">
					{
						originalTotalSize === 0
						? '0'
						: formatCompressedPercentage((compressedImagesOriginalSize - compressedTotalSize)/originalTotalSize)
					}%</Text>
			</TableListRow>
			<TableListRow className="lastOptimizeStatus_Row">
				<Text className="lastOptimizeStatus_Text">Total file size reductions</Text>
				<Text className="lastOptimizeStatus_Text">{calculateToMb(compressedImagesOriginalSize - compressedTotalSize)}{' '}MB</Text>
			</TableListRow>
			<TableListRow className="lastOptimizeStatus_Row">
				<Text className="lastOptimizeStatus_Text">Total images optimized</Text>
				<Text className="lastOptimizeStatus_Text">{totalCompressedCount}/{imageCount}</Text>
			</TableListRow>
		</TableList>
	);
}
export default LastOptimizeStatus;
