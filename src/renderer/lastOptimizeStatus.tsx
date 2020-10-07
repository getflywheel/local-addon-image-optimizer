import React from 'react';
import { getFormattedTimestamp } from './utils';
import {Button, Text, TableList, TableListRow, TextButton } from '@getflywheel/local-components';
import classnames from 'classnames';
import { ipcRenderer } from 'electron';
import { IPC_EVENTS } from '../constants';
import { formatCompressedPercentage, calculateToMb } from './utils';

interface IProps {
	lastUpdated: number,
	totalImageOptimized: string,
	handleScanForImages: () => void,
	scanImageState: GenericObject,
	originalTotalSize: number,
	compressedImagesOriginalSize: number,
	compressedImagesNewSize: number,
}

// open preferences tab for addon
const openPreferences = () => {
	ipcRenderer.send(IPC_EVENTS.GO_TO_PREFERENCES);
}

const LastOptimizeStatus: React.FC<IProps> = (props: IProps) => (
	<TableList className="lastOptimizeStatus_Table">
		<TableListRow className={classnames(
					"lastOptimizeStatus_Row",
					"lastOptimizeStatus_Header_Row",
				)}>
			 {props.lastUpdated !== 0
			 ? <Text
					className="lastOptimizeStatus_Text"
					privateOptions={{
						fontWeight: "bold"
					}}
				>
					{'Last updated: '}{getFormattedTimestamp(props.lastUpdated)}
				</Text>
			 : null}
			<TextButton className="lastOptimizeStatus_Button" onClick={openPreferences}>
				Settings
			</TextButton>
			<Button
					className="lastOptimizeStatus_Rescan_Button"
                    onClick={() => props.handleScanForImages()}
                    privateOptions={{
                        color: 'green',
                        form: 'fill'
					}}
					disabled={props.scanImageState.scanLoading}
                >
                    {props.scanImageState.scanLoading ? 'Scanning...' : 'Scan'}
                </Button>
		</TableListRow>
		<TableListRow className="lastOptimizeStatus_Row">
			<Text className="lastOptimizeStatus_Text">Total reductions</Text>
			<Text className="lastOptimizeStatus_Text">
				{
					props.originalTotalSize === 0
					? '0'
					: formatCompressedPercentage((props.compressedImagesOriginalSize - props.compressedImagesNewSize)/props.originalTotalSize)
				}%</Text>
		</TableListRow>
		<TableListRow className="lastOptimizeStatus_Row">
			<Text className="lastOptimizeStatus_Text">Total file size reductions</Text>
			<Text className="lastOptimizeStatus_Text">{calculateToMb(props.compressedImagesOriginalSize - props.compressedImagesNewSize)}{' '}MB</Text>
		</TableListRow>
		<TableListRow className="lastOptimizeStatus_Row">
			<Text className="lastOptimizeStatus_Text">Total images optimized</Text>
			<Text className="lastOptimizeStatus_Text">{props.totalImageOptimized}</Text>
		</TableListRow>
	</TableList>
);

export default LastOptimizeStatus;
