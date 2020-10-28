/**
 * @todo prune out the unused redux deps once this is done
 */
import { createStore, combineReducers } from 'redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
	configureStore,
	createSlice,
	createSelector,
	PayloadAction,
} from '@reduxjs/toolkit';

import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from '../constants';
import {
	Preferences,
	CachedImageDataBySiteID,
	SiteImageData,
	OptimizerStatus,
	ImageData,
	FileStatus,
} from '../types';
import { preferencesReducer } from './reducers';
import { filterImageData } from './utils';

interface SiteActionPayload {
	siteID: string;
	siteImageData: SiteImageData;
	error: Error;
}

function mergeSiteState(state, payload: Partial<SiteActionPayload>, newState?: Partial<SiteImageData>) {
	const { siteID, siteImageData } = payload;
	state[siteID] = {
		...state[siteID],
		...siteImageData,
		...newState,
	};

	return state;
}

const activeSiteIDSlice = createSlice({
	name: 'activeSiteID',
	initialState: null,
	reducers: {
		setActiveSiteID: (state, action: PayloadAction<string>) => {
			state = action.payload;
			return state;
		},
	}
})

const preferencesSlice = createSlice({
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

const sitesSlice = createSlice({
	name: 'sites',
	initialState: {} as CachedImageDataBySiteID,
	reducers: {
		hydrateSites: (_, action: PayloadAction<CachedImageDataBySiteID>) => {
			return action.payload;
		},
		scanRequest: (state, action: PayloadAction<string>) => {
			state[action.payload].scanInProgress = true;

			return state;
		},
		scanSuccess: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			return mergeSiteState(state, action.payload, { scanInProgress: false });
		},
		scanFailure: (state, action: PayloadAction<Omit<SiteActionPayload, 'siteImageData'>>) => {
			return mergeSiteState(state, action.payload);
		},
		setSiteImageData: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			return mergeSiteState(state, action.payload);
		},
		/**
		 * @todo rename this poor guy
		 */
		setSiteImageDataBeforeIntialCompression: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			return mergeSiteState(
				state,
				action.payload,
				/**
				 * @todo set these values dynamically based on any current compression process happening in the background
				 */
				{
					selectAllFilesValue: false,
					optimizationStatus: OptimizerStatus.BEFORE,
					compressionListCompletionPercentage: 0,
					originalTotalSize: 0,
					compressedImagesOriginalSize: 0,
					compressedTotalSize: 0,
				},
			);
		},
		setImageSelected: (state, action: PayloadAction<{ siteID: string, imageID: string, isChecked: boolean }>) => {
			const { siteID, imageID, isChecked } = action.payload;
			state[siteID].imageData[imageID].isChecked = isChecked;

			return state;
		},
		setAllImagesSelected: (state, action: PayloadAction<{ siteID: string, isChecked: boolean }>) => {
			const { siteID, isChecked } = action.payload;
			Object.values(state[siteID].imageData).forEach((d) => d.isChecked = isChecked);

			return state;
		},
		optimizationRequested: (state, action: PayloadAction<{ siteID: string, compressionListTotal: number }>) => {
			return mergeSiteState(
				state,
				action.payload,
				{
					optimizationStatus: OptimizerStatus.RUNNING,
					compressionListTotal: action.payload.compressionListTotal,
					compressionListCounter: 0,
					compressedImagesOriginalSize: 0,
					compressedTotalSize: 0,
				},
			);
		},
		optimizationComplete: (state, action: PayloadAction<{ siteID: string }>) => {
			const { siteID } = action.payload;
			state[siteID].optimizationStatus = OptimizerStatus.COMPLETE;

			return state;
		},
		optimizationStarted: (state, action: PayloadAction<{ siteID: string, imageID: string }>) => {
			const { siteID, imageID } = action.payload;
			state[siteID].imageData[imageID].fileStatus = FileStatus.STARTED;

			return state;
		},
		optimizeSuccess: (state, action: PayloadAction<{ siteID: string, imageData: ImageData }>) => {
			const { siteID, imageData } = action.payload;
			const imageID = imageData.originalImageHash;

			const siteState = state[siteID];

			siteState.imageData[imageID] = {
				...siteState.imageData[imageID],
				...imageData,
				fileStatus: FileStatus.SUCCEEDED,
			};

			siteState.compressionListCounter = siteState.compressionListCounter + 1;
			siteState.compressionListCompletionPercentage = (siteState.compressionListCounter / siteState.compressionListTotal) * 100;
			siteState.compressedImagesOriginalSize = siteState.compressedImagesOriginalSize += imageData.originalSize;
			siteState.compressedTotalSize = siteState.compressedTotalSize += imageData.compressedSize;

			return state;
		},
		optimizeFailure: (state, action: PayloadAction<{ siteID: string, imageID: string, errorMessage: string }>) => {
			const { siteID, imageID, errorMessage } = action.payload;

			const siteState = state[siteID];

			siteState.imageData[imageID] = {
				...siteState.imageData[imageID],
				/**
				 * @todo consider storing this on its own field and fix up this stuff
				 */
				/* @ts-ignore */
				compressedSize: errorMessage,
				fileStatus: FileStatus.FAILED,
			};

			siteState.compressionListCounter = siteState.compressionListCounter + 1;
			siteState.compressionListCompletionPercentage = (siteState.compressionListCounter / siteState.compressionListTotal) * 100;

			return state;
		},
	},
});

export const store = configureStore({
	reducer: {
		activeSiteID: activeSiteIDSlice.reducer,
		preferences: preferencesSlice.reducer,
		sites: sitesSlice.reducer,
	},
});


export const actions = {
	...activeSiteIDSlice.actions,
	...preferencesSlice.actions,
	...sitesSlice.actions,
};

// export const boundActions = Object.entries(actions).reduce((boundActions, [name, action]) => {
// 	boundActions[name] = (payload: Parameters<typeof action>) => store.dispatch(action(payload));
//
// 	return boundActions;
// }, {});

const getUncompressedImages = (imageData: SiteImageData['imageData']) => {
	return Object.values(imageData).filter((d) => !d.compressedImageHash);
};

const getSelectedImages = (imageData: SiteImageData['imageData']) => {
	return Object.values(imageData).filter((d) => d.isChecked);
}

const getSiteState = (state) => state.sites[state.activeSiteID];

export const selectors = {
	uncompressedSiteImageData: createSelector(
		getSiteState,
		(siteState) => getUncompressedImages(siteState.imageData),
	),
	selectedSiteImageData: createSelector(
		getSiteState,
		(siteState) => getSelectedImages(siteState.imageData),
	),
	siteImageCount: createSelector(
		getSiteState,
		(siteState) => {
			if (!siteState) {
				return 0;
			}

			return Object.values(siteState.imageData).length;
		},
	),
}

type State = ReturnType<typeof store.getState>;
export const useStoreSelector = useSelector as TypedUseSelectorHook<State>;
export const useFancyAssSelector = useStoreSelector;
