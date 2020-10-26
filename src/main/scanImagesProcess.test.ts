import 'jest-extended';
import child_process from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { createMockServiceContainer } from '../test/mockCreators';
import { createStore } from './createStore';
import md5 from 'md5';
import { scanImages, getImageStats } from './scanImagesProcess';

const sitePath = '/Users/cool-man-joe/Local Sites/twice-baked-potato';
const serviceContainer = createMockServiceContainer(sitePath);

const imageDataStore = createStore();

jest.mock('fs-extra');
fs.statSync.mockImplementation((filePath: string) => ({
	size: Math.floor(Math.random() * 99999) + 700
}));


const mockFilePaths = [
	'fake/path/file1.jpeg',
	'fake/path/file2.jpeg',
];

const mockImageData = {
	'40cf40c608bab653903bec92ab8bd26a': {
		originalImageHash: '40cf40c608bab653903bec92ab8bd26a',
		compressedImageHash: 'snthsnthsnthstnh',
		filePath: 'fake/path/file1.jpeg',
		originalSize: 10000000,
		compressedSize: 5000000,
		fileStatus: 'succeeded',
		isChecked: true,
	},
	'b47c61eec6e37403c6be0cea67aa7a8e': {
		originalImageHash: 'b47c61eec6e37403c6be0cea67aa7a8e',
		compressedImageHash: 'hdhdhdhdhdhdhdhdhd',
		filePath: 'fake/path/file2.jpeg',
		originalSize: 7000000,
		compressedSize: 3500000,
		fileStatus: 'succeeded',
		isChecked: true,
	}
}

// mock out utils so that we don't accidentally make calls to fs, etc.
// also this makes assertions much easier and utils should be tested independantly anyways
jest.mock('./utils');
const utils = require('./utils');
utils.getImageFilePaths.mockImplementation(() => {
	return mockFilePaths;
});
utils.getFileHash.mockImplementation((filePath) => {
	return md5(filePath);
});
utils.getImageIfCompressed.mockImplementation((fileHash, imageData) => {
	if(fileHash === '40cf40c608bab653903bec92ab8bd26a') {
		return mockImageData["40cf40c608bab653903bec92ab8bd26a"];
	}
	return undefined;
});

describe('scanImagesProcess', () => {
	let imageStats;
	beforeAll( async () => {
		const filePaths = await scanImages({webRoot: sitePath});
		imageStats = await getImageStats({ filePaths: mockFilePaths, imageData: mockImageData });
		console.log(filePaths, imageStats);
	});

	it('calls getImageFilePaths once with the correct args', () => {
		expect(utils.getImageFilePaths.mock.calls).toBeArrayOfSize(1);
		expect(utils.getImageFilePaths.mock.calls[0][0]).toEqual(
			serviceContainer.siteData.getSite('1234').longPath
		);

	});

	it('calls getImageIfCompressed with the correct args', () => {
		const { mock } = utils.getImageIfCompressed;
		expect(mock.calls).toBeArrayOfSize(mockFilePaths.length);
		expect(mock.calls[0][0]).toBe('40cf40c608bab653903bec92ab8bd26a');
		expect(mock.calls[1][0]).toBe('b47c61eec6e37403c6be0cea67aa7a8e');
	});

	it('calls getFileHash once for each file ', () => {
		const { mock } = utils.getFileHash;
		expect(mock.calls).toBeArrayOfSize(mockFilePaths.length);
		expect(mock.calls.map(call => call[0])).toIncludeSameMembers(mockFilePaths);
	});

	it('confirms getImageStats returns data in the correct format', () => {
		expect(imageStats).toContainAllKeys(['40cf40c608bab653903bec92ab8bd26a', 'b47c61eec6e37403c6be0cea67aa7a8e']);
		expect(imageStats['40cf40c608bab653903bec92ab8bd26a']).toContainKey('compressedImageHash');
		expect(imageStats['b47c61eec6e37403c6be0cea67aa7a8e'].compressedImageHash).toBeUndefined;
	});

});
