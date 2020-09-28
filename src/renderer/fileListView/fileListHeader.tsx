import React from 'react';
import { Button,
    TextButton,
} from '@getflywheel/local-components';
import { ImageData } from '../../types';

interface IFileListHeaderProps {
    isCurrentlyOptimizing: string;
    setOverviewSelected: (x: boolean) => void,
    invokeModal: () => Promise<{submitted: boolean}>,
    getAllChecked: () => ImageData[];
}

export const FileListHeader = (props: IFileListHeaderProps) => {

    const disableButton = props.getAllChecked().length > 0 ? false : true;

    if (props.isCurrentlyOptimizing === 'before') {
        return (
            <div className='fileView_Header'>
                <TextButton
                    onClick={() => props.setOverviewSelected(true)}
                >
                    {/* TODO: Add left arrow icon here */}
                    Back To Overview
                </TextButton>

                <Button
                    className='fileView_Start_Optimization'
                    onClick={props.invokeModal}
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
    } else if (props.isCurrentlyOptimizing === 'running') {
        return (
            <div className='fileView_Header'>
                <div className='fileView_Header_Text'>
                    Optimizing...
                </div>

                <Button
                    className='fileView_Start_Optimization'
                    onClick={props.invokeModal}
                    privateOptions={{
                        color: 'green',
                        form: 'fill'
                    }}
                >
                    Cancel
                </Button>
            </div>
        );
    } else if (props.isCurrentlyOptimizing === 'complete') { 
        return (
            <div className='fileView_Header'>
                <div className='fileView_Header_Text'>
                    {/* TODO: add in variable to show how much space was saved here */}
                    Optimization Complete! You've saved {} of space.
                </div>

                <Button
                    className='fileView_Start_Optimization'
                    onClick={() => props.setOverviewSelected(true)}
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