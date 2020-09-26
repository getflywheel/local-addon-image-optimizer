import React, {SetStateAction, useState} from 'react';
import { ColFileStatus } from '../columnRenderers/ColFileStatus';
import { ColFileName } from '../columnRenderers/ColFileName';
import { ColFileSize } from '../columnRenderers/ColFileSize'
import {
		VirtualTable,
		VirtualTableCellRenderer,
		IVirtualTableCellRendererDataArgs,
		ProgressBar,
		FlyModal
	} from '@getflywheel/local-components';
import { ImageData } from '../../types';
import ReactDOM from 'react-dom';
import { FileListModal } from './fileListModal'
import { FileListHeader } from './fileListHeader'

interface IFileListViewProps {
	imageData: ImageData[],
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void,
	toggleSelectAll: (isChecked: boolean) => void,
	toggleSelectAllValue: boolean,
	getCompressionList: () => void,
	isCurrentlyOptimizing: string,
	compressionListTotal: number,
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
						compressionListTotal={props.compressionListTotal}
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

	const invokeModal = async () : Promise<{submitted: boolean}> => new Promise((resolve) => {

		const onSubmit = () => {
			props.getCompressionList();

			resolve({ submitted: true });

			FlyModal.onRequestClose();
		};

		ReactDOM.render (
			(
					<FlyModal
						contentLabel='Confirm Optimization'
						onRequestClose={() => resolve({ submitted: false })}
					>
						<FileListModal
							onSubmit={onSubmit}
						/>
					</FlyModal>
			), document.getElementById('popup-container'),
		);
	});

	return(
		<div className='fileView_Container'>
			<FileListHeader
				isCurrentlyOptimizing={props.isCurrentlyOptimizing}
				setOverviewSelected={props.setOverviewSelected}
				invokeModal={invokeModal}
			/>
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
