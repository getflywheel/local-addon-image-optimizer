import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Preferences } from '../../types';
import { reportAnalytics, ANALYTIC_EVENT_TYPES } from '../analytics';

export const preferencesSlice = createSlice({
	name: 'preferences',
	initialState: {} as Preferences,
	reducers: {
		hydratePreferences: (_, action: PayloadAction<Preferences>) => action.payload,
		stripMetaData: (state, action: PayloadAction<boolean>) => {
			reportAnalytics(ANALYTIC_EVENT_TYPES.PREFERENCE_METADATA, { stripMetadata: action.payload });
			state.stripMetaData = action.payload;
			return state;
		},
	},
});
