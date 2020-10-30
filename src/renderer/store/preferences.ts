import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Preferences } from '../../types';

export const preferencesSlice = createSlice({
	name: 'preferences',
	initialState: {} as Preferences,
	reducers: {
		hydratePreferences: (_, action: PayloadAction<Preferences>) => {
			return action.payload;
		},
		stripMetaData: (state, action: PayloadAction<boolean>) => {
			state.stripMetaData = action.payload;
			return state;
		},
	},
});
