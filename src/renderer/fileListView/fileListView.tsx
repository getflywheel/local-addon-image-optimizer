import React from 'react';
import { ColFileStatus } from '../columnRenderers/ColFileStatus';
import { ColFileName } from '../columnRenderers/ColFileName';
import { ColFileSize } from '../columnRenderers/ColFileSize';
import {
	VirtualTable,
	VirtualTableCellRenderer,
	IVirtualTableCellRendererDataArgs,
	ProgressBar,
} from '@getflywheel/local-components';
import { FileListHeader } from './fileListHeader';
import { OptimizerStatus, SiteData, Preferences } from '../../types';
import { selectors, useStoreSelector } from '../store/store';
import {
	useContextMenu,
	uncomprepssedImageListNoContextMenu,
	uncompressedImageListContextMenu
} from '../contextMenu';

interface IFileListViewProps {
	siteData: SiteData;
	handleCheckBoxChange: (imageID: string) => (isChecked: boolean) => void;
	toggleSelectAll: (isChecked: boolean) => void;
	compressSelectedImages: () => void;
	resetToOverview: () => void;
	cancelImageCompression: () => void;
	setOverviewSelected: (x: boolean) => void;
	preferences: Preferences;
	siteID: string;
}


export const FileListView = (props: IFileListViewProps) => {
	const {
		siteData,
		handleCheckBoxChange,
		toggleSelectAll,
		compressSelectedImages,
		resetToOverview,
		cancelImageCompression,
		setOverviewSelected,
		preferences,
		siteID,
	} = props;

	useContextMenu(uncomprepssedImageListNoContextMenu, uncompressedImageListContextMenu);

	const uncompressedImages = useStoreSelector(selectors.uncompressedSiteImages);
	const selectedImages = useStoreSelector(selectors.selectedSiteImages);

	const cellRender: VirtualTableCellRenderer = (dataArgs: IVirtualTableCellRendererDataArgs) => {
		const getSelectedCount = () => {
			return dataArgs.data.filter(
				data => data.isChecked
			).length;
		}

		switch (dataArgs.colKey) {
			case 'fileStatus': {
				return (
					<ColFileStatus
						dataArgs={dataArgs}
						handleCheckBoxChange={handleCheckBoxChange}
						toggleSelectAll={toggleSelectAll}
						areAllFilesSelected={siteData.areAllFilesSelected}
						optimizationStatus={siteData.optimizationStatus}
					/>
				);
			}
			case 'filePath': {
				let headerText = null;
				if (dataArgs.isHeader) {
					headerText = siteData.optimizationStatus === OptimizerStatus.BEFORE
						? `${getSelectedCount()} Images Selected`
						: 'File Name';
				}

				return (
					<ColFileName
						dataArgs={dataArgs}
						headerText={headerText}
					/>
				);
			}
			case 'originalSize': {
				return (
					<ColFileSize
						dataArgs={dataArgs}
					/>
				);
			}
			case 'compressedSize': {
				return (
					<ColFileSize
						dataArgs={dataArgs}
					/>
				);
			}
			default: {
				return null;
			}
		}
	};


	return (
		<div className='fileView_Container'>
			<FileListHeader
				siteData={siteData}
				resetToOverview={resetToOverview}
				selectedImages={selectedImages}
				cancelImageCompression={cancelImageCompression}
				setOverviewSelected={setOverviewSelected}
				siteID={siteID}
				compressSelectedImages={compressSelectedImages}
			/>
			<ProgressBar progress={siteData.compressionListCompletionPercentage} />
			<div className='fileListViewer_File_List' id={uncomprepssedImageListNoContextMenu}>
				<VirtualTable
					id={uncompressedImageListContextMenu}
					rowClassName='fileList_Virtual_Table_Row'
					cellRenderer={cellRender}
					data={siteData.optimizationStatus === OptimizerStatus.BEFORE ? uncompressedImages : selectedImages}
					headers={[
						{ key: 'fileStatus', value: '', className: 'fileListViewer_Column_Selected' },
						{ key: 'filePath', value: 'Filename', className: 'fileListViewer_Column_File_Name' },
						{ key: 'originalSize', value: 'Original', className: 'fileListViewer_Column_Original_Size' },
						{ key: 'compressedSize', value: 'Compressed', className: 'fileListViewer_Column_Compressed_Size' },
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
