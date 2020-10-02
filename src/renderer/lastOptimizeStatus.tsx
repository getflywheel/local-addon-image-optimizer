import React from 'react';
import { getFormattedTimestamp } from './utils';
import {Button, Text, TableList, TableListRow, TextButton } from '@getflywheel/local-components';
import classnames from 'classnames';

interface IProps {
	lastUpdated: number,
	totalDeductions: string,
	totalFileSizeDeductions: string,
	totalImageOptimized: string,
	handleScanForImages: () => void,
	scanImageState: GenericObject,
}

const LastOptimizeStatus: React.FC<IProps> = (props: IProps) => (
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
			> {'Last updated '} {props.lastUpdated}</Text>
			<TextButton className="lastOptimizeStatus_Button">
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
                    Rescan
                </Button>
		</TableListRow>
		<TableListRow className="lastOptimizeStatus_Row">
			<Text className="lastOptimizeStatus_Text">Total reductions</Text>
			<Text className="lastOptimizeStatus_Text">{props.totalDeductions}%</Text>
		</TableListRow>
		<TableListRow className="lastOptimizeStatus_Row">
			<Text className="lastOptimizeStatus_Text">Total file size reductions</Text>
			<Text className="lastOptimizeStatus_Text">{props.totalFileSizeDeductions}{' '}MB</Text>
		</TableListRow>
		<TableListRow className="lastOptimizeStatus_Row">
			<Text className="lastOptimizeStatus_Text">Total images optimized</Text>
			<Text className="lastOptimizeStatus_Text">{props.totalImageOptimized}</Text>
		</TableListRow>
	</TableList>
);

export default LastOptimizeStatus;
