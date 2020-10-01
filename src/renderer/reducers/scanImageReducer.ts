interface IScanImageState {
	scanLoading: boolean,
	scannedImages: {},
	scanError: GenericObject,
	lastUpdated: string,
	totalDeductions: string,
	totalFileSizeDeductions: string,
	totalImageOptimized: string,
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
	totalDeductions: '0%',
	totalFileSizeDeductions: '0 MB',
	totalImageOptimized: '0/',
};

export function scanImageReducer(state: IScanImageState, action: IAction) {
	switch (action.type) {
		case SCAN_IMAGES_ACTIONS.REQUEST:
			return { ...state, scanLoading: true };

		case SCAN_IMAGES_ACTIONS.SUCCESS:
			console.log(action.payload.lastScan);
			return { ...state,
					lastUpdated: action.payload.lastScan,
					scanLoading: false,
					scannedImages: action.payload,
					totalImageOptimized: '0/' + action.payload.imageCount };

		case SCAN_IMAGES_ACTIONS.FAILURE:
			return { ...state, scanLoading: false, scanError: action.payload };

		case SCAN_IMAGES_ACTIONS.OPTIMIZE_SUCCESS:
			return {
				...state,
				lastUpdated: action.payload.lastUpdated,
				totalDeductions: action.payload.totalDeductions,
				totalFileSizeDeductions: action.payload.totalFileSizeDeductions,
				totalImageOptimized: action.payload.totalImageOptimized
			}

		default:
			return state;
	}
}
