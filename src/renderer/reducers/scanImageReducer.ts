interface IScanImageState {
	scanLoading: boolean,
	scannedImages: {},
	scanError: GenericObject,
	lastUpdated: string,
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

// TODO-abotz: Placeholder data needs removed. Need to update state
// when 514 + 515 are merged. Possible the OPTIMIZE_SUCCESS data would
// out of this reduce into an optimizeReducer?
export const initialState: IScanImageState = {
	scanLoading: false,
	scannedImages: {},
	scanError: undefined,
	lastUpdated: '',
	totalDeductions: '-%',
	totalFileSizeDeductions: '- MB',
	totalImageOptimized: '-/-',
	remainingUncompressedImages: 0,
};



export function scanImageReducer(state: IScanImageState, action: IAction) {
	switch (action.type) {
		case SCAN_IMAGES_ACTIONS.REQUEST:
			return { ...state, scanLoading: true };

		case SCAN_IMAGES_ACTIONS.SUCCESS:
			return { ...state,
					lastUpdated: action.payload.lastScan,
					scanLoading: false,
					scannedImages: action.payload,
					totalImageOptimized: action.payload.totalCompressedCount + '/' + action.payload.imageCount,
					remainingUncompressedImages: action.payload.imageCount - action.payload.totalCompressedCount,
					totalDeductions: Math.round((
						(action.payload.compressedImagesOriginalSize - action.payload.compressedTotalSize)
						/ action.payload.compressedImagesOriginalSize) * 100) + '%',
					totalFileSizeDeductions: ((action.payload.compressedImagesOriginalSize - action.payload.compressedTotalSize) / (1024*1024)).toFixed(2) + ' MB',
				};

		case SCAN_IMAGES_ACTIONS.FAILURE:
			return { ...state, scanLoading: false, scanError: action.payload };

		case SCAN_IMAGES_ACTIONS.OPTIMIZE_SUCCESS:
			return {
				...state,
				lastUpdated: action.payload.lastScan,
				totalDeductions: Math.round((
					(action.payload.compressedImagesOriginalSize - action.payload.compressedTotalSize)
					/ action.payload.compressedImagesOriginalSize) * 100) + '%',
				totalFileSizeDeductions: ((action.payload.compressedImagesOriginalSize - action.payload.compressedTotalSize) / (1024*1024)).toFixed(2) + ' MB',
				totalImageOptimized: action.payload.totalCompressedCount + '/' + action.payload.imageCount,
				remainingUncompressedImages: action.payload.imageCount - action.payload.totalCompressedCount,
			}

		default:
			return state;
	}
}
