import React from 'react';
import { IVirtualTableCellRendererDataArgs, Text } from '@getflywheel/local-components';
import { FileStatus, OptimizerStatus } from '../../types';
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
	}
	else if (colKey === 'originalSize') {
		content = dataArgs.isHeader
			? dataArgs.cellData
			: (rowData.originalSize / (1024*1024)).toFixed(2) + ' MB';
	} else if (colKey === 'compressedSize') {

		content = dataArgs.isHeader
			? dataArgs.cellData
			: (rowData.compressedSize / (1024*1024)).toFixed(2) + ' MB';

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
