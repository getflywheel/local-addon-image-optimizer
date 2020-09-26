import React from 'react';
import { Button,
    TextButton,
} from '@getflywheel/local-components';

interface IFileListHeaderProps {
    isCurrentlyOptimizing: string;
    setOverviewSelected: (x: boolean) => void,
    invokeModal: () => Promise<{submitted: boolean}>,
}

export const FileListHeader = (props: IFileListHeaderProps) => {

    if (props.isCurrentlyOptimizing === 'before') {
        return (
            <div className='fileView_Header'>
                <TextButton
                    onClick={() => props.setOverviewSelected(true)}
                >
                    Back To Overview
                </TextButton>

                <Button
                    className='fileView_Start_Optimization'
                    onClick={props.invokeModal}
                    privateOptions={{
                        color: 'green',
                        form: 'fill'
                    }}
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