import React from 'react';
import path from 'path';

// https://github.com/getflywheel/local-components
import {
		IVirtualTableCellRendererDataArgs,
	} from '@getflywheel/local-components';

export const colFileName = (
	dataArgs: IVirtualTableCellRendererDataArgs,
	) =>  {

	const convertFullPathToFileName = () => {
		return path.basename(dataArgs.cellData)
	}

	const fileName = dataArgs.isHeader ? dataArgs.cellData : convertFullPathToFileName();

		return(
			<div>
				{fileName}
			</div>
		);
};
