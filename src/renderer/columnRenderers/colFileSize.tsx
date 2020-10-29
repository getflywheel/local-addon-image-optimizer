import React from 'react';
import { IVirtualTableCellRendererDataArgs, Text } from '@getflywheel/local-components';
interface IFileSizeProps {
	dataArgs: IVirtualTableCellRendererDataArgs
}

export const ColFileSize = (props: IFileSizeProps) =>  {
	const { dataArgs } = props;
	const { colKey, rowData } = dataArgs;

	let content = null;

	if (typeof dataArgs.cellData === 'string') {
		content = dataArgs.cellData;
	} else if (dataArgs.colKey === 'originalSize') {
		content = dataArgs.isHeader
			? dataArgs.cellData
			: (dataArgs.rowData.originalSize / (1024*1024)).toFixed(2) + ' MB';
	} else if (colKey === 'compressedSize') {
		content = dataArgs.isHeader
			? dataArgs.cellData
			: (dataArgs.rowData.compressedSize / (1024*1024)).toFixed(2) + ' MB';

		if (rowData.errorMessage && !rowData.compressedSize) {
			content = rowData.errorMessage;
		}
	}

	return (
		<div>{content}</div>
	);
};
