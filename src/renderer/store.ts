import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
	configureStore,
	createSlice,
	createSelector,
	PayloadAction,
} from '@reduxjs/toolkit';

import {
	Preferences,
	CachedImageDataBySiteID,
	SiteImageData,
	OptimizerStatus,
	ImageData,
	FileStatus,
} from '../types';

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

function generateInitialSiteState(): Partial<SiteImageData> {
	return {
		scanInProgress: false,
		selectAllFilesValue: true,
		optimizationStatus: OptimizerStatus.BEFORE,
		compressionListCompletionPercentage: 0,
	};
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
			return state;
		},
	},
});

const activeSiteIDSlice = createSlice({
	name: 'activeSiteID',
	initialState: null,
	reducers: {
		setActiveSiteID: (state, action: PayloadAction<string>) => {
			state = action.payload;

			return state;
		},
	},
});

const sitesSlice = createSlice({
	name: 'sites',
	initialState: {} as CachedImageDataBySiteID,
	reducers: {
		hydrateSites: (_, action: PayloadAction<CachedImageDataBySiteID>) => {
			const initialState = Object.entries(action.payload).reduce((acc, [id, siteImageData]) => {
				acc[id] = {
					...siteImageData,
					...generateInitialSiteState(),
				};

				Object.values(acc[id].imageData).forEach((d) => d.isChecked = true);

				return acc;
			}, {} as CachedImageDataBySiteID);

			return initialState;
		},
		addSite: (state, action: PayloadAction<{ siteID: string }>) => {
			const { siteID } = action.payload;

			state[siteID] = {
				...generateInitialSiteState(),
				imageData: {},
			}

			return state;
		},
		scanRequest: (state, action: PayloadAction<string>) => {
			state[action.payload].scanInProgress = true;

			return state;
		},
		scanSuccess: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			const { siteID, siteImageData } = action.payload;

			const { selectAllFilesValue } = state[siteID];

			/**
			 * merge in UI specific things (like whether or not an image is selected)
			 */
			const imageData = Object.entries(siteImageData.imageData).reduce((acc, [key, data]) => {
				acc[key] = {
					...state[siteID].imageData[key],
					...data,
					isChecked: selectAllFilesValue ? true : acc[key].isChecked,
				};

				return acc;
			}, siteImageData.imageData);

			state[siteID] = {
				...state[siteID],
				...siteImageData,
				imageData,
			};

			return state;
		},
		scanFailure: (state, action: PayloadAction<Omit<SiteActionPayload, 'siteImageData'>>) => {
			const { siteID, error } = action.payload;

			state[siteID] = {
				...state[siteID],
				scanInProgress: false,
				scanError: error,
			};

			return state;
		},
		setSiteImageData: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			return mergeSiteState(state, action.payload);
		},
		setImageSelected: (state, action: PayloadAction<{ siteID: string, imageID: string, isChecked: boolean }>) => {
			const { siteID, imageID, isChecked } = action.payload;
			const siteState = state[siteID];

			siteState.imageData[imageID].isChecked = isChecked;

			if (!isChecked) {
				siteState.selectAllFilesValue = false;
			}

			return state;
		},
		setAllImagesSelected: (state, action: PayloadAction<{ siteID: string, isChecked: boolean }>) => {
			const { siteID, isChecked } = action.payload;
			const siteState = state[siteID];

			Object.values(siteState.imageData).forEach((d) => d.isChecked = isChecked);
			siteState.selectAllFilesValue = isChecked;

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
				},
			);
		},
		optimizationStatus: (state, action: PayloadAction<{ siteID: string, optimizationStatus: OptimizerStatus }>) => {
			const { siteID, optimizationStatus } = action.payload;

			state[siteID].optimizationStatus = optimizationStatus;

			return state;
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

			return state;
		},
		optimizeFailure: (state, action: PayloadAction<{ siteID: string, imageID: string, errorMessage: string }>) => {
			const { siteID, imageID, errorMessage } = action.payload;

			const siteState = state[siteID];

			siteState.imageData[imageID] = {
				...siteState.imageData[imageID],
				errorMessage,
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

type State = ReturnType<typeof store.getState>;

export const actions = {
	...activeSiteIDSlice.actions,
	...preferencesSlice.actions,
	...sitesSlice.actions,
};


const siteStateSelector = () => {
	const state = store.getState();
	return state.sites[state.activeSiteID];
}

const siteImageDataSelector = createSelector(
	siteStateSelector,
	(siteState) => siteState.imageData,
);

const uncompressedSiteImages = createSelector(
	siteStateSelector,
	(siteState: SiteImageData) => Object.values(siteState.imageData).filter((d) => !d.compressedImageHash),
);


const compresedSiteImages = createSelector(
	siteStateSelector,
	(siteState: SiteImageData) => Object.values(siteState.imageData).filter(((d) => d.compressedImageHash)),
);

const totalImagesSizeBeforeCompression = createSelector(
	siteImageDataSelector,
	(imageData) => Object.values(imageData).reduce((totalSize, d) => {
		totalSize += d.originalSize;

		return totalSize;
	}, 0),
);

const originalSizeOfCompressedImages = createSelector(
	siteImageDataSelector,
	(imageData) => Object.values(imageData).reduce((size, d) => {
		if (d.compressedImageHash) {
			size += d.originalSize;
		}

		return size;
	}, 0),
);

const sizeOfCompressedImages = createSelector(
	siteImageDataSelector,
	(imageData) => Object.values(imageData).reduce((size, d) => {
		if (d.compressedImageHash) {
			size += d.compressedSize;
		}

		return size;
	}, 0),
);

const selectedSiteImages = createSelector(
	siteStateSelector,
	(siteState: SiteImageData) => Object.values(siteState.imageData).filter((d) => d.isChecked),
);

const siteImageCount = createSelector(
	siteStateSelector,
	(siteState) => Object.values(siteState?.imageData || []).length,
);

export const selectors = {
	uncompressedSiteImages: () => uncompressedSiteImages(store.getState()),
	compressedSiteImages: () => compresedSiteImages(store.getState()),
	totalImagesSizeBeforeCompression: () => totalImagesSizeBeforeCompression(store.getState()),
	originalSizeOfCompressedImages: () => originalSizeOfCompressedImages(store.getState()),
	sizeOfCompressedImages: () => sizeOfCompressedImages(store.getState()),
	selectedSiteImages: () => selectedSiteImages(store.getState()),
	siteImageCount: () => siteImageCount(store.getState()),
};

export const useStoreSelector = useSelector as TypedUseSelectorHook<State>;
export const useFancyAssSelector = useStoreSelector;
