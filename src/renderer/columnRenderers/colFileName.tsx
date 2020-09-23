import React from 'react';
import path from 'path';
import { IVirtualTableCellRendererDataArgs } from '@getflywheel/local-components';

interface IFileNameProps {
	dataArgs: IVirtualTableCellRendererDataArgs
}

export const ColFileName = ( props: IFileNameProps ) =>  {
	const { dataArgs } = props;

 	const getFileName = () => {
		return path.basename(dataArgs.cellData)
	}

	const fileName = dataArgs.isHeader ? dataArgs.cellData : getFileName();

		return(
			<div>
				{fileName}
			</div>
		);
};
