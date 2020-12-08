import React from 'react';
import { Title } from '@getflywheel/local-components';


const ErrorBackingUpImageModalContents = (props) => {
	const { error, filePath } = props;
	return (
		<div>
			<Title size="l" container={{ margin: 'm 30 30'}}>Unable to restore from backup</Title>
			An error occurred while trying to restore a backup of:
			<br />
			<br />
			<input
				type="text"
				readOnly
				value={filePath}
			/>
			<br/>
			<br/>
			{error}
			<br/>
			<br/>
			Check the Local logs for more details
		</div>

	);
};

export default ErrorBackingUpImageModalContents;
