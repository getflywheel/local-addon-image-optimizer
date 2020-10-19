import React from 'react';
import { PrimaryButton, TextButton, Divider, Title } from '@getflywheel/local-components';

interface IModalProps {
	onSubmit: () => void
	openPreferencesModal: () => void
	onConfirmSelect?: () => void
	onCancelSelect?: () => void
}

export const ConfirmOptimizationModal = ( props: IModalProps ) =>  (
	<div className='fileList_Modal'>
		<Title size="l" container={{ margin: 'm 30 30'}}> Confirm Optimization </Title>
		<Divider />
			<div className='fileList_Modal_Text'>
				Optimizing images will strip metadata and reduce image sizes to improve your site's performance.
				<br />
				<br />
				<TextButton
					className="fileList_Modal_Settings_Button"
					onClick={props.openPreferencesModal}
				>
					View Settings
				</TextButton>
			</div>
		<Divider />
		<PrimaryButton
			onClick={props.onSubmit}
		>
			Optimize Images
		</PrimaryButton>
	</div>
);
