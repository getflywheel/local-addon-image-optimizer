import React from 'react';
import { IVirtualTableCellRendererDataArgs, Text } from '@getflywheel/local-components';
import { FileStatus, OptimizerStatus } from '../../types';
import { convertBytesToMb } from '../utils';

interface IFileSizeProps {
	dataArgs: IVirtualTableCellRendererDataArgs
	optimizerStatus: OptimizerStatus
}

export const ColFileSize = (props: IFileSizeProps) =>  {
	const { dataArgs, optimizerStatus } = props;
	const { colKey, rowData } = dataArgs;

	let content = null;

	if (optimizerStatus === OptimizerStatus.BEFORE && colKey === 'compressedSize') {
		content = dataArgs.cellData;
	} else if (colKey === 'originalSize') {
		content = dataArgs.isHeader
			? dataArgs.cellData
			: `${convertBytesToMb(rowData.originalSize)} MB`;
	} else if (colKey === 'compressedSize') {
		content = dataArgs.isHeader
			? dataArgs.cellData
			: `${convertBytesToMb(rowData.originalSize)} MB`;

		if (rowData.errorMessage && !rowData.compressedSize && rowData.fileStatus === FileStatus.FAILED) {
			content = (
				<Text
					privateOptions={{
						fontWeight: 'bold',
					}}
					className={'colFileSize_Error_Text'}
				>
					Error
				</Text>
			);
		} else if (!dataArgs.cellData) {
			content = dataArgs.cellData;
		}
	}

	return (
		<div>{content}</div>
	);
};
