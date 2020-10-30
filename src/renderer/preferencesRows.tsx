import React from 'react';
import classNames from 'classnames';
import {
	Switch,
	Text,
} from '@getflywheel/local-components';
import { store, actions, useStoreSelector } from './store/store';

export const MetaDataRow = (props) => {
	const { setApplyButtonDisabled } = props;

	const preferences = useStoreSelector((state) => state.preferences);

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
						store.dispatch(actions.stripMetaData(checked));
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
				Photos often store camera settings in the file, i.e. focal length, date, time and location. Removing the EXIF, IPTC and XMP metadata reduces the file size in addition to removing potentially identifying data.
			</Text>
		</div>
	);
};
