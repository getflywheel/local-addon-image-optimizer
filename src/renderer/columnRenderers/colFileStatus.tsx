import React from 'react';
import {
		Checkbox,
		IVirtualTableCellRendererDataArgs,
		Spinner,
	} from '@getflywheel/local-components';
import { OptimizerStatus } from '../types';
import { FileStatus } from '../../types';

interface IFileStatusProps {
	dataArgs: IVirtualTableCellRendererDataArgs,
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void,
	toggleSelectAll: (isChecked: boolean) => void,
	toggleSelectAllValue: boolean,
	optimizationStatus: string
}

export const ColFileStatus = (props: IFileStatusProps) =>  {

	const {
		dataArgs,
		handleCheckBoxChange,
		toggleSelectAll,
		toggleSelectAllValue,
		optimizationStatus,
	} = props;

	const onChange = dataArgs.isHeader ? toggleSelectAll : handleCheckBoxChange(dataArgs.rowData.originalImageHash);

	if (optimizationStatus === OptimizerStatus.BEFORE) {
		return (
			<div>
				{/* TODO: Set the header checkbox to 'unchecked' if not all files are selected */}
				<Checkbox
					checked={ dataArgs.isHeader ? toggleSelectAllValue : dataArgs.rowData.isChecked }
					onChange={ onChange }
				/>
			</div>
		);
	}
		
	switch (dataArgs.rowData.fileStatus) {
		case FileStatus.STARTED:
			return (
				<Spinner />
			);

		case FileStatus.SUCCEEDED:
			return (
				<div>
					{/*TODO: Add success icon and remove wrapper div (unless needed for styling) */}
					Succeeded!
				</div>
			);

		case FileStatus.FAILED:
			return (
				<div>
					{/*TODO:  Add failure icon and remove wrapper div (unless needed for styling)*/}
					Failed!
				</div>
			);

		default:
			return (
				null
			);
	}
};
