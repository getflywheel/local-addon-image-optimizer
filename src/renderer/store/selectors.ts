import { createSelector } from '@reduxjs/toolkit';
import { SiteImageData } from '../../types';
import { store } from './store';


const siteStateSelector = () => {
	const state = store.getState();
	return state.sites[state.activeSiteID];
}

const siteImageDataSelector = createSelector(
	siteStateSelector,
	(siteState) => siteState.imageData,
);

const uncompressedSiteImages = createSelector(
	siteStateSelector,
	(siteState: SiteImageData) => Object.values(siteState.imageData).filter((d) => !d.compressedImageHash),
);


const compressedSiteImages = createSelector(
	siteStateSelector,
	(siteState: SiteImageData) => Object.values(siteState.imageData).filter(((d) => d.compressedImageHash)),
);

const totalImagesSizeBeforeCompression = createSelector(
	siteImageDataSelector,
	(imageData) => Object.values(imageData).reduce((totalSize, d) => {
		totalSize += d.originalSize;

		return totalSize;
	}, 0),
);

const originalSizeOfCompressedImages = createSelector(
	siteImageDataSelector,
	(imageData) => Object.values(imageData).reduce((size, d) => {
		if (d.compressedImageHash) {
			size += d.originalSize;
		}

		return size;
	}, 0),
);

const sizeOfCompressedImages = createSelector(
	siteImageDataSelector,
	(imageData) => Object.values(imageData).reduce((size, d) => {
		if (d.compressedImageHash) {
			size += d.compressedSize;
		}

		return size;
	}, 0),
);

const selectedSiteImages = createSelector(
	siteStateSelector,
	(siteState: SiteImageData) => Object.values(siteState.imageData).filter((d) => d.isChecked),
);

const siteImageCount = createSelector(
	siteStateSelector,
	(siteState) => Object.values(siteState?.imageData || []).length,
);

const imageStats = createSelector(
	siteImageCount,
	totalImagesSizeBeforeCompression,
	originalSizeOfCompressedImages,
	sizeOfCompressedImages,
	compressedSiteImages,
	(imageCount, originalTotalSize, compressedImagesOriginalSize, compressedTotalSize, compressedSiteImages) => ({
		imageCount,
		originalTotalSize,
		compressedImagesOriginalSize,
		compressedTotalSize,
		totalCompressedCount: compressedSiteImages.length,
	}),
);

export const selectors = {
	uncompressedSiteImages: () => uncompressedSiteImages(store.getState()),
	compressedSiteImages: () => compressedSiteImages(store.getState()),
	totalImagesSizeBeforeCompression: () => totalImagesSizeBeforeCompression(store.getState()),
	originalSizeOfCompressedImages: () => originalSizeOfCompressedImages(store.getState()),
	sizeOfCompressedImages: () => sizeOfCompressedImages(store.getState()),
	selectedSiteImages: () => selectedSiteImages(store.getState()),
	siteImageCount: () => siteImageCount(store.getState()),
	imageStats: () => imageStats(store.getState()),
};
