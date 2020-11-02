import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
	CachedImageDataBySiteID,
	SiteImageData,
	OptimizerStatus,
	ImageData,
	FileStatus,
} from '../../types';
import { reportAnalytics, ANALYTIC_EVENT_TYPES } from '../analytics';

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

export const sitesSlice = createSlice({
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
			reportAnalytics(ANALYTIC_EVENT_TYPES.SCAN_START);
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

			reportAnalytics(ANALYTIC_EVENT_TYPES.SCAN_SUCCESS);
			return state;
		},
		scanFailure: (state, action: PayloadAction<Omit<SiteActionPayload, 'siteImageData'>>) => {
			const { siteID, error } = action.payload;

			state[siteID] = {
				...state[siteID],
				scanInProgress: false,
				scanError: error,
			};

			reportAnalytics(ANALYTIC_EVENT_TYPES.SCAN_FAILURE);
			return state;
		},
		setSiteImageData: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			return mergeSiteState(state, action.payload);
		},
		setImageSelected: (state, action: PayloadAction<{ siteID: string, imageID: string, isChecked: boolean }>) => {
			const { siteID, imageID, isChecked } = action.payload;
			const siteState = state[siteID];

			isChecked ? reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_INCLUDE_ALL_FILES) :
				reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_EXCLUDE_ALL_FILES);

			siteState.imageData[imageID].isChecked = isChecked;

			if (!isChecked) {
				siteState.selectAllFilesValue = false;
			}

			return state;
		},
		setAllImagesSelected: (state, action: PayloadAction<{ siteID: string, isChecked: boolean }>) => {
			const { siteID, isChecked } = action.payload;
			const siteState = state[siteID];

			isChecked ? reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_INCLUDE_SINGLE_FILE) :
				reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_EXLUDE_SINGLE_FILE);

			Object.values(siteState.imageData).forEach((d) => d.isChecked = isChecked);
			siteState.selectAllFilesValue = isChecked;

			return state;
		},
		optimizationRequested: (state, action: PayloadAction<{ siteID: string, selectedImageIDs: string[] }>) => {
			reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_START);
			return mergeSiteState(
				state,
				action.payload,
				{
					optimizationStatus: OptimizerStatus.RUNNING,
					selectedImageIDs: action.payload.selectedImageIDs,
					compressionListCounter: 0,
					erroredTotalCount: 0,
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

			// reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_SUCCESS);
			return state;
		},
		optimizationStarted: (state, action: PayloadAction<{ siteID: string, imageID: string }>) => {
			const { siteID, imageID } = action.payload;
			state[siteID].imageData[imageID].fileStatus = FileStatus.STARTED;

			// reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_START);
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
			siteState.compressionListCompletionPercentage = (siteState.compressionListCounter / siteState.selectedImageIDs.length) * 100;

			// reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_SUCCESS);
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
			siteState.compressionListCompletionPercentage = (siteState.compressionListCounter / siteState.selectedImageIDs.length) * 100;
			siteState.erroredTotalCount = siteState.erroredTotalCount + 1;

			// reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_FAILURE);
			return state;
		},
	},
});
