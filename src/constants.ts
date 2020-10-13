export const IPC_EVENTS = {
	SCAN_FOR_IMAGES: 'imageOptimizer:scan-for-images',
	COMPRESS_IMAGES: 'imageOptimizer:compress-images',
	COMPRESS_IMAGE_STARTED: 'imageOptimizer:image-compress-start',
	COMPRESS_IMAGE_SUCCESS: 'imageOptimizer:image-compress-success',
	COMPRESS_IMAGE_FAIL: 'imageOptimizer:image-compress-fail',
	COMPRESS_ALL_IMAGES_COMPLETE: 'imageOptimizer:image-compress-all-complete',
	GET_IMAGE_DATA: 'imageOptimizer:get-image-data',
	SAVE_PREFERENCES_TO_DISK: 'imageOptimizer:savePreferencesToDisk',
	READ_PREFERENCES_FROM_DISK: 'imageOptimizer:readPreferencesFromDisk',
	GO_TO_PREFERENCES: 'imageOptimizer:go-to-preferences',
	CANCEL_COMPRESSION: 'imageOptimizer:cancel-compression',
	SCAN_IMAGES_COMPLETE: 'imageOptimizer:scan-images-complete',
	SCAN_IMAGES_FAILURE: 'imageOptimizer:scan-images-failure'
};

export const BACKUP_DIR_NAME = 'backups/addon-image-optimizer';

export const COMPRESSED_IMAGE_DATA_FILE_NAME = 'image-optimizer-plugin-image-data';

export const PREFERENCES_FILE_NAME = 'image-optimizer-plugin-preferences';

export const PREFERENCES_REDUCER_ACTION_TYPES = {
	META_DATA: 'reducerAction:stripMetaData',
};
