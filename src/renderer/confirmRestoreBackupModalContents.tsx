import React from 'react';
import { Title, PrimaryButton } from '@getflywheel/local-components';


const ConfirmRestoreBackupModalContents = (props) => {
	const { onSubmit } = props;

	return (
		<div>
			<Title size="l" container={{ margin: 'm 30 30' }}>Revert to backup</Title>
			<br />
			Reverting an image to a backup will permanantly delete the compressed image and replace it with the original image. The backup will not be deleted.
			<br/>

			<PrimaryButton
				onClick={onSubmit}
			>
				Confirm
			</PrimaryButton>
		</div>
	);
};

export default ConfirmRestoreBackupModalContents;
