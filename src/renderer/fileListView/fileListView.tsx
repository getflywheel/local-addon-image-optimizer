import React from 'react';
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
import { OptimizerStatus } from '../types';
import { ipcRenderer } from 'electron';
import { IPC_EVENTS } from '../../constants'

interface IFileListViewProps {
	imageData: ImageData[],
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void,
	toggleSelectAll: (isChecked: boolean) => void,
	toggleSelectAllValue: boolean,
	getCompressionList: () => void,
	optimizationStatus: OptimizerStatus,
	compressionListTotal: number,
	compressionListCompletionPercentage: number,
	setOverviewSelected: (x: boolean) => void,
	totalFileSizeDeductions: number,
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
						optimizationStatus={props.optimizationStatus}
					/>
				);
			case 'filePath':
				return (
					<ColFileName
						dataArgs={dataArgs}
						optimizationStatus={props.optimizationStatus}
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

	const getAllChecked = () => {
		return props.imageData.filter(
			data => data.isChecked
		);
	}

	const openPreferencesModal = () => {
		FlyModal.onRequestClose();
		ipcRenderer.send(IPC_EVENTS.GO_TO_PREFERENCES);
	}

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
							openPreferences={openPreferencesModal}
						/>
					</FlyModal>
			), document.getElementById('popup-container'),
		);
	});

	return(
		<div className='fileView_Container'>
			<FileListHeader
				optimizationStatus={props.optimizationStatus}
				setOverviewSelected={props.setOverviewSelected}
				invokeModal={invokeModal}
				getAllChecked={getAllChecked}
				totalFileSizeDeductions={props.totalFileSizeDeductions}
			/>
				<ProgressBar progress={props.compressionListCompletionPercentage} />
			<div>
			<VirtualTable
				cellRenderer={cellRender}
				data={props.optimizationStatus === OptimizerStatus.BEFORE ? props.imageData : getAllChecked()}
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
