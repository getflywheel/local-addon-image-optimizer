import React from 'react';

import {
		IVirtualTableCellRendererDataArgs
	} from '@getflywheel/local-components';
import { string } from 'prop-types';

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
				{dataArgs.isHeader ? dataArgs.cellData : Math.round(dataArgs.rowData.originalSize / 1000000) + ' MB'}
			</div>
		);
	} else if (dataArgs.colKey === 'compressedSize') {
		return (
			<div>
				{dataArgs.isHeader ? dataArgs.cellData : Math.round(dataArgs.rowData.compressedSize / 1000000) + ' MB'}
			</div>
		);
	} else {
		return null;
	}
};
