import React from 'react';
import { ipcRenderer } from 'electron';
import { PrimaryButton, TextButton, Divider, Title, FlyModal } from '@getflywheel/local-components';
import { IPC_EVENTS } from '../../constants';
import { BaseModalProps } from '../invokeModal';
import { ModalContentsProps } from './fileListHeader';


export const ConfirmOptimizationModal = (props: BaseModalProps & ModalContentsProps) => {
	const { onSubmit, preferences } = props;

	let displayText = 'Optimizing images will not strip metadata and will reduce image sizes to improve your site\'s performance.';

	if (preferences.stripMetaData) {
		displayText = 'Optimizing images will strip metadata and reduce image sizes to improve your site\'s performance.';
	}

	const openPreferencesModal = () => {
		FlyModal.onRequestClose();
		ipcRenderer.send(IPC_EVENTS.GO_TO_PREFERENCES);
	}

	return (
		<div className='fileList_Modal'>
			<Title size="l" container={{ margin: 'm 30 30'}}> Confirm Optimization </Title>
			<Divider />
				<div className='fileList_Modal_Text'>
					{displayText}
					<br />
					<br />
					<TextButton
						className="fileList_Modal_Settings_Button"
						onClick={openPreferencesModal}
					>
						View Settings
					</TextButton>
				</div>
			<Divider />
			<PrimaryButton
				onClick={onSubmit}
			>
				Optimize Images
			</PrimaryButton>
		</div>
	);
};
