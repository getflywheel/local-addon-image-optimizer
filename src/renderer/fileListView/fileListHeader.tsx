import React from 'react';
import {
	Button,
	TextButton,
} from '@getflywheel/local-components';
import { ImageData } from '../../types';
import { OptimizerStatus, SiteImageData } from '../../types';
import { convertBytesToMb } from '../utils';
import ChevronArrowSVG from '../_assets/svg/chevron-arrow-right.svg';
import NavigationPrompt from 'react-router-navigation-prompt';
import { WarningModal } from './WarningModal';
import { ConfirmOptimizationModal } from './ConfirmOptimizationModal';
import { store, selectors } from '../store';

interface IFileListHeaderProps {
	siteImageData: SiteImageData,
	setOverviewSelected: (x: boolean) => void,
    invokeModal: (ModalContents: React.FC, onCancel?: Function, onConfirm?: Function) => void,
	selectedImages: ImageData[],
	cancelImageCompression: () => void,
	resetToOverview: () => void,
	siteID: string,
}

export const FileListHeader = (props: IFileListHeaderProps) => {
	const {
		siteImageData,
		setOverviewSelected,
		invokeModal,
		selectedImages,
		cancelImageCompression,
		resetToOverview,
	} = props;

	const compressedImagesOriginalSize = selectors.originalSizeOfCompressedImages(store.getState());
	const compressedTotalSize = selectors.sizeOfCompressedImages(store.getState());

    const disableOptimizeButton = selectedImages.length > 0 ? false : true;

    if (siteImageData.optimizationStatus === OptimizerStatus.BEFORE) {
        return (
            <div className='fileView_Header'>
                <TextButton
					onClick={() => setOverviewSelected(true)}
					className='fileView_Header_Back_Button'
                >
					<ChevronArrowSVG className='caret-svg' />
                    Back To Overview
                </TextButton>

                <Button
                    className='fileView_Button_Optimization'
                    onClick={() => invokeModal(ConfirmOptimizationModal as React.FC)}
                    privateOptions={{
                        color: 'green',
                        form: 'fill'
                    }}
                    disabled={disableOptimizeButton}
                >
                    Optimize Images
                </Button>
            </div>
        );
    } else if (siteImageData.optimizationStatus === OptimizerStatus.RUNNING) {
        return (
            <div className='fileView_Header'>
				<NavigationPrompt
					when={true}
				>
					{({ onConfirm, onCancel }) => invokeModal(WarningModal as React.FC, onConfirm, onCancel)}
				</NavigationPrompt>

                <div className='fileView_Header_Text'>
                    Optimizing...
                </div>

                <Button
                    className='fileView_Button_Optimization'
					onClick={cancelImageCompression}
                    privateOptions={{
                        color: 'green',
                        form: 'fill'
                    }}
                >
                    Cancel
                </Button>
            </div>
        );
    } else if (siteImageData.optimizationStatus === OptimizerStatus.COMPLETE) {
        return (
            <div className='fileView_Header'>
                <div className='fileView_Header_Text'>
					Optimization complete! You've saved{' '}{convertBytesToMb(
						compressedImagesOriginalSize - compressedTotalSize
					)}{' '}MB of space.
                </div>

                <Button
                    className='fileView_Button_Optimization'
                    onClick={resetToOverview}
                    privateOptions={{
                        color: 'green',
                        form: 'fill'
                    }}
                >
                    Go To Overview
                </Button>
            </div>
        );
    } else {
        return null;
    }
}
