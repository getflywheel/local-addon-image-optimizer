import React from 'react';
import { PrimaryButton, TextButton, Checkbox, Divider, Title } from '@getflywheel/local-components';

interface IFileModalProps {
	onSubmit: () => void
	openPreferences: () => void
}

export const FileListModal = ( props: IFileModalProps ) =>  {
	const { onSubmit, openPreferences } = props;

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
};
