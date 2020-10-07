import React from 'react';
import {
	Button,
	TextButton,
} from '@getflywheel/local-components';
import { ImageData } from '../../types';
import { OptimizerStatus, CombinedStateData } from '../../types';
import { calculateToMb } from '../utils';
import ChevronArrowSVG from '../_assets/svg/chevron-arrow-right.svg';

interface IFileListHeaderProps {
	combinedStateData: CombinedStateData,
	setOverviewSelected: (x: boolean) => void,
    invokeModal: () => void,
	getAllChecked: () => ImageData[],
	onCancel: () => void,
	resetToOverview: () => void,
}

export const FileListHeader = (props: IFileListHeaderProps) => {
	const {
		combinedStateData,
		setOverviewSelected,
		invokeModal,
		getAllChecked,
		onCancel,
		resetToOverview,
	} = props;

    const disableButton = getAllChecked().length > 0 ? false : true;

    if (combinedStateData.optimizationStatus === OptimizerStatus.BEFORE) {
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
                    onClick={invokeModal}
                    privateOptions={{
                        color: 'green',
                        form: 'fill'
                    }}
                    disabled={disableButton}
                >
                    Optimize Images
                </Button>
            </div>
        );
    } else if (combinedStateData.optimizationStatus === OptimizerStatus.RUNNING) {
        return (
            <div className='fileView_Header'>
                <div className='fileView_Header_Text'>
                    Optimizing...
                </div>

                <Button
                    className='fileView_Button_Optimization'
					onClick={onCancel}
                    privateOptions={{
                        color: 'green',
                        form: 'fill'
                    }}
                >
                    Cancel
                </Button>
            </div>
        );
    } else if (combinedStateData.optimizationStatus === OptimizerStatus.COMPLETE) {
        return (
            <div className='fileView_Header'>
                <div className='fileView_Header_Text'>
					Optimization complete! You've saved{' '}{calculateToMb(combinedStateData.sessionTotalOriginalSize-combinedStateData.sessionTotalCompressedSize)}{' '}MB of space.
                </div>

                <Button
                    className='fileView_Button_Optimization'
                    onClick={() => resetToOverview()}
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
