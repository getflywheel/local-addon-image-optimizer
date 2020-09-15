import mockFS from 'mock-fs';
import md5 from 'md5';

import * as LocalMain from '@getflywheel/local/main';

import {
	SiteImageData,
} from '../types';

import {
	saveImageDataToDisk,
	getFileHash,
	getImageFilePathsHelper,
	getImageFilePaths,
	// getBackupImageFilePaths,
	hasImageBeenCompressed,
} from './utils';


// const imageFilePath = 'app/public/wp-content/uploads/1927/07/cool-image.jpeg';
// const mockImageBuffer = Buffer.from([1, 2, 3, 4, 5, 6, 7]);
// //
// const fs = mockFS({
// 	[imageFilePath]: mockImageBuffer,
// }, {
// 	// do not mock out the tmp dir since Jest relies on that directory in some cases
// 	createTmp: false,
// });

describe('saveImageDataToDisk', () => {
	const serviceContainerMock = {
		userData: {
			get: jest.fn((fileBaseName, defaultData) => ({
				fileBaseName,
				defaultData,
			})) as jest.Mock,
			set: jest.fn((fileBaseName, newData) => ({
				fileBaseName,
				newData,
			})) as jest.Mock,
		},
	};

	const fileBaseName = 'site-image-data';
	const siteID = '1234asdf';
	const imageData = {
		imageData: {},
		lastScan: new Date(),
		originalTotalSize: 654321,
		compressedTotalSize: 123456,
		imageCount: 500,
	};

	it('calls the get and set methods on userData with the correct args', () => {
		const { userData } = serviceContainerMock;
		saveImageDataToDisk(
			siteID,
			imageData,
			serviceContainerMock as unknown as LocalMain.ServiceContainerServices,
		);

		const getResult = userData.get.mock.results[0].value;
		const setResult = userData.set.mock.results[0].value;

		expect(userData.get.mock.calls.length).toBe(1);

		expect(userData.set.mock.calls.length).toBe(1);

		expect(getResult.fileBaseName).toEqual(fileBaseName);

		expect(Object.keys(getResult.defaultData).length).toBe(0);

		expect(setResult.fileBaseName).toEqual(fileBaseName);

		expect(setResult.newData[siteID]).toBeTruthy();

		expect(setResult.newData[siteID]).toEqual(imageData);
	});
});

describe('getFileHash', () => {
	const imageFilePath = 'app/public/wp-content/uploads/1927/07/cool-image.jpeg';
	const mockImageBuffer = Buffer.from([1, 2, 3, 4, 5, 6, 7]);
	let fs;

	beforeAll(() => {
		fs = mockFS({
			[imageFilePath]: mockImageBuffer,
		}, {
			// do not mock out the tmp dir since Jest relies on that directory in some cases
			createTmp: false,
		});
	});

	afterAll(() => {
		/**
		 * The real fs module must be retored to avoid hard to track down bugs
		 * like this one https://github.com/istanbuljs/nyc/issues/324#issuecomment-234018654
		 */
		fs.restore();
	});

	it('reads a file, calls the md5 function and resolves a promise with that value', async () => {
		const res = await getFileHash(imageFilePath);

		/**
		 * An md5 should be 32 hex characters long
		 */
		expect(res.length).toEqual(32);
		expect(res.match(/[0-9a-f]+/g)[0].length).toEqual(32);

		/**
		 * validate that get file hash is correctly using the md5 hash algorithm
		 */
		expect(md5(mockImageBuffer)).toEqual(res);
	});
});

describe('getImageFilePaths', () => {
	// let fs;

	// beforeAll(() => {
	// 	fs = mockFS({
	// 		'app/public/wp-content/uploads/file.jpeg': Buffer.from([1,2,3,4,5]),
	// 	}, {
	// 		createTmp: false,
	// 		createCWD: false,
	// 	});
	// });

	// afterAll(() => {
	// 	fs.restore();
	// })

	// it('gets all jpeg files (and only jpeg files) in wp-content', () => {

	// });

	// it('', () => {

	// });
});
