import React from 'react';
import { IVirtualTableCellRendererDataArgs, Text } from '@getflywheel/local-components';
import { FileStatus } from '../../types';
import { convertBytesToMb } from '../utils';

interface IFileSizeProps {
	dataArgs: IVirtualTableCellRendererDataArgs
}

export const ColFileSize = (props: IFileSizeProps) =>  {
	const { dataArgs } = props;
	const { colKey, rowData } = dataArgs;

	if (dataArgs.isHeader) {
		return (
			<div>{dataArgs.cellData}</div>
		);
	}

	let content = null;

	if (
		colKey === 'compressedSize'
		&& rowData.errorMessage
		&& !rowData.compressedSize
		// && rowData.fileStatus === FileStatus.FAILED
	) {
		content = (
			<Text
				privateOptions={{
					fontWeight: 'bold',
				}}
				className={'colFileSize_Error_Text'}
			>
				Error
			</Text>
		);
	} else {
		const bytes = rowData[colKey];
		/**
		 * colKey with be one of
		 *  - originalSize
		 * 	- compressedSize
		 */
		content = bytes
			? `${convertBytesToMb(rowData[colKey])} MB`
			: null;
	}

	return (
		<div>{content}</div>
	);
};
