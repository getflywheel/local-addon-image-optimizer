import { OptimizerStatus, CombinedStateData, FileStatus, ImageData } from '../../types'

interface IAction {
	type: string,
	payload?: GenericObject
};

export const STATE_UPDATE_ACTIONS = {
	SCAN_REQUEST: 'scan:request',
	SCAN_SUCCESS: 'scan:success',
	SCAN_FAILURE: 'scan:failure',
	ON_OPTIMIZE_SUCCESS: 'scan:optimizeSuccess',
	SET_UNCOMPRESSED_IMAGE_DATA: 'set_image_data',
	TOGGLE_SELECT_ONE_IMAGE: 'toggle_checked_one',
	TOGGLE_SELECT_ALL_IMAGES: 'toggle_checked_all',
	IS_OPTIMIZING: 'is_optimizing',
	COMPRESS_ALL_IMAGES_COMPLETE: 'compress_all_images_complete',
	IMAGE_OPTIMIZE_STARTED: 'image_optimize_started',
	IMAGE_OPTIMIZE_FAIL: 'image_optimize_fail',
	IMAGE_OPTIMIZE_SUCCESS: 'image_optimize_success',
}

export function combinedStateReducer(state: CombinedStateData, action: IAction ) {
	const incrementCounter = (state.compressionListCounter + 1);

	const incrementProgress = ( incrementCounter / state.compressionListTotal ) * 100;

	switch (action.type) {
		case STATE_UPDATE_ACTIONS.SCAN_REQUEST:
			return { ...state, scanLoading: true };

		case STATE_UPDATE_ACTIONS.SCAN_FAILURE:
			return { ...state, scanLoading: false, scanError: action.payload };

		case STATE_UPDATE_ACTIONS.SCAN_SUCCESS:
			return {
				...state,
				imageData: action.payload.imageData,
				scanLoading: false,
				originalTotalSize: action.payload.originalTotalSize,
				compressedTotalSize: action.payload.compressedTotalSize,
				lastUpdated: action.payload.lastUpdated,
				imageCount: action.payload.imageCount,
				totalCompressedCount: action.payload.totalCompressedCount,
				compressedImagesOriginalSize: action.payload.compressedImagesOriginalSize,
			};

		case STATE_UPDATE_ACTIONS.ON_OPTIMIZE_SUCCESS:
			return {
				...state,
				originalTotalSize: action.payload.originalTotalSize,
				compressedTotalSize: action.payload.compressedTotalSize,
				lastUpdated: action.payload.lastUpdated,
				imageCount: action.payload.imageCount,
				totalCompressedCount: action.payload.totalCompressedCount,
				compressedImagesOriginalSize: action.payload.compressedImagesOriginalSize,
			}

		case STATE_UPDATE_ACTIONS.SET_UNCOMPRESSED_IMAGE_DATA:
			return {
				...state,
				...action.payload,
				imageData:
					Object.entries(action.payload.imageData as ImageData).reduce((acc, [id, data]) => {
							return {
								...acc,
								[id]: {
									...data,
									isChecked: true,
								},
							};
						}, {}),
				selectAllFilesValue: true,
				optimizationStatus: OptimizerStatus.BEFORE,
				compressionListCounter: 0,
				compressionListCompletionPercentage: 0,
				sessionTotalOriginalSize: 0,
				sessionTotalCompressedSize: 0,
			};

		case STATE_UPDATE_ACTIONS.TOGGLE_SELECT_ONE_IMAGE:
			return {
				...state,
				imageData: {
					...state.imageData,
					[action.payload.imageID]: {
						...state.imageData[action.payload.imageID],
						isChecked: action.payload.isChecked,
					}
				},
			}

		case STATE_UPDATE_ACTIONS.TOGGLE_SELECT_ALL_IMAGES:
			return {
					...state,
					imageData: Object.entries(state.imageData).reduce((acc, [id, data]) => {
						acc[id] = {
							...data,
							isChecked: action.payload.isChecked,
						};
						return acc;
					}, {}),
					selectAllFilesValue: action.payload.isChecked,
			}

		case STATE_UPDATE_ACTIONS.IS_OPTIMIZING:
			return {
					...state,
					optimizationStatus: OptimizerStatus.RUNNING,
					compressionListTotal: action.payload.compressionListTotal,
			}

		case STATE_UPDATE_ACTIONS.COMPRESS_ALL_IMAGES_COMPLETE:
			return {
					...state,
					optimizationStatus: OptimizerStatus.COMPLETE,
			}

		case STATE_UPDATE_ACTIONS.IMAGE_OPTIMIZE_STARTED:
			return {
					...state,
					imageData: {
						...state.imageData,
						[action.payload.md5hash]: {
							...state.imageData[action.payload.md5hash],
							fileStatus: FileStatus.STARTED,
						}
					},
			}

		case STATE_UPDATE_ACTIONS.IMAGE_OPTIMIZE_SUCCESS:
			return {
					...state,
					imageData: {
						...state.imageData,
						[action.payload.originalImageHash]: {
							...state.imageData[action.payload.originalImageHash],
							...action.payload,
							fileStatus: FileStatus.SUCCEEDED,
						}
					},
					compressionListCounter: incrementCounter,
					compressionListCompletionPercentage: incrementProgress,
					sessionTotalOriginalSize: state.sessionTotalOriginalSize += action.payload.originalSize,
					sessionTotalCompressedSize: state.sessionTotalCompressedSize += action.payload.compressedSize,
			}

		case STATE_UPDATE_ACTIONS.IMAGE_OPTIMIZE_FAIL:
			return {
					...state,
					imageData: {
						...state.imageData,
						[action.payload.originalImageHash]: {
							...state.imageData[action.payload.originalImageHash],
							compressedSize: action.payload.errorMessage,
							fileStatus: FileStatus.FAILED,
						}
					},
					compressionListCounter: incrementCounter,
					compressionListCompletionPercentage: incrementProgress,
			}

		default:
			return state;
	}
}
