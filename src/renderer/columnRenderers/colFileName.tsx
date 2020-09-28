import React from 'react';
import path from 'path';
import { IVirtualTableCellRendererDataArgs } from '@getflywheel/local-components';
import { OptimizerStatus } from '../types';

interface IFileNameProps {
	dataArgs: IVirtualTableCellRendererDataArgs
	optimizationStatus: string;
}

export const ColFileName = ( props: IFileNameProps ) =>  {
	const { dataArgs } = props;

	const getSelectedCount = () => {
		return dataArgs.data.filter(
			data => data.isChecked
		).length;
	}

 	const getFileName = () => {
		return path.basename(dataArgs.cellData)
	}

	if (dataArgs.isHeader) {
		return(
			<div>
				{props.optimizationStatus === OptimizerStatus.BEFORE ? (getSelectedCount() + ' Images Selected') : 'File Name'} 
			</div>
		);
	} else {
		return(
			<div>
				{getFileName()}
			</div>
		);
	}
};
