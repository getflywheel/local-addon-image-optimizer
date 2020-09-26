import React from 'react';
import path from 'path';
import { IVirtualTableCellRendererDataArgs } from '@getflywheel/local-components';

interface IFileNameProps {
	dataArgs: IVirtualTableCellRendererDataArgs
	compressionListTotal: number
}

export const ColFileName = ( props: IFileNameProps ) =>  {
	const { dataArgs, compressionListTotal } = props;

 	const getFileName = () => {
		return path.basename(dataArgs.cellData)
	}

	if (dataArgs.isHeader) {
		return(
			<div>
				{compressionListTotal + ' Images Selected'} 
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
