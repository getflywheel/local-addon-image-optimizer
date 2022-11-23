import React from 'react';
import {
	Button,
	TextButton,
	ArrowLeftIcon,
} from '@getflywheel/local-components';
import { ImageData, Preferences , OptimizerStatus, SiteData } from '../../types';

import { convertBytesToMb } from '../utils';
import { ConfirmOptimizationModal } from './ConfirmOptimizationModal';
import { selectors, useStoreSelector } from '../store/store';
import invokeModal from '../invokeModal';

interface IFileListHeaderProps {
	siteData: SiteData,
	setOverviewSelected: (x: boolean) => void,
	selectedImages: ImageData[],
	cancelImageCompression: () => void,
	resetToOverview: () => void,
	siteID: string,
	compressSelectedImages: () => void,
}

export interface ModalContentsProps {
	preferences: Preferences;
}

export const FileListHeader = (props: IFileListHeaderProps) => {
	const {
		siteData,
		setOverviewSelected,
		selectedImages,
		cancelImageCompression,
		resetToOverview,
		compressSelectedImages,
	} = props;

	const {
		compressedImagesOriginalSize,
		compressedTotalSize,
	} = useStoreSelector(selectors.compressionCompletionStats);

	const preferences = useStoreSelector((state) => state.preferences);

	const disableOptimizeButton = !(selectedImages.length > 0);

	if (siteData.optimizationStatus === OptimizerStatus.BEFORE) {
		return (
			<div className='fileView_Header'>
				<TextButton
					onClick={() => setOverviewSelected(true)}
					inline
					className='fileView_Header_Back_Button'
					leftIcon={ArrowLeftIcon}
				>
                    Back to overview
				</TextButton>

				<Button
					className='fileView_Button_Optimization'
					inline
					onClick={() => invokeModal<ModalContentsProps>({
						ModalContents: ConfirmOptimizationModal,
						modalContentsProps: { preferences },
						onSubmit: compressSelectedImages,
					})}
					privateOptions={{
						color: 'green',
						form: 'fill',
					}}
					disabled={disableOptimizeButton}
				>
                    Optimize images
				</Button>
			</div>
		);
	} else if (siteData.optimizationStatus === OptimizerStatus.RUNNING) {
		return (
			<div className='fileView_Header'>
				<div className='fileView_Header_Text'>
                    Optimizing...
				</div>

				<Button
					className='fileView_Button_Optimization'
					inline
					onClick={cancelImageCompression}
					privateOptions={{
						color: 'green',
						form: 'fill',
					}}
				>
                    Cancel
				</Button>
			</div>
		);
	} else if (siteData.optimizationStatus === OptimizerStatus.COMPLETE) {
		return (
			<div className='fileView_Header'>
				<div className='fileView_Header_Text'>
					Optimization complete! You've saved{' '}{convertBytesToMb(
						compressedImagesOriginalSize - compressedTotalSize,
					)}{' '}MB of space.
				</div>

				<Button
					className='fileView_Button_Optimization'
					inline
					onClick={resetToOverview}
					privateOptions={{
						color: 'green',
						form: 'fill',
					}}
				>
                    Go to overview
				</Button>
			</div>
		);
	}
	return null;

};
