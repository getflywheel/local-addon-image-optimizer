import path from 'path';
import md5 from 'md5';
import * as Local from '@getflywheel/local';
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


jest.mock('recursive-readdir');


const createFSMock = (mockImage?: string | Buffer) => ({
	readFile: jest.fn((filePath, cb) => {
		cb(null, mockImage || '');
		return {
			filePath,
			cb,
		}
	}),
	existsSync: jest.fn((path: string) => {
		return true;
	}),
});

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
	let fsMock;

	beforeEach(() => {
		fsMock = createFSMock(mockImageBuffer);
	});

	it('reads a file, calls the md5 function and resolves a promise with that value', async () => {
		const res = await getFileHash(imageFilePath, fsMock);

		expect(md5(mockImageBuffer)).toEqual(res);

		/**
		 * An md5 should be 32 hex characters long
		 */
		expect(res.length).toEqual(32);
		expect(res.match(/[0-9a-f]+/g)[0].length).toEqual(32);
	});

	it('calls fs.readFile once with the passed in filePath', async () => {
		const res = await getFileHash(imageFilePath, fsMock);

		expect(fsMock.readFile.mock.calls.length).toEqual(1);
		expect(fsMock.readFile.mock.results[0].value.filePath).toEqual(imageFilePath);
	});
});

describe('getImageFilePaths', () => {
	const recursiveReaddir = require('recursive-readdir')
	const contentPath = 'app/public/wp-content/uploads';
	const fileList = ['hello.jpeg'];

	const recursiveReaddirMock = (contentPath, filters, cb) => {
		cb(null, fileList);
		return {
			contentPath,
			filters,
			cb,
		};
	};

	let fsMock;
	beforeEach(() => {
		fsMock = createFSMock();
	});

	/**
	 * @todo figure out how to mock out the fs module in order to test that jpeg files
	 * are indeed getting filtered correctly
	 */

	describe('getImageFilePathsHelper', () => {
		it('calls recursiveReaddir with the correct args', async (done) => {
			recursiveReaddir.mockImplementation(recursiveReaddirMock);

			await getImageFilePathsHelper(contentPath, fsMock);

			expect(fsMock.existsSync.mock.calls.length).toEqual(1);
			expect(fsMock.existsSync.mock.calls[0][0]).toEqual(contentPath);

			expect(recursiveReaddir.mock.calls[0][0]).toEqual(contentPath);
			expect(recursiveReaddir.mock.calls[0][1]).toSatisfyAll(filter => typeof filter === 'function');
			expect(typeof recursiveReaddir.mock.calls[0][2]).toEqual('function');

			done();
		});
	});

	it('calls getImageFilePathsHelper with the correct args', async () => {
		recursiveReaddir.mockImplementation(recursiveReaddirMock);

		const webRoot = '/Users/cool-man-joe/Local Sites/twice-baked-potato/app/public';

		const mockSite = { paths: { webRoot } };

		await getImageFilePaths(mockSite as Local.Site, fsMock);

		const contentPathArg = recursiveReaddir.mock.calls[1][0];

		expect(contentPathArg).toEqual(path.join(webRoot, 'wp-content', 'uploads'));
	});
});

describe('hasImageBeenCompressed', () => {
	it('returns true if the file hash is found in any of the image data under the "compressedImageHash" key', () => {
		const compressedImageHash = md5('homestar runner');
		const imageData = {
			[compressedImageHash]: {
				originalImageHash: md5('strongbad'),
				compressedImageHash,
				filePath: 'fake/file/path.jpeg',
				originalSize: 1000,
				compressedSize: 190,
			},
		};

		expect(hasImageBeenCompressed(compressedImageHash, imageData)).toBeTruthy();
	});

	it('returns false if the file hash is not found in any of the image data under the "compressedImageHash" key', () => {
		const originalImageHash = md5('homestar runner');
		const imageData = {
			[originalImageHash]: {
				originalImageHash,
				filePath: 'fake/file/path.jpeg',
				originalSize: 1000,
			},
		};

		expect(hasImageBeenCompressed(originalImageHash, imageData as SiteImageData['imageData'])).toBeFalsy();
	});
});
