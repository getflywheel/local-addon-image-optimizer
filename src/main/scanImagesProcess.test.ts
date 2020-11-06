import 'jest-extended';
import fs from 'fs-extra';
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

const mockFileHashOne = '40cf40c608bab653903bec92ab8bd26a';
const mockFileHashTwo = 'b47c61eec6e37403c6be0cea67aa7a8e';

const mockFilePaths = [
	'fake/path/file1.jpeg',
	'fake/path/file2.jpeg',
];

const mockImageData = {
	[mockFileHashOne]: {
		originalImageHash: mockFileHashOne,
		compressedImageHash: 'snthsnthsnthstnh',
		filePath: 'fake/path/file1.jpeg',
		originalSize: 10000000,
		compressedSize: 5000000,
		fileStatus: 'succeeded',
		isChecked: true,
	},
	[mockFileHashTwo]: {
		originalImageHash: mockFileHashTwo,
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
	if(fileHash === mockFileHashOne) {
		return mockImageData[mockFileHashOne];
	}
	return undefined;
});

describe('scanImagesProcess', () => {
	let imageStats;
	beforeAll( async () => {
		const filePaths = await scanImages({webRoot: sitePath});
		imageStats = await getImageStats({ filePaths: mockFilePaths, imageData: mockImageData });
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
		expect(mock.calls[0][0]).toBe(mockFileHashOne);
		expect(mock.calls[1][0]).toBe(mockFileHashTwo);
	});

	it('calls getFileHash once for each file ', () => {
		const { mock } = utils.getFileHash;
		expect(mock.calls).toBeArrayOfSize(mockFilePaths.length);
		expect(mock.calls.map(call => call[0])).toIncludeSameMembers(mockFilePaths);
	});

	it('confirms getImageStats returns data in the correct format', () => {
		expect(imageStats).toContainAllKeys([mockFileHashOne, mockFileHashTwo]);
		expect(imageStats[mockFileHashOne]).toContainKey('compressedImageHash');
		expect(imageStats[mockFileHashTwo].compressedImageHash).toBeUndefined;
	});

});
