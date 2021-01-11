import React from 'react';
import { IVirtualTableCellRendererDataArgs } from '@getflywheel/local-components';

interface IFileNameProps {
	dataArgs: IVirtualTableCellRendererDataArgs
	headerText: string | null;
}

export const ColFileName = (props: IFileNameProps) => {
	const { dataArgs, headerText } = props;
	const { rowData } = dataArgs;

	const formattedFilePath = dataArgs.cellData.replace(/^.*\/app\/public\/wp-content/g, 'wp-content');

	if (dataArgs.isHeader) {
		return (
			<div className='fileList_File_Name_Header'>
				{headerText}
			</div>
		);
	}
	return (
		<div
			className='fileList_File_Name_Row'
			title={formattedFilePath}
			data-imageid={rowData.originalImageHash}
		>
			{formattedFilePath}
		</div>
	);

};
