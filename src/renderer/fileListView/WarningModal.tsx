import React from 'react';
import { PrimaryButton, TextButton, Divider, Title } from '@getflywheel/local-components';
import ExclamationCircleSVG from '../_assets/svg/exclamation--circle.svg';

interface IModalProps {
	onSubmit: () => void
	openPreferences: () => void
	onConfirm?: () => void
	onCancel?: () => void
}

export const WarningModal = ( props: IModalProps ) => (
	<div className='fileList_Modal'>
		<ExclamationCircleSVG className='modal-warning-svg' />
		<br />
		<Title size="l" container={{ margin: 'm'}}> Heads up! Leaving will stop the optimization process </Title>
			<div className='modal-warning-text'>
				Leaving this tab will revert your images and stop the optimizing process. Your progress will be lost.
			</div>
		<Divider />
		<PrimaryButton
			onClick={props.onConfirm}
		>
			Stay and Continue Optimization
		</PrimaryButton>
		<br />
		<TextButton
			className="fileList_Modal_Warning_Button"
			onClick={props.onCancel}
		>
			Leave and Lose Progress
		</TextButton>
	</div>
);
