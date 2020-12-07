import { createSelector } from '@reduxjs/toolkit';
import { OptimizerStatus, ImageData, SiteData } from '../../types';
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

const selectActiveSite = (): SiteData | undefined => {
	const state = store.getState();
	return state.sites[state.activeSiteID];
}

/**
 * @todo bind state to this
 */
const activeSiteID = createSelector(
	() => store.getState(),
	({ activeSiteID }) => activeSiteID,
);

const selectActiveSiteIsSelectableTable = createSelector(
	selectActiveSite,
	(siteState) =>
		siteState
			? siteState.isOverviewSelected === false && siteState.optimizationStatus === OptimizerStatus.BEFORE
			: false,
);

const selectActiveSiteIsStatusRunning = createSelector(
	selectActiveSite,
	(siteState) =>
		siteState
			? siteState.optimizationStatus === OptimizerStatus.RUNNING
			: false,
);

const uncompressedSiteImages = createSelector(
	selectActiveSite,
	(siteState) =>
		siteState
			? Object.values(siteState.imageData).filter(
				(d) => !d.compressedImageHash && !d.errorMessage
			)
			: [],
);

const compressedSiteImages = createSelector(
	selectActiveSite,
	(siteState) =>
		siteState
			? Object.values(siteState.imageData).filter(((d) => d.compressedImageHash))
			: [],
);

const totalImagesSizeBeforeCompression = createSelector(
	selectActiveSite,
	({ imageData }) => Object.values(imageData).reduce((totalSize, d) => {
		totalSize += d.originalSize;

		return totalSize;
	}, 0),
);

const originalSizeOfCompressedImages = createSelector(
	selectActiveSite,
	({ imageData }) => Object.values(imageData).reduce((size, d) => {
		if (d.compressedImageHash) {
			size += d.originalSize;
		}

		return size;
	}, 0),
);

const sizeOfCompressedImages = createSelector(
	selectActiveSite,
	({ imageData }) => Object.values(imageData).reduce((size, d) => {
		if (d.compressedImageHash) {
			size += d.compressedSize;
		}

		return size;
	}, 0),
);

const selectedSiteImages = createSelector(
	selectActiveSite,
	(siteState) =>
		siteState
			? Object.values(siteState.imageData).filter((d) => d.isChecked)
			: [],
);

const siteImageCount = createSelector(
	selectActiveSite,
	(siteState) => Object.values(siteState?.imageData || []).length,
);

const erroredTotalCount = createSelector(
	selectActiveSite,
	(siteState) => Object.values(siteState.imageData).filter(erroredImageFilter).length,
);

const imageStats = createSelector(
	siteImageCount,
	totalImagesSizeBeforeCompression,
	originalSizeOfCompressedImages,
	sizeOfCompressedImages,
	compressedSiteImages,
	erroredTotalCount,
	(
		imageCount,
		originalTotalSize,
		compressedImagesOriginalSize,
		compressedTotalSize,
		compressedSiteImages,
		erroredTotalCount,
	) => ({
		imageCount,
		originalTotalSize,
		compressedImagesOriginalSize,
		compressedTotalSize,
		totalCompressedCount: compressedSiteImages.length,
		erroredTotalCount,
	}),
);

const originalSizeOfSelectedImages = createSelector(
	selectActiveSite,
	getSelectedIDCountByKey('originalSize'),
);

const compressedSizeOfSelectedImages = createSelector(
	selectActiveSite,
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

const dummySelectActiveSite = (state) => state.sites[state.activeSiteID];

const siteImages = createSelector(
	dummySelectActiveSite,
	(siteState) => siteState.imageData || {},
);

export const selectors = {
	activeSiteID: () => activeSiteID(store.getState()),
	uncompressedSiteImages,
	compressedSiteImages,
	totalImagesSizeBeforeCompression,
	originalSizeOfCompressedImages,
	sizeOfCompressedImages,
	selectActiveSiteIsSelectableTable,
	selectActiveSiteIsStatusRunning,
	selectedSiteImages,
	siteImageCount,
	imageStats,
	compressionCompletionStats,
	siteImages: () => siteImages(store.getState()),
};
