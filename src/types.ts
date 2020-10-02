export interface ImageData {
	originalImageHash: string;
	compressedImageHash?: string;
	filePath: string;
	originalSize: number;
	compressedSize?: number | string;
	fileStatus?: string;
	isChecked?: boolean;
}

export interface SiteImageData {
	imageData: { [imageID: string]: ImageData };
	lastScan?: number;
	originalTotalSize?: number;
	compressedTotalSize?: number;
	imageCount?: number;
	totalCompressedCount?: number;
	compressedImagesOriginalSize?: number;
}

export interface CachedImageDataBySiteID {
	[siteID: string]: SiteImageData;
}

export interface Store {
	getState: () => CachedImageDataBySiteID;
	getStateBySiteID: (siteID: string) => SiteImageData;
	setState: (newState: CachedImageDataBySiteID) => void;
	setStateBySiteID: (siteID: string, newState: SiteImageData) => void;
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
