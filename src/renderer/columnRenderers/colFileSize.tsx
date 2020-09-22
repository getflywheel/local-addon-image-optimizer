import React from 'react';
import {
		IVirtualTableCellRendererDataArgs
	} from '@getflywheel/local-components';

export const colFileSize = (
	dataArgs: IVirtualTableCellRendererDataArgs,
	) =>  {

	if (!dataArgs.cellData || typeof dataArgs.cellData === 'string') {
		return (
			<div>
				{dataArgs.cellData}
			</div>
		);
	} else if (dataArgs.colKey === 'originalSize') {
		return (
			<div>
				{dataArgs.isHeader ? dataArgs.cellData : (dataArgs.rowData.originalSize / (1024*1024)).toFixed(2) + ' MB'}
			</div>
		);
	} else if (dataArgs.colKey === 'compressedSize') {
		return (
			<div>
				{dataArgs.isHeader ? dataArgs.cellData : (dataArgs.rowData.originalSize / (1024*1024)).toFixed(2) + ' MB'}
			</div>
		);
	} else {
		return null;
	}
};
