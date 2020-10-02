import React from 'react';
import { PrimaryButton, TextButton, Checkbox, Divider, Title } from '@getflywheel/local-components';

interface IFileModalProps {
	onSubmit: () => void
}

export const FileListModal = ( props: IFileModalProps ) =>  {
	const { onSubmit } = props;

		return (
			<div className='fileList_Modal'>
				<Title size="l" container={{ margin: 'm 30 30'}}> Confirm Optimization </Title>

				<Divider />
				{/* TODO: get clarification from design on whether we're hooking up Settings
				and the checkmark. (Do we actually need this modal?)
				*/}
					<div className='fileList_Modal_Text'>
						Optimizing images will strip metadata and reduce image sizes to improve your site's performance.
						<TextButton
							className="fileList_Modal_Settings_Button"
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
