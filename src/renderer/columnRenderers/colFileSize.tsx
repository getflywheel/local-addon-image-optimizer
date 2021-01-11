import React from 'react';
import { IVirtualTableCellRendererDataArgs, Text } from '@getflywheel/local-components';
import { convertBytesToMb } from '../utils';

interface IFileSizeProps {
	dataArgs: IVirtualTableCellRendererDataArgs
	errorOverrideMessage?: string;
}

export const ColFileSize = (props: IFileSizeProps) => {
	const { dataArgs, errorOverrideMessage } = props;
	const { colKey, rowData } = dataArgs;

	if (dataArgs.isHeader) {
		return (
			<div>{dataArgs.cellData}</div>
		);
	}

	let content = null;

	const shouldDisplayErrorMessage = () => {
		return;
	};

	const errorCompressingImage = (
		colKey === 'compressedSize'
		&& rowData.errorOverrideMessage
		&& !rowData.compressedSize
	);

	if (errorCompressingImage || errorOverrideMessage) {
		content = (
			<Text
				privateOptions={{
					fontWeight: 'bold',
				}}
				className={'colFileSize_Error_Text'}
			>
				{errorOverrideMessage ? errorOverrideMessage : 'Error'}
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
