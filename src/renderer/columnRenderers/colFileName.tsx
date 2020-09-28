import React from 'react';
import path from 'path';
import { IVirtualTableCellRendererDataArgs } from '@getflywheel/local-components';

interface IFileNameProps {
	dataArgs: IVirtualTableCellRendererDataArgs
	isCurrentlyOptimizing: string;
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
				{props.isCurrentlyOptimizing === 'before' ? (getSelectedCount() + ' Images Selected') : 'File Name'} 
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
