export interface ImageData {
	originalImageHash: string;
	compressedImageHash?: string;
	filePath: string;
	originalSize: number;
	compressedSize?: number;
	fileStatus?: string;
	isChecked?: boolean;
}

export enum OptimizerStatus {
	BEFORE = 'before',
	RUNNING = 'running',
	COMPLETE = 'complete'
}

export interface SiteImageData {
	imageData: { [imageID: string]: ImageData };
	lastScan?: number;
	originalTotalSize?: number;
	compressedTotalSize?: number;
	// imageCount?: number;
	/**
	 * @todo make this state derived with selector
	 */
	totalCompressedCount?: number;
	scanInProgress?: boolean;
	scanError?: GenericObject;
	selectAllFilesValue?: boolean;
	optimizationStatus?: OptimizerStatus;
	/**
	 * @todo see which of the following can become derived state
	 */
	compressionListTotal?: number;
	compressionListCounter?: number;
	compressionListCompletionPercentage?: number;
	compressedImagesOriginalSize?: number;
}


export interface CachedImageDataBySiteID {
	[siteID: string]: SiteImageData;
}

export interface CancelCompression {
	cancelCompression: boolean;
}

export interface Store {
	getState: () => CachedImageDataBySiteID;
	getStateBySiteID: (siteID: string) => SiteImageData;
	setState: (newState: CachedImageDataBySiteID) => void;
	setStateBySiteID: (siteID: string, newState: Partial<SiteImageData>) => void;
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

/**
 * @todo remove this type & all references if possible since this type of thing should be handled by selectors now
 */
// export enum DatasetType {
// 	ONLY_UNCOMPRESSED = 'only_uncompressed_images',
// 	ALL_FOUND = 'all_found_images'
// }

export interface Preferences {
	stripMetaData?: boolean;
}
