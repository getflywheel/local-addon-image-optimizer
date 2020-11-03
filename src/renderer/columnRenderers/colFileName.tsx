import React from 'react';
import { IVirtualTableCellRendererDataArgs } from '@getflywheel/local-components';
import { OptimizerStatus } from '../../types';

interface IFileNameProps {
	dataArgs: IVirtualTableCellRendererDataArgs
	optimizationStatus: OptimizerStatus;
}

export const ColFileName = ( props: IFileNameProps ) =>  {
	const { dataArgs } = props;

	const formattedFilePath = dataArgs.cellData.replace(/^.*\/app\/public\/wp-content/g, 'wp-content');

	const getSelectedCount = () => {
		return dataArgs.data.filter(
			data => data.isChecked
		).length;
	}

	if (dataArgs.isHeader) {
		return(
			<div className='fileList_File_Name_Header'>
				{props.optimizationStatus === OptimizerStatus.BEFORE ? (getSelectedCount() + ' Images Selected') : 'File Name'}
			</div>
		);
	} else {
		return (
			<div
				className='fileList_File_Name_Row'
				title={formattedFilePath}
			>
				{formattedFilePath}
			</div>
		)
	}
};
