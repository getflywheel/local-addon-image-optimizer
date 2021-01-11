export interface ImageData {
	originalImageHash: string;
	compressedImageHash?: string;
	filePath: string;
	originalSize: number;
	compressedSize?: number;
	errorMessage?: string;
	revertToBackupStatus?: RevertToBackupStatus;
	fileStatus?: string;
	isChecked?: boolean;
}

export enum OptimizerStatus {
	BEFORE = 'before',
	RUNNING = 'running',
	COMPLETE = 'complete'
}

export enum RevertToBackupStatus {
	IN_PROGRESS = 'in-progress',
	SUCCESS = 'success',
	FAILURE = 'failure',
}

type GenericObject = { [key: string]: any }

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

export interface SiteDataBySiteID {
	[siteID: string]: SiteData;
}

export interface SiteRuntimeData {
	cancelCompression?: boolean;
}

export interface RuntimeData {
	[siteID: string]: SiteRuntimeData;
}

export interface Store {
	getState: () => SiteDataBySiteID;
	getStateBySiteID: (siteID: string) => SiteData;
	setState: (newState: SiteDataBySiteID) => void;
	deleteSiteData: (siteID: string) => void;
	setStateBySiteID: (siteID: string, newState: Partial<SiteData>) => void;
	setStateByImageID: (siteID: string, imageID: string, newState: Partial<ImageData>) => void;
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
