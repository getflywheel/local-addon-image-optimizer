import React from 'react';
import {
		Checkbox,
		IVirtualTableCellRendererDataArgs,
	} from '@getflywheel/local-components';

interface IFileStatusProps {
	dataArgs: IVirtualTableCellRendererDataArgs,
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void,
	toggleSelectAll: (isChecked: boolean) => void,
	toggleSelectAllValue: boolean,
	isCurrentlyOptimizing: boolean
}

export const ColFileStatus = (props: IFileStatusProps) =>  {

	const {
		dataArgs,
		handleCheckBoxChange,
		toggleSelectAll,
		toggleSelectAllValue,
		isCurrentlyOptimizing,
	} = props;

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
