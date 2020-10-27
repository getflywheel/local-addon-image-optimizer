/**
 * @todo prune out the unused redux deps once this is done
 */
import { createStore, combineReducers } from 'redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
	configureStore,
	createSlice,
	PayloadAction,
} from '@reduxjs/toolkit';

import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from '../constants';
import { Preferences, CachedImageDataBySiteID, SiteImageData, OptimizerStatus } from '../types';
import { preferencesReducer } from './reducers';

interface SiteActionPayload {
	siteID: string;
	siteImageData: SiteImageData;
	error: Error;
}

function mergeSiteImageDataState(state, action, newState?) {
	const { siteID, siteImageData } = action;
	state[siteID] = {
		...state[siteID],
		...siteImageData,
		...newState,
	};

	return state;
}

const preferencesSlice = createSlice({
	name: 'preferences',
	initialState: {} as Preferences,
	reducers: {
		hydratePreferences: (_, action: PayloadAction<Preferences>) => {
			return action.payload;
		},
		stripMetaData: (state, action: PayloadAction<boolean>) => {
			state.stripMetaData = action.payload;
		},
	},
});

const sitesSlice = createSlice({
	name: 'sites',
	initialState: {} as CachedImageDataBySiteID,
	reducers: {
		hydrateSites: (_, action: PayloadAction<CachedImageDataBySiteID>) => {
			return action.payload;
		},
		scanRequest: (state, action: PayloadAction<string>) => {
			state[action.payload].scanInProgress = true;
		},
		scanSuccess: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			const { siteID, siteImageData } = action.payload;
			state[siteID] = {
				...state[siteID],
				scanInProgress: false,
				...siteImageData,
			};
		},
		scanFailure: (state, action: PayloadAction<Omit<SiteActionPayload, 'siteImageData'>>) => {
			mergeSiteImageDataState(state, action);
		},
		setSiteImageData: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			mergeSiteImageDataState(state, action);
		},
		/**
		 * @todo rename this poor guy
		 */
		setSiteImageDataBeforeIntialCompression: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			mergeSiteImageDataState(
				state,
				action,
				/**
				 * @todo set these values dynamically based on any current compression process happening in the background
				 */
				{
					selectAllFilesValue: true,
					optimizationStatus: OptimizerStatus.BEFORE,
					compressionListCompletionPercentage: 0,
					originalTotalSize: 0,
					compressedImagesOriginalSize: 0,
					compressedTotalSize: 0,
				},
			);
		},
	},
});

export const store = configureStore({
	reducer: {
		preferences: preferencesSlice.reducer,
		sites: sitesSlice.reducer,
	},
});

export const actions = {
	...preferencesSlice.actions,
	...sitesSlice.actions,
};

// export const dispatchRequestScan = (siteID: string) => store.dispatch(sitesSlice.actions.requestScan(siteID));

type State = ReturnType<typeof store.getState>;
export const useStoreSelector = useSelector as TypedUseSelectorHook<State>;
export const useFancyAssSelector = useStoreSelector;
