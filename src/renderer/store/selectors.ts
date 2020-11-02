import { createSelector } from '@reduxjs/toolkit';
import { SiteImageData } from '../../types';
import { store } from './store';


export const getSelectedIDCountByKey = (key: 'compressedSize' | 'originalSize') => (siteState: SiteImageData) => {
	if (!siteState.selectedImageIDs) {
		return 0;
	}

	return siteState.selectedImageIDs.reduce((size, id) => {
		const bytes = siteState.imageData[id][key];

		if (bytes) {
			size += bytes;
		}

		return size;
	}, 0);
}

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

const erroredTotalCount = createSelector(
	siteStateSelector,
	(siteState) => {
		if (!siteState.erroredTotalCount) {
			return 0;
		}
		return siteState.erroredTotalCount
	},
);

const imageStats = createSelector(
	siteImageCount,
	totalImagesSizeBeforeCompression,
	originalSizeOfCompressedImages,
	sizeOfCompressedImages,
	compressedSiteImages,
	erroredTotalCount,
	(imageCount, originalTotalSize, compressedImagesOriginalSize, compressedTotalSize, compressedSiteImages, erroredTotalCount) => ({
		imageCount,
		originalTotalSize,
		compressedImagesOriginalSize,
		compressedTotalSize,
		totalCompressedCount: compressedSiteImages.length,
		erroredTotalCount,
	}),
);

const originalSizeOfSelectedImages = createSelector(
	siteStateSelector,
	getSelectedIDCountByKey('originalSize'),
);

const compressedSizeOfSelectedImages = createSelector(
	siteStateSelector,
	getSelectedIDCountByKey('compressedSize'),
);

const compressionCompletionStats = createSelector(
	originalSizeOfSelectedImages,
	compressedSizeOfSelectedImages,
	(compressedImagesOriginalSize, compressedTotalSize) => ({
		compressedImagesOriginalSize,
		compressedTotalSize,
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
	compressionCompletionStats: () => compressionCompletionStats(store.getState()),
};
