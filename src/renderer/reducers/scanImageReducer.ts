import { SiteImageData } from "../../types";

interface IAction {
	type: string,
	payload?: GenericObject
};

export const SCAN_IMAGES_ACTIONS = {
	REQUEST: 'request',
	SUCCESS: 'success',
	FAILURE: 'failure',
}

export const initialState: SiteImageData = {
	imageData: {},
	scanLoading: false,
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
				scanLoading: true
			};

		case SCAN_IMAGES_ACTIONS.SUCCESS:
			return {
				...state,
				...action.payload,
			};

		case SCAN_IMAGES_ACTIONS.FAILURE:
			return { ...state, scanLoading: false, scanError: action.payload };

		default:
			return state;
	}
}
