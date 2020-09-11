export interface ImageData {
	originalImageHash: string;
	compressedImageHash: string;
	filePath: string;
	originalSize: number;
	compressedSize: number;
}

export interface SiteImageData {
	imageData: { [siteID: string]: ImageData };
	lastScan?: Date;
	originalTotalSize?: number;
	compressedTotalSize?: number;
	imageCount?: number;
}

export interface CachedImageDataBySiteID {
	[siteID: string]: SiteImageData;
}
