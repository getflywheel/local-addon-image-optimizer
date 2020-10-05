import {calculateToMb, calculateCompressedPercentage} from '../utils';

interface IScanImageState {
	scanLoading: boolean,
	scannedImages: {},
	scanError: GenericObject,
	lastUpdated: number,
	totalDeductions: string,
	totalFileSizeDeductions: string,
	totalImageOptimized: string,
	remainingUncompressedImages: number,
};

interface IAction {
	type: string,
	payload?: GenericObject
};

export const SCAN_IMAGES_ACTIONS = {
	REQUEST: 'request',
	SUCCESS: 'success',
	FAILURE: 'failure',
	OPTIMIZE_SUCCESS: 'optimizeSuccess'
}

export const initialState: IScanImageState = {
	scanLoading: false,
	scannedImages: {},
	scanError: undefined,
	lastUpdated: 0,
	totalDeductions: '-',
	totalFileSizeDeductions: '-',
	totalImageOptimized: '-/-',
	remainingUncompressedImages: 0,
};



export function scanImageReducer(state: IScanImageState, action: IAction) {
	switch (action.type) {
		case SCAN_IMAGES_ACTIONS.REQUEST:
			return { ...state, scanLoading: true };

		case SCAN_IMAGES_ACTIONS.SUCCESS:
			return {
				...state,
				lastUpdated: action.payload.lastScan,
				scanLoading: false,
				scannedImages: action.payload,
				totalImageOptimized: action.payload.totalCompressedCount + '/' + action.payload.imageCount,
				remainingUncompressedImages: action.payload.imageCount - action.payload.totalCompressedCount,
				totalDeductions: calculateCompressedPercentage(action.payload.compressedImagesOriginalSize, action.payload.compressedTotalSize),
				totalFileSizeDeductions: calculateToMb(action.payload.compressedImagesOriginalSize - action.payload.compressedTotalSize),
			};

		case SCAN_IMAGES_ACTIONS.FAILURE:
			return { ...state, scanLoading: false, scanError: action.payload };

		case SCAN_IMAGES_ACTIONS.OPTIMIZE_SUCCESS:
			return {
				...state,
				lastUpdated: action.payload.lastScan,
				totalDeductions: calculateCompressedPercentage(action.payload.compressedImagesOriginalSize, action.payload.compressedTotalSize),
				totalFileSizeDeductions: calculateToMb(action.payload.compressedImagesOriginalSize - action.payload.compressedTotalSize),
				totalImageOptimized: action.payload.totalCompressedCount + '/' + action.payload.imageCount,
				remainingUncompressedImages: action.payload.imageCount - action.payload.totalCompressedCount,
			}

		default:
			return state;
	}
}
