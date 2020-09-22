import React from 'react';
import {
		Checkbox,
		IVirtualTableCellRendererDataArgs,
	} from '@getflywheel/local-components';

export const colFileStatus = (
	dataArgs: IVirtualTableCellRendererDataArgs,
	handleCheckBoxChange,
	toggleSelectAll,
	toggleSelectAllValue,
	isCurrentlyOptimizing,
	) =>  {

	const checked = dataArgs.isHeader ? toggleSelectAllValue : dataArgs.rowData.isChecked;
	const onChange = dataArgs.isHeader ? toggleSelectAll : handleCheckBoxChange(dataArgs.rowData.originalImageHash);

	if(!isCurrentlyOptimizing) {
		return(
			<div>
				<Checkbox
					checked={ checked }
					onChange={ onChange }
				/>
			</div>
		);
	} else {
		return(
			<div>
				{ dataArgs.rowData.fileStatus }
			</div>
		);
	}
};
