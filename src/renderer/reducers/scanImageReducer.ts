import { SiteImageData } from "../../types";

interface IScanImageState {
	scanLoading: boolean,
	scannedImages: {},
	scanError: GenericObject,
	lastUpdated: number,
	totalImageOptimized: string,
	remainingUncompressedImages: number,
	originalTotalSize: number,
	compressedImagesOriginalSize?: number,
	compressedImagesNewSize?: number,
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

export const initialState: SiteImageData = {
	imageData: {},
	scanLoading: false,
	scanError: undefined,
	lastScan: 0,
	originalTotalSize: 0,
	compressedImagesOriginalSize: 0,
	compressedImagesNewSize: 0,
	imageCount: 0,
	totalCompressedCount: 0,
};



export function scanImageReducer(state: SiteImageData, action: IAction) {
	switch (action.type) {
		case SCAN_IMAGES_ACTIONS.REQUEST:
			return {
				...state,
				scanLoading: true
			};

		case SCAN_IMAGES_ACTIONS.SUCCESS:
			return {
				...state,
				...action.payload,
			};

		case SCAN_IMAGES_ACTIONS.FAILURE:
			return { ...state, scanLoading: false, scanError: action.payload };

		case SCAN_IMAGES_ACTIONS.OPTIMIZE_SUCCESS:
			return {
				...state,
				...action.payload,
			}

		default:
			return state;
	}
}
