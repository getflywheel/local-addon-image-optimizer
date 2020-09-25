import React from 'react';
import { Button, Divider } from '@getflywheel/local-components';

interface IFileModalProps {
	onSubmit: () => void
}

export const FileListModal = ( props: IFileModalProps ) =>  {
	const { onSubmit } = props;

		return(
			<div>
				<h3>Confirm Optimization</h3>
				<Divider />
					Optimizing images will strip metadata and reduce image sizes to improve your site's performance.
				<Divider />
				<Button onClick={onSubmit}>
					Optimize Images
				</Button>
			</div>
		);
};
