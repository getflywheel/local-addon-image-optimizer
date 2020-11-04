import React from 'react';
import ReactDOM from 'react-dom';
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
import { selectors, useStoreSelector } from '../store/store';
import useContextMenu from '../contextMenu';

interface IFileListViewProps {
	siteImageData: SiteImageData;
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void;
	toggleSelectAll: (isChecked: boolean) => void;
	compressSelectedImages: () => void;
	resetToOverview: () => void;
	cancelImageCompression: () => void;
	setOverviewSelected: (x: boolean) => void;
	preferences: Preferences;
	siteID: string;
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
		compressSelectedImages,
		resetToOverview,
		cancelImageCompression,
		setOverviewSelected,
		preferences,
		siteID,
	} = props;
	useContextMenu();

	const uncompressedImages = useStoreSelector(selectors.uncompressedSiteImages);
	const selectedImages = useStoreSelector(selectors.selectedSiteImages);

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
						optimizerStatus={siteImageData.optimizationStatus}
					/>
				);
			case 'compressedSize':
				return (
					<ColFileSize
						dataArgs={dataArgs}
						optimizerStatus={siteImageData.optimizationStatus}
					/>
				);
			default: return null;
		}
	};

	const openPreferencesModal = () => {
		FlyModal.onRequestClose();
		ipcRenderer.send(IPC_EVENTS.GO_TO_PREFERENCES);
	}

	const invokeModal = (ModalContents: React.FC<IModalProps>, onCancel?: Function, onConfirm?: Function) =>  {

		const onSubmit = () => {
			compressSelectedImages();
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

		ReactDOM.render(
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

	return (
		<div className='fileView_Container'>
			<FileListHeader
				siteImageData={siteImageData}
				resetToOverview={resetToOverview}
				invokeModal={invokeModal}
				selectedImages={selectedImages}
				cancelImageCompression={cancelImageCompression}
				setOverviewSelected={setOverviewSelected}
				siteID={siteID}
			/>
				<ProgressBar progress={siteImageData.compressionListCompletionPercentage} />
			<div className='fileListViewer_File_List' id="no-context-menu">
				<VirtualTable
					id="io-file-list"
					rowClassName='fileList_Virtual_Table_Row'
					cellRenderer={cellRender}
					data={siteImageData.optimizationStatus === OptimizerStatus.BEFORE ? uncompressedImages : selectedImages}
					headers={[
						{ key: 'fileStatus', value: '', className: 'fileListViewer_Column_Selected'},
						{ key: 'filePath', value: 'Filename', className: 'fileListViewer_Column_File_Name'},
						{ key: 'originalSize', value: 'Original', className: 'fileListViewer_Column_Original_Size'},
						{ key: 'compressedSize', value: 'Compressed', className: 'fileListViewer_Column_Compressed_Size'}
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
