import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { ipcRenderer } from 'electron';
import { ColFileStatus } from '../columnRenderers/ColFileStatus';
import { ColFileName } from '../columnRenderers/ColFileName';
import { ColFileSize } from '../columnRenderers/ColFileSize';
import {
		VirtualTable,
		VirtualTableCellRenderer,
		IVirtualTableCellRendererDataArgs,
		ProgressBar,
		FlyModal
	} from '@getflywheel/local-components';
import { FileListHeader } from './fileListHeader';
import { OptimizerStatus, SiteImageData, Preferences } from '../../types';
import { IPC_EVENTS } from '../../constants';
import { useStoreSelector } from '../store';

interface IFileListViewProps {
	siteImageData: SiteImageData,
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void,
	toggleSelectAll: (isChecked: boolean) => void,
	getCompressionList: () => void,
	resetToOverview: () => void,
	onCancel: () => void,
	setOverviewSelected: (x: boolean) => void,
}

interface IModalProps {
	onSubmit: () => void;
	openPreferencesModal: () => void;
	onConfirm: () => void;
	onCancel: () => void;
	preferences: Preferences;
}

export const FileListView = (props: IFileListViewProps) => {
	const {
		siteImageData,
		handleCheckBoxChange,
		toggleSelectAll,
		getCompressionList,
		resetToOverview,
		onCancel,
		setOverviewSelected,
	} = props;

	const preferences = useStoreSelector((state) => state.preferences);

	const imageData = Object.values(siteImageData.imageData);

	const cellRender: VirtualTableCellRenderer = (dataArgs: IVirtualTableCellRendererDataArgs) => {
		switch (dataArgs.colKey) {
			case 'fileStatus':
				return (
					<ColFileStatus
						dataArgs={dataArgs}
						handleCheckBoxChange={handleCheckBoxChange}
						toggleSelectAll={toggleSelectAll}
						toggleSelectAllValue={siteImageData.selectAllFilesValue}
						optimizationStatus={siteImageData.optimizationStatus}
					/>
				);
			case 'filePath':
				return (
					<ColFileName
						dataArgs={dataArgs}
						optimizationStatus={siteImageData.optimizationStatus}
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
		return imageData.filter(
			data => data.isChecked
		);
	}

	const openPreferencesModal = () => {
		FlyModal.onRequestClose();
		ipcRenderer.send(IPC_EVENTS.GO_TO_PREFERENCES);
	}

	const invokeModal = (ModalContents: React.FC<IModalProps>, onCancel?: Function, onConfirm?: Function) =>  {

		const onSubmit = () => {
			getCompressionList();
			FlyModal.onRequestClose();
		};

		const onCancelSelect = () => {
			onCancel?.();
			FlyModal.onRequestClose();
		}

		const onConfirmSelect = () => {
			onConfirm?.();
			FlyModal.onRequestClose();
		}

		ReactDOM.render (
			(
					<FlyModal
						contentLabel='Confirm Optimization'
					>
						<ModalContents
							onSubmit={onSubmit}
							openPreferencesModal={openPreferencesModal}
							onConfirm={onConfirmSelect}
							onCancel={onCancelSelect}
							preferences={preferences}
						/>
					</FlyModal>
			), document.getElementById('popup-container'),
		);
	};

	return(
		<div className='fileView_Container'>
			<FileListHeader
				siteImageData={siteImageData}
				resetToOverview={resetToOverview}
				invokeModal={invokeModal}
				getAllChecked={getAllChecked}
				onCancel={onCancel}
				setOverviewSelected={setOverviewSelected}
			/>
				<ProgressBar progress={siteImageData.compressionListCompletionPercentage} />
			<div className='fileListViewer_File_List'>
				<VirtualTable
					rowClassName='fileList_Virtual_Table_Row'
					cellRenderer={cellRender}
					data={siteImageData.optimizationStatus === OptimizerStatus.BEFORE ? imageData : getAllChecked()}
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
