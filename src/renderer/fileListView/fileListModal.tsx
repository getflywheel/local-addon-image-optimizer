import React from 'react';
import { PrimaryButton, TextButton, Checkbox, Divider, Title } from '@getflywheel/local-components';

interface IFileModalProps {
	onSubmit: () => void
}

export const FileListModal = ( props: IFileModalProps ) =>  {
	const { onSubmit } = props;

		return (
			<div className='fileList_Modal'>
				<Title size="l" container={{ margin: 'm 0'}}> Confirm Optimization </Title>

				<Divider />
				{/* TODO: get clarification from design on whether we're hooking up Settings
				and the checkmark. (Do we actually need this modal?)
				
				TODO: get clarification from hifi mock on the padding and margin values for
				the content in this modal.
				*/}
					<div className='fileList_Modal_Text'>
						Optimizing images will strip metadata and reduce image sizes to improve your site's performance.
					</div>
					<TextButton>
						View Settings
					</TextButton>

					<div className='fileList_Modal_Checkbox'>
						<Checkbox label="Back up images before optimizing" />
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
