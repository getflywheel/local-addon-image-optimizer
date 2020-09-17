import 'jest-extended';

import md5 from 'md5';
import { createMockServiceContainer } from '../test/mockCreators';
import { scanImagesFactory } from './scanImages';

const sitePath = '/Users/cool-man-joe/Local Sites/twice-baked-potato';
const serviceContainer = createMockServiceContainer(sitePath);

const imageDataStore = {};

/**
 * @todo Clean up dependencies that are unused and make fs-extra a dev only dependency
 */

jest.mock('fs-extra');
const fs = require('fs-extra');
fs.statSync.mockImplementation((filePath: string) => ({
	size: Math.floor(Math.random() * 99999) + 700
}));

const mockFilePaths = [
	'fake/path/file1.jpeg',
	'fake/path/file2.jpeg',
];

// mock out utils so that we don't accidentally make calls to fs, etc.
// also this makes assertions much easier and utils should be tested independantly anyways
jest.mock('./utils');
const utils = require('./utils');
utils.getImageFilePaths.mockImplementation((site) => {
	return mockFilePaths;
});
utils.getFileHash.mockImplementation((filePath) => {
	return md5(filePath);
});

describe('scanImages', () => {
	const scanImages = scanImagesFactory(serviceContainer, imageDataStore);
	const siteID = '1234';
	let siteImageData;


	beforeAll(async () => {
		siteImageData = await scanImages(siteID);
	});

	it('calls serviceContainer.getSite', () => {
		expect(serviceContainer.siteData.getSite.mock.calls).toBeArrayOfSize(1);
	});

	it('calls getImageFilePaths once with the correct args', () => {
		expect(utils.getImageFilePaths.mock.calls).toBeArrayOfSize(1);
		expect(utils.getImageFilePaths.mock.calls[0][0]).toContainAllKeys([
			'paths',
			'longPath',
		]);
	});

	it('calls getFileHash once for each file ', () => {
		const { mock } = utils.getFileHash;
		expect(mock.calls).toBeArrayOfSize(mockFilePaths.length);
		expect(mock.calls.map(call => call[0])).toIncludeSameMembers(mockFilePaths);
	});

	it('calls saveImageDataToDisk with the correct args', () => {
		const { mock } = utils.saveImageDataToDisk;

		expect(mock.calls[0][0]).toEqual(siteID);

		expect(mock.calls[0][1]).toContainAllKeys([
			'imageData',
			'lastScan',
			'originalTotalSize',
			'compressedTotalSize',
			'imageCount',
		]);

		expect(mock.calls[0][2]).toEqual(serviceContainer)
	});

	it('updates imageDataStore[siteID] with the newly scanned imageData', () => {
		expect(imageDataStore[siteID]).toEqual(siteImageData);
	});

	it('siteImageData.imageData contains keys and the appropriate fields for each of the hashed files', () => {
		const { imageData } = siteImageData;

		expect(imageData).toContainAllKeys(mockFilePaths.map(md5));

		Object.values(imageData).forEach(singleImageDataObject => {
			expect(singleImageDataObject).toContainAllKeys([
				'originalImageHash',
				'filePath',
				'originalSize',
			]);
		});
	});
});
