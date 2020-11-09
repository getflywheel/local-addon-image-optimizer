export const IPC_EVENTS = {
	SCAN_FOR_IMAGES: 'image-optimizer:scan-for-images',
	COMPRESS_IMAGES: 'image-optimizer:compress-images',
	COMPRESS_IMAGE_STARTED: 'image-optimizer:image-compress-start',
	COMPRESS_IMAGE_SUCCESS: 'image-optimizer:image-compress-success',
	COMPRESS_IMAGE_FAIL: 'image-optimizer:image-compress-fail',
	COMPRESS_ALL_IMAGES_COMPLETE: 'image-optimizer:image-compress-all-complete',
	GET_IMAGE_DATA: 'image-optimizer:get-image-data',
	GET_IMAGE_DATA_STORE: 'image-optimizer:get-image-data-store',
	SAVE_PREFERENCES_TO_DISK: 'image-optimizer:save-preferences-to-disk',
	READ_PREFERENCES_FROM_DISK: 'image-optimizer:read-preferences-from-disk',
	READ_SITES_FROM_DISK: 'image-optimizer:read-sites-from-disk',
	GO_TO_PREFERENCES: 'image-optimizer:go-to-preferences',
	CANCEL_COMPRESSION: 'image-optimizer:cancel-compression',
	SCAN_IMAGES_COMPLETE: 'image-optimizer:scan-images-complete',
	SCAN_IMAGES_FAILURE: 'image-optimizer:scan-images-failure',
	SITE_DELETED: 'image-optimizer:site-deleted',
};

export const BACKUP_DIR_NAME = 'backups/addon-image-optimizer';

export const COMPRESSED_IMAGE_DATA_FILE_NAME = 'image-optimizer-plugin-image-data';

export const PREFERENCES_FILE_NAME = 'image-optimizer-plugin-preferences';
