import React, {SetStateAction, useState} from 'react';
import { ColFileStatus } from './columnRenderers/ColFileStatus';
import { ColFileName } from './columnRenderers/ColFileName';
import { ColFileSize } from './columnRenderers/ColFileSize'
import { Button,
		VirtualTable,
		VirtualTableCellRenderer,
		IVirtualTableCellRendererDataArgs,
		ProgressBar,
		TextButton,
	} from '@getflywheel/local-components';
import { ImageData } from '../types';

interface IFileListViewProps {
	imageData: ImageData[],
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void,
	toggleSelectAll: (isChecked: boolean) => void,
	toggleSelectAllValue: boolean,
	getCompressionList: () => void,
	isCurrentlyOptimizing: boolean,
	compressionListCompletionPercentage: number,
	setOverviewSelected: (x: boolean) => void,
}

export const FileListView = (props: IFileListViewProps) =>  {
	const cellRender: VirtualTableCellRenderer = (dataArgs: IVirtualTableCellRendererDataArgs) => {
		switch (dataArgs.colKey) {
			case 'fileStatus':
				return (
					<ColFileStatus
						dataArgs={dataArgs}
						handleCheckBoxChange={props.handleCheckBoxChange}
						toggleSelectAll={props.toggleSelectAll}
						toggleSelectAllValue={props.toggleSelectAllValue}
						isCurrentlyOptimizing={props.isCurrentlyOptimizing}
					/>
				);
			case 'filePath':
				return (
					<ColFileName
						dataArgs={dataArgs}
					/>
				);
			case 'originalSize':
				return (
					<ColFileSize
						dataArgs={dataArgs}
					/>
				);
			case 'compressedSize':
				return (
					<ColFileSize
						dataArgs={dataArgs}
					/>
				);
			default: return null;
		}
	};

	return(
		<div className='fileView_Container'>
			<div className='fileView_Header'>

				<TextButton
					onClick={() => props.setOverviewSelected(true)}
				>
					Back To Overview
				</TextButton>

				<Button
					className='fileView_Start_Optimization'
					onClick={props.getCompressionList}
					privateOptions={{
						color: 'green',
						form: 'fill'
					}}
				>
					Optimize Images
				</Button>
			</div>
				<ProgressBar progress={props.compressionListCompletionPercentage} />
			<div>
			<VirtualTable
				cellRenderer={cellRender}
				data={(props.imageData)}
				headers={[
					{ key: 'fileStatus', value: '', className: 'fileListViewer_Column_Selected'},
					{ key: 'filePath', value: 'Filename', className: 'fileListViewer_Column_File_Name'},
					{ key: 'originalSize', value: 'Original Size', className: 'fileListViewer_Column_Original_Size'},
					{ key: 'compressedSize', value: 'Compressed Size', className: 'fileListViewer_Column_Compressed_Size'}
				]}
				headersCapitalize='none'
				striped
				rowHeightSize="s"
				rowHeaderHeightSize="m"
			/>
			</div>
		</div>
	);
};
