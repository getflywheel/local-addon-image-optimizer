import React from 'react';
import {
		Checkbox,
		IVirtualTableCellRendererDataArgs,
		Spinner,
	} from '@getflywheel/local-components';
import { OptimizerStatus } from '../../types';
import { FileStatus } from '../../types';
import WarningSVG from '../_assets/svg/warning.svg';
import CheckmarkSmallSVG from '../_assets/svg/checkmark--sm.svg';


interface IFileStatusProps {
	dataArgs: IVirtualTableCellRendererDataArgs,
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void,
	toggleSelectAll: (isChecked: boolean) => void,
	areAllFilesSelected: boolean,
	optimizationStatus: OptimizerStatus,
}

export const ColFileStatus = (props: IFileStatusProps) =>  {
	const {
		dataArgs,
		handleCheckBoxChange,
		toggleSelectAll,
		areAllFilesSelected,
		optimizationStatus,
	} = props;

	const onChange = dataArgs.isHeader ? toggleSelectAll : handleCheckBoxChange(dataArgs.rowData.originalImageHash);

	if (optimizationStatus === OptimizerStatus.BEFORE) {
		return (
			<div>
				<Checkbox
					checked={dataArgs.isHeader ? areAllFilesSelected : dataArgs.rowData.isChecked}
					onChange={onChange}
				/>
			</div>
		);
	}

	switch (dataArgs.rowData.fileStatus) {
		case FileStatus.STARTED:
			return (
				<Spinner className='spinner-svg' />
			);

		case FileStatus.SUCCEEDED:
			return (
				<CheckmarkSmallSVG />
			);

		case FileStatus.FAILED:
			return (
				<div className='warning-svg'>
					<WarningSVG />
				</div>
			);

		default:
			return (
				null
			);
	}
};
