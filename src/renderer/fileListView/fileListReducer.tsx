import { ImageData } from '../../types';
import { RenderedImageData } from '../types'

interface IAction {
	type: string,
	payload?: GenericObject
};

export const POPULATE_FILE_LIST = {
	SET_IMAGE_DATA: 'get_image_data',
	TOGGLE_CHECKED_ONE: 'toggle_checked_one',
	TOGGLE_CHECKED_ALL: 'toggle_checked_all',
	IS_OPTIMIZING: 'is_optimizing',
	COMPRESS_ALL_IMAGES_COMPLETE: 'compress_all_images_complete',
	IMAGE_OPTIMIZE_STARTED: 'image_optimize_started',
	IMAGE_OPTIMIZE_FAIL: 'image_optimize_fail',
	IMAGE_OPTIMIZE_SUCCESS: 'image_optimize_success',
}

export function fileListReducer(state: RenderedImageData, action: IAction) {

	const incrementCounter = (state.compressionListCounter + 1);

	const incrementProgress = ( incrementCounter / state.compressionListTotal ) * 100;

	switch (action.type) {
		case POPULATE_FILE_LIST.SET_IMAGE_DATA:
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
				isCurrentlyOptimizing: 'before',
				compressionListCompletionPercentage: 0,
			};

		case POPULATE_FILE_LIST.TOGGLE_CHECKED_ONE:
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

		case POPULATE_FILE_LIST.TOGGLE_CHECKED_ALL:
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

		case POPULATE_FILE_LIST.IS_OPTIMIZING:
			return {
					...state,
					isCurrentlyOptimizing: action.payload.running,
					compressionListTotal: action.payload.compressionListTotal,
					compressionListCounter: 0,
			}
		
		case POPULATE_FILE_LIST.COMPRESS_ALL_IMAGES_COMPLETE:
			return {
					...state,
					isCurrentlyOptimizing: action.payload.complete,
			}

		case POPULATE_FILE_LIST.IMAGE_OPTIMIZE_STARTED:
			return {
					...state,
					imageData: {
						...state.imageData,
						[action.payload.md5hash]: {
							...state.imageData[action.payload.md5hash],
							fileStatus: 'started',
						}
					},
			}

		case POPULATE_FILE_LIST.IMAGE_OPTIMIZE_SUCCESS:
			return {
					...state,
					imageData: {
						...state.imageData,
						[action.payload.originalImageHash]: {
							...state.imageData[action.payload.originalImageHash],
							...action.payload,
							fileStatus: 'succeeded',
						}
					},
					compressionListCounter: incrementCounter,
					compressionListCompletionPercentage: incrementProgress
			}

		case POPULATE_FILE_LIST.IMAGE_OPTIMIZE_FAIL:
			return {
					...state,
					imageData: {
						...state.imageData,
						[action.payload.originalImageHash]: {
							...state.imageData[action.payload.originalImageHash],
							compressedSize: action.payload.errorMessage,
							fileStatus: 'failed',
						}
					},
					compressionListCounter: incrementCounter,
					compressionListCompletionPercentage: incrementProgress,
			}

		default:
			return state;
	}
}
