import React from 'react';
import { PrimaryButton, TextButton, Divider, Title } from '@getflywheel/local-components';
import { Preferences } from '../../types';

interface IModalProps {
	onSubmit: () => void
	openPreferencesModal: () => void
	onConfirmSelect?: () => void
	onCancelSelect?: () => void
	preferences: Preferences;
}


export const ConfirmOptimizationModal = (props: IModalProps) => {
	const {
		openPreferencesModal,
		onSubmit,
		preferences,
	} = props;

	let displayText = 'Optimizing images will not strip metadata and will reduce image sizes to improve your site\'s performance.';

	if (preferences.stripMetaData) {
		displayText = 'Optimizing images will strip metadata and reduce image sizes to improve your site\'s performance.';
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
