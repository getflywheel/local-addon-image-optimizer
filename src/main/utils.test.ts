import 'jest-extended';

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
	getImageIfCompressed,
} from './utils';
import createStore from './createStore';
import { COMPRESSED_IMAGE_DATA_FILE_NAME } from '../constants';
import { createMockServiceContainer } from '../test/mockCreators';


jest.mock('fs-extra');

const fsExtra = require('fs-extra');
const mockImageBuffer = Buffer.from([1, 2, 3, 4, 5, 6, 7]);
fsExtra.readFile.mockImplementation((filePath, cb) => {
	cb(null, mockImageBuffer);
	return {
		filePath,
		cb,
	}
});

fsExtra.existsSync.mockImplementation((path: string) => true);

jest.mock('recursive-readdir');

describe('saveImageDataToDisk', () => {
	const serviceContainer = createMockServiceContainer();

	const siteID = '1234asdf';
	const imageData = {
		imageData: {},
		lastScan: 1601675284054,
		originalTotalSize: 654321,
		compressedTotalSize: 123456,
		imageCount: 500,
	};

	const store = createStore();

	store.setStateBySiteID(siteID, imageData);

	beforeAll(() => {
		saveImageDataToDisk(
			store,
			serviceContainer as unknown as LocalMain.ServiceContainerServices,
		);
	});

	it('calls userData.get once with the correct args', () => {
		const { get } = serviceContainer.userData;

		expect(get.mock.calls).toBeArrayOfSize(1);

		expect(get.mock.calls[0][0]).toEqual(COMPRESSED_IMAGE_DATA_FILE_NAME);

		// no data has been set yet, so userData.get should be passed an empty object
		expect(get.mock.calls[0][1]).toContainAllKeys([]);
	});

	it('calls userData.set once with the correct args', () => {
		const { set } = serviceContainer.userData;

		expect(set.mock.calls).toBeArrayOfSize(1);

		expect(set.mock.calls[0][0]).toEqual(COMPRESSED_IMAGE_DATA_FILE_NAME);

		expect(set.mock.calls[0][1]).toContainEntry([siteID, imageData]);
	});
});

describe('getFileHash', () => {
	const imageFilePath = 'app/public/wp-content/uploads/1927/07/cool-image.jpeg';

	it('reads a file, calls the md5 function and resolves a promise with that value', async () => {
		const res = await getFileHash(imageFilePath);

		expect(md5(mockImageBuffer)).toEqual(res);

		/**
		 * An md5 should be 32 hex characters long
		 */
		expect(res.length).toEqual(32);
		expect(res.match(/[0-9a-f]+/g)[0].length).toEqual(32);
	});

	it('calls fs.readFile once with the passed in filePath', async () => {
		const res = await getFileHash(imageFilePath);

		expect(fsExtra.readFile.mock.calls.length).toEqual(2);
		expect(fsExtra.readFile.mock.results[0].value.filePath).toEqual(imageFilePath);
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

	/**
	 * @todo figure out how to mock out the fs module in order to test that jpeg files
	 * are indeed getting filtered correctly
	 */

	describe('getImageFilePathsHelper', () => {
		it('calls recursiveReaddir with the correct args', async (done) => {
			recursiveReaddir.mockImplementation(recursiveReaddirMock);

			await getImageFilePathsHelper(contentPath);

			expect(fsExtra.existsSync.mock.calls.length).toEqual(1);
			expect(fsExtra.existsSync.mock.calls[0][0]).toEqual(contentPath);

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

		await getImageFilePaths(mockSite as Local.Site);

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

		expect(getImageIfCompressed(compressedImageHash, imageData)).toBeTruthy();
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

		expect(getImageIfCompressed(originalImageHash, imageData as SiteImageData['imageData'])).toBeFalsy();
	});
});
