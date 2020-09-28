import React from 'react';
import {
		Checkbox,
		IVirtualTableCellRendererDataArgs,
		Spinner,
	} from '@getflywheel/local-components';

interface IFileStatusProps {
	dataArgs: IVirtualTableCellRendererDataArgs,
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void,
	toggleSelectAll: (isChecked: boolean) => void,
	toggleSelectAllValue: boolean,
	isCurrentlyOptimizing: string
}

export const ColFileStatus = (props: IFileStatusProps) =>  {

	const {
		dataArgs,
		handleCheckBoxChange,
		toggleSelectAll,
		toggleSelectAllValue,
		isCurrentlyOptimizing,
	} = props;

	const onChange = dataArgs.isHeader ? toggleSelectAll : handleCheckBoxChange(dataArgs.rowData.originalImageHash);

	if(isCurrentlyOptimizing === 'before') {
		return(
			<div>
				{/* TODO: Set the header checkbox to 'unchecked' if not all files are selected */}
				<Checkbox
					checked={ dataArgs.isHeader ? toggleSelectAllValue : dataArgs.rowData.isChecked }
					onChange={ onChange }
				/>
			</div>
		);
	} else {
		switch (dataArgs.rowData.fileStatus) {
			case 'started':
				return(
					<div>
						<Spinner />
					</div>
				);

			case 'succeeded':
				return(
					<div>
						{/*TODO: Add success icon */}
						Succeeded!
					</div>
				);

			case 'failed':
				return(
					<div>
						{/*TODO:  Add failure icon */}
						Failed!
					</div>
				);

			default:
				return (
					null
				);
		}
	}
};
