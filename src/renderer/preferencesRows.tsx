import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import {
	Switch,
	Text,
} from '@getflywheel/local-components';
import { PREFERENCES_REDUCER_ACTION_TYPES } from '../constants';

export const MetaDataRow = connect(
	({ preferences }) => ({ preferences }),
)((props) => {
	const {
		setApplyButtonDisabled,
		preferences,
		dispatch,
	} = props;

	return (
		<div
			className={classNames(
				'preferences_FlexColumn',
				'preferences_PaddingBottom_11px',
			)}
		>
			<div
				className={classNames(
					'preferences_FlexRow',
					'preferences_AlignItems_Center',
					'preferences_MarginBottom_20px',
				)}
			>
				<Switch
					checked={preferences?.stripMetaData}
					tiny
					flat
					onChange={(_, checked) => {
						setApplyButtonDisabled();
						dispatch({
							type: PREFERENCES_REDUCER_ACTION_TYPES.META_DATA,
							payload: checked,
						});
					}}
				/>
				<Text
					privateOptions={{
						fontWeight: 'bold',
					}}
					className={'preferences_MarginLeft_16px'}
				>
					Strip my Metadata
				</Text>
			</div>
			<Text>
				Photos often store camera settings in the file, i.e. focal length, date, time and location. Removing the EXIF data reduces the file size. We do not strip the SEO data.
			</Text>
		</div>
	);
});
