import { createSlice, PayloadAction, current } from '@reduxjs/toolkit';
import {
	SiteDataBySiteID,
	SiteData,
	OptimizerStatus,
	ImageData,
	FileStatus,
} from '../../types';
import { reportAnalytics, ANALYTIC_EVENT_TYPES } from '../analytics';
import { erroredImageFilter } from './selectors';

interface SiteActionPayload {
	siteID: string;
	siteData: SiteData;
	error: Error;
}

function mergeSiteState(state, payload: Partial<SiteActionPayload>, newState?: Partial<SiteData>) {
	const { siteID, siteData } = payload;

	state[siteID] = {
		...state[siteID],
		...siteData,
		...newState,
	};

	return state;
}

function generateInitialSiteState(): Partial<SiteData> {
	return {
		scanInProgress: false,
		areAllFilesSelected: true,
		optimizationStatus: OptimizerStatus.BEFORE,
		compressionListCompletionPercentage: 0,
	};
}

function forEachImageDataObject(state: SiteData, cb: (d: ImageData) => void) {
	Object.values(state.imageData).forEach((d) => {
		cb(d);
	});

	return state;
}

export const sitesSlice = createSlice({
	name: 'sites',
	initialState: {} as SiteDataBySiteID,
	reducers: {
		hydrateSites: (_, action: PayloadAction<SiteDataBySiteID>) => {
			const initialState = Object.entries(action.payload).reduce((acc, [id, siteData]) => {
				acc[id] = {
					...siteData,
					...generateInitialSiteState(),
				};

				Object.values(acc[id].imageData).forEach((d) => d.isChecked = true);

				return acc;
			}, {} as SiteDataBySiteID);

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
			const { siteID, siteData } = action.payload;
			const { areAllFilesSelected } = state[siteID];

			/**
			 * merge in UI specific things (like whether or not an image is selected)
			 */
			const imageData = Object.entries(siteData.imageData).reduce((acc, [key, data]) => {
				acc[key] = {
					...state[siteID].imageData[key],
					...data,
					isChecked: areAllFilesSelected ? true : acc[key].isChecked,
				};

				return acc;
			}, siteData.imageData);

			state[siteID] = {
				...state[siteID],
				...siteData,
				scanInProgress: false,
				imageData,
			};

			reportAnalytics(ANALYTIC_EVENT_TYPES.SCAN_SUCCESS);
			return state;
		},
		scanFailure: (state, action: PayloadAction<Omit<SiteActionPayload, 'siteData'>>) => {
			const { siteID, error } = action.payload;

			state[siteID] = {
				...state[siteID],
				scanInProgress: false,
				scanError: error,
			};

			reportAnalytics(ANALYTIC_EVENT_TYPES.SCAN_FAILURE);
			return state;
		},
		setSiteData: (state, action: PayloadAction<Omit<SiteActionPayload, 'error'>>) => {
			return mergeSiteState(state, action.payload);
		},
		setImageSelected: (state, action: PayloadAction<{ siteID: string, imageID: string, isChecked: boolean }>) => {
			const { siteID, imageID, isChecked } = action.payload;
			const siteState = state[siteID];

			isChecked ? reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_INCLUDE_SINGLE_FILE) :
				reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_EXLUDE_SINGLE_FILE);

			siteState.imageData[imageID].isChecked = isChecked;

			if (!isChecked) {
				siteState.areAllFilesSelected = false;
			}

			return state;
		},
		setAllImagesSelected: (state, action: PayloadAction<{ siteID: string, isChecked: boolean }>) => {
			const { siteID, isChecked } = action.payload;
			const siteState = state[siteID];

			isChecked ? reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_INCLUDE_ALL_FILES) :
				reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_EXCLUDE_ALL_FILES);

			Object.values(siteState.imageData).forEach((d) => d.isChecked = isChecked);
			siteState.areAllFilesSelected = isChecked;

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
				},
			);
		},
		optimizationStatusBefore: (state, action: PayloadAction<{ siteID: string }>) => {
			const { siteID } = action.payload;

			state[siteID].optimizationStatus = OptimizerStatus.BEFORE;
			state[siteID].compressionListCompletionPercentage = 0;
			state[siteID].compressionListCounter = 0;

			/**
			 * These images should be unselected so that they don't accidentally get shown in lists that are filtered on the image's
			 * isChecked field
			 */
			forEachImageDataObject(state[siteID], (d) => {
				if (d.compressedImageHash || d.errorMessage) {
					d.isChecked = false
				}
			});

			return state;
		},
		optimizationComplete: (state, action: PayloadAction<{ siteID: string }>) => {
			const { siteID } = action.payload;
			state[siteID].optimizationStatus = OptimizerStatus.COMPLETE;

			const siteState = state[siteID];
			reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_SUCCESS,
				{
					scannedCount: Object.values(siteState?.imageData || []).length,
					optimizeCount: Object.values(siteState?.imageData).filter(((d) => d.compressedImageHash)).length
				});
			return state;
		},
		optimizationStarted: (state, action: PayloadAction<{ siteID: string, imageID: string }>) => {
			const { siteID, imageID } = action.payload;
			state[siteID].imageData[imageID].fileStatus = FileStatus.STARTED;

			reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_START);
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

			const errorCount = Object.values(siteState.imageData).filter(erroredImageFilter).length;

			reportAnalytics(ANALYTIC_EVENT_TYPES.OPTIMIZE_FAILURE, { errorCount });
			return state;
		},
		isOverviewSelected: (state, action: PayloadAction<{ siteID: string, isOverviewSelected: boolean }>) => {
			const { siteID, isOverviewSelected } = action.payload;
			state[siteID].isOverviewSelected = isOverviewSelected;

			return state;
		},
		siteDeleted: (state, action: PayloadAction<string>) => {
			delete state[action.payload];

			return state;
		},
		revertToBackupSuccess: (state, action: PayloadAction<{siteID: string, imageID: string}>) => {
			const { siteID, imageID  } = action.payload;
			const image = state[siteID].imageData[imageID];

			image.compressedImageHash = null;
			image.compressedSize = null;
			image.errorMessage = null;
			image.errorRevertingFromBackup = false;

			return state;
		},
		revertToBackupFailure: (state, action: PayloadAction<{ siteID: string, imageID: string}>) => {
			const { siteID, imageID  } = action.payload;
			const image = state[siteID].imageData[imageID];

			image.errorRevertingFromBackup = true;

			return state;
		},
	},
});
