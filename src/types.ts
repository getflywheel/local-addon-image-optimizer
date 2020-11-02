export interface ImageData {
	originalImageHash: string;
	compressedImageHash?: string;
	filePath: string;
	originalSize: number;
	compressedSize?: number;
	errorMessage?: string;
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
	scanInProgress?: boolean;
	scanError?: GenericObject;
	selectAllFilesValue?: boolean;
	optimizationStatus?: OptimizerStatus;
	compressionListCounter?: number;
	compressionListCompletionPercentage?: number;
	selectedImageIDs?: string[];
	erroredTotalCount?: number;
	overviewSelected?: boolean;
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

export interface Preferences {
	stripMetaData?: boolean;
}
