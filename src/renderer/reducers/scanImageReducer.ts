import { SiteImageData } from "../../types";

interface IAction {
	type: string,
	payload?: GenericObject,
};

export const SCAN_IMAGES_ACTIONS = {
	REQUEST: 'request',
	SUCCESS: 'success',
	FAILURE: 'failure',
}

export const initialState: SiteImageData = {
	imageData: {},
	scanInProgress: false,
	scanError: undefined,
	lastScan: 0,
	originalTotalSize: 0,
	compressedImagesOriginalSize: 0,
	compressedTotalSize: 0,
	imageCount: 0,
	totalCompressedCount: 0,
};

export function scanImageReducer(state: SiteImageData, action: IAction) {
	switch (action.type) {
		case SCAN_IMAGES_ACTIONS.REQUEST:
			return {
				...state,
				scanInProgress: true
			};

		case SCAN_IMAGES_ACTIONS.SUCCESS:
			return {
				...state,
				// site image data
				...action.payload,
			};

		case SCAN_IMAGES_ACTIONS.FAILURE:
			return { ...state, scanInProgress: false, scanError: action.payload };

		default:
			return state;
	}
}
