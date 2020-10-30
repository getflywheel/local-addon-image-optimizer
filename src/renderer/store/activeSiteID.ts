import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export const activeSiteIDSlice = createSlice({
	name: 'activeSiteID',
	initialState: null,
	reducers: {
		setActiveSiteID: (state, action: PayloadAction<string>) => {
			state = action.payload;

			return state;
		},
	},
});
