export interface ImageData {
	originalImageHash: string;
	compressedImageHash?: string;
	filePath: string;
	originalSize: number;
	compressedSize?: number | string;
	fileStatus?: string;
	isChecked?: boolean;
}

export enum OptimizerStatus {
	BEFORE = 'before',
	RUNNING = 'running',
	COMPLETE = 'complete'
}

export interface CombinedStateData {
	// used everywhere
	imageData: { [imageID: string]: ImageData };

	// Scan button disabled?
	// Overview page
	scanLoading: boolean,

	// Error object if scan images errors out
	// Overview page
	scanError?: GenericObject,

	// Last scan time?
	// Overview page
	lastUpdated?: number,

	// How many total images are uncompressed?
	// Overview page
	remainingUncompressedImages?: number,

	// All files original size
	// Overview page
	originalTotalSize?: number,

	// All compressed files total size
	// Overview page
	compressedTotalSize?: number;

	// Total count of images found by scan
	// Overview page
	imageCount?: number;

	// Total count of images that have been compressed
	// Overview and File list view
	totalCompressedCount?: number;

	// Are all files selected?
	// File list view
	selectAllFilesValue?: boolean;

	// What's the status of the optimization job
	// File list view
	optimizationStatus?: OptimizerStatus;

	// Calculate percentage of completed optimization job
	compressionListTotal?: number;
	compressionListCounter?: number;
	compressionListCompletionPercentage?: number;

	// Calculate total decrease from one optimization session
	compressedImagesOriginalSize?: number,
	compressedImagesNewSize?: number,
}

export interface CachedImageDataBySiteID {
	[siteID: string]: CombinedStateData;
}

export interface CancelCompression {
	cancelCompression: boolean;
}

export interface Store {
	getState: () => CachedImageDataBySiteID;
	getStateBySiteID: (siteID: string) => CombinedStateData;
	setState: (newState: CachedImageDataBySiteID) => void;
	setStateBySiteID: (siteID: string, newState: CombinedStateData) => void;
}

export interface RuntimeStore {
	getState: () => CancelCompression;
	setState: (newState: CancelCompression) => void;
}

export enum FileStatus {
	STARTED = 'started',
	SUCCEEDED = 'succeeded',
	FAILED = 'failed',
}

export enum DatasetType {
	ONLY_UNCOMPRESSED = 'only_uncompressed_images',
	ALL_FOUND = 'all_found_images'
}

export interface Preferences {
	stripMetaData?: boolean;
}
