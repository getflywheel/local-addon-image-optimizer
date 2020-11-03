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

export interface SiteData {
	imageData: { [imageID: string]: ImageData };
	lastScan?: number;
	scanInProgress?: boolean;
	scanError?: GenericObject;
	areAllFilesSelected?: boolean;
	optimizationStatus?: OptimizerStatus;
	compressionListCounter?: number;
	compressionListCompletionPercentage?: number;
	selectedImageIDs?: string[];
	isOverviewSelected?: boolean;
}

export interface CachedImageDataBySiteID {
	[siteID: string]: SiteData;
}

export interface SiteRuntimeData {
	cancelCompression?: boolean;
}

export interface RuntimeData {
	[siteID: string]: SiteRuntimeData;
}

export interface Store {
	getState: () => CachedImageDataBySiteID;
	getStateBySiteID: (siteID: string) => SiteData;
	setState: (newState: CachedImageDataBySiteID) => void;
	setStateBySiteID: (siteID: string, newState: Partial<SiteData>) => void;
}

export interface RuntimeStore {
	getState: () => RuntimeData;
	getStateBySiteID: (siteID: string) => SiteRuntimeData;
	setCancelCompressionBySiteID: (siteID: string, cancelCompression: boolean) => void;
}

export enum FileStatus {
	STARTED = 'started',
	SUCCEEDED = 'succeeded',
	FAILED = 'failed',
}

export interface Preferences {
	stripMetaData?: boolean;
}
