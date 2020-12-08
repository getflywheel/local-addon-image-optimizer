import React from 'react';
import { getFormattedTimestamp } from './utils';
import { Button, Text, TableList, TableListRow } from '@getflywheel/local-components';
import classnames from 'classnames';
import { formatCompressedPercentage, convertBytesToMb } from './utils';
import { SiteData } from '../types';
import CheckmarkMedSVG from './_assets/svg/Checkmark-med.svg';
import WarningSVG from './_assets/svg/warning.svg';

interface IProps {
	siteData: SiteData,
	handleScanForImages: () => void,
	imageCount: number;
	totalCompressedCount: number;
	originalTotalSize: number;
	compressedImagesOriginalSize: number;
	compressedTotalSize: number;
	erroredTotalCount: number;
}

const LastOptimizeStatus: React.FC<IProps> = (props: IProps) => {
	const {
		imageCount,
		siteData,
		totalCompressedCount,
		originalTotalSize,
		compressedImagesOriginalSize,
		compressedTotalSize,
		erroredTotalCount,
	} = props;

	const { lastScan, scanInProgress } = siteData;

	const totalImageOptimized = `${totalCompressedCount}/${imageCount}`;
	const totalImageErrored = `${erroredTotalCount}/${imageCount}`;

	return (
		<div>
			<TableList className="lastOptimizeStatus_Table">
				<TableListRow
					className={classnames(
						"lastOptimizeStatus_Row",
						"lastOptimizeStatus_Header_Row",
					)}
				>
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
					<Text className="lastOptimizeStatus_TextAlignRight">
						{
							originalTotalSize === 0
								? '0'
								: formatCompressedPercentage((compressedImagesOriginalSize - compressedTotalSize) / originalTotalSize)
						}%</Text>
				</TableListRow>
				<TableListRow className="lastOptimizeStatus_Row">
					<Text className="lastOptimizeStatus_Text">Total file size reductions</Text>
					<Text className="lastOptimizeStatus_TextAlignRight">{convertBytesToMb(compressedImagesOriginalSize - compressedTotalSize)}{' '}MB</Text>
				</TableListRow>
				<TableListRow className="lastOptimizeStatus_Row">
					<CheckmarkMedSVG className="success-count-svg"/>
					<Text className="lastOptimizeStatus_TextWithIcon">Total images optimized</Text>
					<Text className="lastOptimizeStatus_TextAlignRight">{totalImageOptimized}</Text>
				</TableListRow>
				<TableListRow className="lastOptimizeStatus_Row">
					<WarningSVG className="error-count-svg"/>
					<Text className="lastOptimizeStatus_TextWithIcon">Total errors</Text>
					<Text className="lastOptimizeStatus_TextAlignRight">{totalImageErrored}</Text>
				</TableListRow>
			</TableList>
		</div>
	);
}

export default LastOptimizeStatus;
