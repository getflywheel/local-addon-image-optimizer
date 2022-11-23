import React from 'react';
import {
	Banner,
	VirtualTable,
	VirtualTableCellRenderer,
	IVirtualTableCellRendererDataArgs,
	Spinner,
} from '@getflywheel/local-components';
import LastOptimizeStatus from './lastOptimizeStatus';
import { ColFileName } from './columnRenderers/colFileName';
import { ColFileSize } from './columnRenderers/colFileSize';
import { selectors, useStoreSelector } from './store/store';
import { SiteData, RevertToBackupStatus } from '../types';
import WarningSVG from './_assets/svg/warning.svg';
import CheckmarkSmallSVG from './_assets/svg/checkmark--sm.svg';
import {
	useContextMenu,
	comprepssedImageListNoContextMenu,
	compressedImageListContextMenu,
} from './contextMenu';

interface IProps {
	setOverviewSelected: (x: boolean) => void,
	handleScanForImages: () => void,
	siteData: SiteData,
	siteID: string,
}

export const Overview = (props: IProps) => {
	const {
		setOverviewSelected,
		handleScanForImages,
		siteData,
	} = props;

	const {
		lastScan,
		scanInProgress,
	} = siteData;

	useContextMenu(comprepssedImageListNoContextMenu, compressedImageListContextMenu);

	const onClickViewImages = () => {
		setOverviewSelected(false);
	};

	const {
		imageCount,
		originalTotalSize,
		compressedImagesOriginalSize,
		compressedTotalSize,
		totalCompressedCount,
		erroredTotalCount,
	} = useStoreSelector(selectors.imageStats);

	const compressedAndErroredImages = useStoreSelector(selectors.compressedAndErroredImages);

	const remainingUncompressedImages = imageCount - totalCompressedCount - erroredTotalCount;

	const cellRenderer: VirtualTableCellRenderer = (dataArgs: IVirtualTableCellRendererDataArgs) => {
		const { colKey, rowData: {
			compressedImageHash,
			errorMessage,
			revertToBackupStatus,
		} } = dataArgs;

		const errorRevertingFromBackup = revertToBackupStatus === RevertToBackupStatus.FAILURE;

		if (colKey === 'filePath') {
			return (
				<ColFileName
					dataArgs={dataArgs}
					headerText="Images"
				/>
			);
		}

		if (colKey === 'originalSize') {
			return (
				<ColFileSize dataArgs={dataArgs} />
			);
		}

		if (colKey === 'compressedSize') {
			let errorMessage;

			if (errorRevertingFromBackup) {
				errorMessage = 'Error reverting';
			}

			return (
				<ColFileSize
					dataArgs={dataArgs}
					errorOverrideMessage={errorMessage}
				/>
			);
		}

		if (revertToBackupStatus === RevertToBackupStatus.IN_PROGRESS) {
			return (
				<Spinner className='spinner-svg' />
			);
		}

		if (errorRevertingFromBackup || (!compressedImageHash && errorMessage)) {
			return (
				<div className='warning-svg'>
					<WarningSVG />
				</div>
			);
		}

		if (compressedImageHash) {
			return (
				<CheckmarkSmallSVG />
			);
		}

		return null;
	};

	const maybePluralizedImages = remainingUncompressedImages === 1 ? 'image' : 'images';

	return (
		<div className="overview_Container" id={comprepssedImageListNoContextMenu}>
			{remainingUncompressedImages > 0 &&
				<Banner className="imageNotificationBanner" variant="success" icon="false" buttonText={'View images'} buttonOnClick={() => onClickViewImages()}>
					We've found{' '}<strong>{remainingUncompressedImages}{' '}</strong>{maybePluralizedImages} slowing down your site.
				</Banner>
			}
			{imageCount === 0
				&& lastScan > 0
				&& !scanInProgress
				&& (
					<Banner variant="warning" icon="warning">
						No images found on site.
					</Banner>
				)
			}

			<LastOptimizeStatus
				siteData={siteData}
				handleScanForImages={handleScanForImages}
				imageCount={imageCount}
				totalCompressedCount={totalCompressedCount}
				originalTotalSize={originalTotalSize}
				compressedImagesOriginalSize={compressedImagesOriginalSize}
				compressedTotalSize={compressedTotalSize}
				erroredTotalCount={erroredTotalCount}
			/>

			{compressedAndErroredImages.length > 0
				? (
					<VirtualTable
						id={compressedImageListContextMenu}
						data={compressedAndErroredImages}
						rowClassName='fileList_Virtual_Table_Row'
						headers={[
							{ key: 'fileStatus', value: '', className: 'fileListViewer_Column_Selected' },
							{ key: 'filePath', value: 'Filename', className: 'fileListViewer_Column_File_Name' },
							{ key: 'originalSize', value: 'Original', className: 'fileListViewer_Column_Original_Size' },
							{ key: 'compressedSize', value: 'Compressed', className: 'fileListViewer_Column_Compressed_Size' },
						]}
						cellRenderer={cellRenderer}
						headersCapitalize='none'
						striped
						rowHeightSize="s"
						rowHeaderHeightSize="m"
					/>
				) : null
			}
		</div>
	);
};
