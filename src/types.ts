export interface ImageData {
	originalImageHash: string;
	compressedImageHash: string;
	filePath: string;
	originalSize: number;
	compressedSize: number;
	fileStatus: string;
	isChecked: boolean;
}

export interface SiteImageData {
	imageData: { [imageID: string]: ImageData };
	lastScan?: Date;
	originalTotalSize?: number;
	compressedTotalSize?: number;
	imageCount?: number;
	selectAllFilesValue?: boolean;
	isCurrentlyOptimizing?: boolean;
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
