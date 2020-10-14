import React from 'react';
import { PrimaryButton, TextButton, Divider, Title } from '@getflywheel/local-components';
import ExclamationCircleSVG from '../_assets/svg/exclamation--circle.svg';

interface IFileModalProps {
	onSubmit: () => void
	openPreferences: () => void
	displayWarningContent?: boolean
	onConfirmSelect?: () => void
	onCancelSelect?: () => void
}

export const FileListModal = ( props: IFileModalProps ) =>  {
	const { onSubmit, openPreferences, displayWarningContent, onConfirmSelect, onCancelSelect } = props;

	if (!displayWarningContent) {
		return (
			<div className='fileList_Modal'>
				<Title size="l" container={{ margin: 'm 30 30'}}> Confirm Optimization </Title>
				<Divider />
					<div className='fileList_Modal_Text'>
						Optimizing images will strip metadata and reduce image sizes to improve your site's performance.
						<TextButton
							className="fileList_Modal_Settings_Button"
							onClick={openPreferences}
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
	}

	return(
		<div className='fileList_Modal'>
			<ExclamationCircleSVG className='modal-warning-svg' />
			<br />
			<Title size="l" container={{ margin: 'm'}}> Heads up! Leaving will stop the optimization process </Title>
				<div className='modal-warning-text'>
					Leaving this tab will revert your images and stop the optimizing process. Your progress will be lost.
				</div>
			<Divider />
			<PrimaryButton
				onClick={onConfirmSelect}
			>
				Stay and Continue
			</PrimaryButton>
			<br />
			<TextButton
				className="fileList_Modal_Warning_Button"
				onClick={onCancelSelect}
			>
				Ok, Leave and Stop Process
			</TextButton>
		</div>
	)
};
