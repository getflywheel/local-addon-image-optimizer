import React from 'react';
import { getFormattedTimestamp } from './utils';
import { Button, Text, TableList, TableListRow } from '@getflywheel/local-components';
import classnames from 'classnames';
import { formatCompressedPercentage, convertBytesToMb } from './utils';
import { SiteImageData } from '../types';

interface IProps {
	siteImageData: SiteImageData,
	handleScanForImages: () => void,
	imageCount: number;
	totalCompressedCount: number;
	originalTotalSize: number;
	compressedImagesOriginalSize: number;
	compressedTotalSize: number;
}

const LastOptimizeStatus: React.FC<IProps> = (props: IProps) => {
	const {
		imageCount,
		siteImageData,
		totalCompressedCount,
		originalTotalSize,
		compressedImagesOriginalSize,
		compressedTotalSize,
	} = props;

	const { lastScan, scanInProgress } = siteImageData;

	const totalImageOptimized = `${totalCompressedCount}/${imageCount}`;

	return (
		<TableList className="lastOptimizeStatus_Table">
			<TableListRow className={classnames(
						"lastOptimizeStatus_Row",
						"lastOptimizeStatus_Header_Row",
					)}>
				{lastScan
					? <Text
							className="lastOptimizeStatus_Text"
							privateOptions={{
								fontWeight: "bold"
							}}
						>
							Last updated:{' '}{getFormattedTimestamp(lastScan)}
						</Text>
					: null
				}
				<Button
						className="lastOptimizeStatus_Rescan_Button"
						onClick={() => props.handleScanForImages()}
						privateOptions={{
							color: 'green',
							form: 'fill'
						}}
						style={{
							marginLeft: 'auto'
						}}
						disabled={scanInProgress}
					>
						{scanInProgress ? 'Scanning...' : 'Scan for Images'}
					</Button>
			</TableListRow>
			<TableListRow className="lastOptimizeStatus_Row">
				<Text className="lastOptimizeStatus_Text">Total reductions</Text>
				<Text className="lastOptimizeStatus_Text">
					{
						originalTotalSize === 0
							? '0'
							: formatCompressedPercentage((compressedImagesOriginalSize - compressedTotalSize) / originalTotalSize)
					}%</Text>
			</TableListRow>
			<TableListRow className="lastOptimizeStatus_Row">
				<Text className="lastOptimizeStatus_Text">Total file size reductions</Text>
				<Text className="lastOptimizeStatus_Text">{convertBytesToMb(compressedImagesOriginalSize - compressedTotalSize)}{' '}MB</Text>
			</TableListRow>
			<TableListRow className="lastOptimizeStatus_Row">
				<Text className="lastOptimizeStatus_Text">Total images optimized</Text>
				<Text className="lastOptimizeStatus_Text">{totalImageOptimized}</Text>
			</TableListRow>
		</TableList>
	);
}

export default LastOptimizeStatus;
