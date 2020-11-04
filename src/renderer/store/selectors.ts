import { createSelector } from '@reduxjs/toolkit';
import { ImageData, SiteData } from '../../types';
import { store } from './store';


const getSelectedIDCountByKey = (key: 'compressedSize' | 'originalSize') => (siteState: SiteData) => {
	const { selectedImageIDs, imageData } = siteState;

	if (!selectedImageIDs) {
		return 0;
	}

	return selectedImageIDs.reduce((size, id) => {
		const { compressedImageHash } = imageData[id];
		const bytes = imageData[id][key];

		if (compressedImageHash && bytes) {
			size += bytes;
		}

		return size;
	}, 0);
}

export const erroredImageFilter = ({ errorMessage, compressedImageHash}: ImageData) => errorMessage && !compressedImageHash;

const siteStateSelector = () => {
	const state = store.getState();
	return state.sites[state.activeSiteID];
}

const siteDataSelector = createSelector(
	siteStateSelector,
	(siteState) => siteState.imageData,
);

const uncompressedSiteImages = createSelector(
	siteStateSelector,
	(siteState: SiteData) => Object.values(siteState.imageData).filter(
		(d) => !d.compressedImageHash && !d.errorMessage
	),
);


const compressedSiteImages = createSelector(
	siteStateSelector,
	(siteState: SiteData) => Object.values(siteState.imageData).filter(((d) => d.compressedImageHash)),
);

const totalImagesSizeBeforeCompression = createSelector(
	siteDataSelector,
	(imageData) => Object.values(imageData).reduce((totalSize, d) => {
		totalSize += d.originalSize;

		return totalSize;
	}, 0),
);

const originalSizeOfCompressedImages = createSelector(
	siteDataSelector,
	(imageData) => Object.values(imageData).reduce((size, d) => {
		if (d.compressedImageHash) {
			size += d.originalSize;
		}

		return size;
	}, 0),
);

const sizeOfCompressedImages = createSelector(
	siteDataSelector,
	(imageData) => Object.values(imageData).reduce((size, d) => {
		if (d.compressedImageHash) {
			size += d.compressedSize;
		}

		return size;
	}, 0),
);

const selectedSiteImages = createSelector(
	siteStateSelector,
	({ imageData }) => Object.values(imageData).filter((d) => d.isChecked),
);

const siteImageCount = createSelector(
	siteStateSelector,
	(siteState) => Object.values(siteState?.imageData || []).length,
);

const erroredTotalCount = createSelector(
	siteStateSelector,
	(siteState) => Object.values(siteState.imageData).filter(erroredImageFilter).length,
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
