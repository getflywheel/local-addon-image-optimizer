/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-var-requires */
import 'jest-extended';
import { EventEmitter } from 'events';
import { Readable } from 'stream';
import md5 from 'md5';
import path from 'path';
import * as LocalMain from '@getflywheel/local/main';
import { compressImagesFactory } from './compressImages';
import { createRuntimeStore, createStore } from './createStore';
import { IPC_EVENTS, BACKUP_DIR_NAME } from '../constants';
import { SiteData } from '../types';
import { createMockServiceContainer } from '../test/mockCreators';

const sitePath = '/Users/cool-man-joe/Local Sites/twice-baked-potato';

const mockServiceContainer = createMockServiceContainer(sitePath);
const wpContent = path.join(mockServiceContainer.siteData.paths.webRoot, 'wp-content');
const backupDir = path.join(sitePath, BACKUP_DIR_NAME);

const siteID = '1234';

const imageOneID = md5('strongbad');
const imageTwoID = md5('the cheat');
const imageThreeName = 'homestar runner';
const imageThreeID = md5(imageThreeName);
const initialState = {
	imageData: {
		[imageOneID]: {
			filePath: path.join(wpContent, 'uploads', '1.jpeg'),
			originalImageHash: imageOneID,
			originalSize: 30000,
		},
		[imageTwoID]: {
			filePath: path.join(wpContent, 'uploads', '2.jpeg'),
			originalImageHash: imageTwoID,
			originalSize: 4595856,
		},
		[imageThreeID]: {
			filePath: path.join(wpContent, 'uploads', `${imageThreeName}.jpeg`),
			originalImageHash: imageThreeID,
			originalSize: 59030,
		},
	},
};


jest.mock('./utils');
const utils = require('./utils');
utils.getFileHash.mockImplementation((filePath: string) => md5(filePath));

jest.mock('./index', () => ({
	updateCancelCompression: jest.fn(),
}));

jest.mock('fs-extra');
const fsExtra = require('fs-extra');

fsExtra.statSync.mockImplementation(() => ({
	size: 1000,
}));

fsExtra.existsSync.mockImplementation((filePath: string) => {
	if (filePath.includes(imageThreeName)) {
		return false;
	}
	if (filePath.includes(BACKUP_DIR_NAME)) {
		return false;
	}

	return true;
});

jest.mock('child_process');
const childProcess = require('child_process');

jest.mock('./errorReporting', () => ({
	reportCompressRequest: jest.fn(),
	reportCompressSuccess: jest.fn(),
	reportCompressFailure: jest.fn(),
	reportNoBinFound: jest.fn(),
	reportBinOutput: jest.fn(),
}));

class MockChildProc extends EventEmitter {
	stderr: Readable;
	stdout: Readable;
	constructor () {
		super();
		this.stderr = new Readable({
			read () {},
		});
		this.stdout = new Readable({
			read () {},
		});
	}
}

const emitters = [];
let compressedCount = 0;
childProcess.spawn.mockImplementation(() => {
	const emitter = new MockChildProc();
	emitter.on = (channel: string, cb) => {
		if (channel !== 'close') {
			return emitter;
		}
		compressedCount++;
		/**
		 * simulate a fail on only the second image
		 */
		const code = compressedCount === 2 ? 1 : 0;
		cb(code);
		return emitter;
	};
	emitters.push(emitter);
	return emitter;
});

const imageDataStore = createStore();
imageDataStore.setStateBySiteID(siteID, initialState as SiteData);

describe('compressImages', () => {
	const expectedImageDataKeys = [
		'originalImageHash',
		'compressedImageHash',
		'filePath',
		'originalSize',
		'compressedSize',
	];

	const compressImages = compressImagesFactory(
		mockServiceContainer as unknown as LocalMain.ServiceContainerServices,
		imageDataStore,
		createRuntimeStore(),
	);

	const imageIDs = Object.keys(imageDataStore.getStateBySiteID(siteID).imageData);

	beforeAll(async (done) => {
		compressImages(siteID, imageIDs)
			.then(() => null);

		done();
	});

	it('calls serviceContainer.siteData.getSite with the passed in siteID', () => {
		expect(mockServiceContainer.siteData.getSite.mock.calls[0][0]).toEqual(siteID);
	});

	it('calls fs.ensureDir once with the backup path (site.longPath + backup file name)', async () => {
		expect(fsExtra.ensureDir.mock.calls[0][0]).toEqual(backupDir);
	});

	it('calls fs.copySync once for each image id passed in that exists on disk and copies to the correct path in the backup dir', () => {
		expect(fsExtra.copySync.mock.calls[0]).toBeArrayOfSize(2);

		const args = fsExtra.copySync.mock.calls[0];

		const compressedFileRelativePathPieces = args[0].replace(`${wpContent}/`, '').split('/');
		const backupFileRelativePathPieces = args[1].replace(`${backupDir}/`, '').split('/');

		compressedFileRelativePathPieces.forEach((piece, i) => {
			expect(backupFileRelativePathPieces[i]).toEqual(piece);
		});
	});

	it('calls child_process.spawn with the correct args', () => {
		const mock = childProcess.spawn.mock;
		const cliArgs = [...mock.calls[0][1]];

		expect(mock.calls.length).toEqual(2);

		expect(mock.calls[0][0]).toContain('jpeg-recompress');
		expect(cliArgs).toBeArray();

		expect(cliArgs.pop()).toEqual(path.join(wpContent, 'uploads', '1.jpeg'));
		expect(cliArgs.pop()).toEqual(path.join(backupDir, 'uploads', '1.jpeg'));
	});

	it('calls sendIPCEvent with the correct args when successful', () => {
		const mock = mockServiceContainer.sendIPCEvent.mock;

		let call = mock.calls[0];
		expect(call[0]).toEqual(IPC_EVENTS.COMPRESS_IMAGE_STARTED);
		expect(call[1]).toEqual(siteID);
		expect(call[2]).toEqual(imageOneID);

		call = mock.calls[1];
		expect(call[0]).toEqual(IPC_EVENTS.COMPRESS_IMAGE_SUCCESS);
		expect(call[1]).toEqual(siteID);
		expect(call[2]).toContainKeys(expectedImageDataKeys);
	});

	it('updates the store correctly when successful', () => {
		const { imageData: allImageData } = imageDataStore.getStateBySiteID(siteID);
		const imageData = allImageData[imageOneID];

		expect(imageData).toContainAllKeys(expectedImageDataKeys);
	});

	it('calls sendIPCEvent with the correct args when unnsuccessful', () => {
		const { mock } = mockServiceContainer.sendIPCEvent;
		const call = mock.calls[3];

		expect(call[0]).toEqual(IPC_EVENTS.COMPRESS_IMAGE_FAIL);
		expect(call[1]).toEqual(siteID);
		expect(call[2]).toEqual(imageTwoID);
		expect(call[3]).toBeString();
	});

	it('updates the store with an error message if the file did not successfully compress', () => {
		const { imageData: allImageData } = imageDataStore.getStateBySiteID(siteID);
		const imageData = allImageData[imageTwoID];

		expect(imageData).toContainAllKeys([
			'originalImageHash',
			'filePath',
			'originalSize',
			'errorMessage',
		]);
	});

	it('calls the saveImageDataToDisk util with the correct args', () => {
		const mock = utils.saveImageDataToDisk.mock;

		expect(mock.calls[0][0]).toEqual(imageDataStore);

		expect(mock.calls[0][1]).toEqual(mockServiceContainer);
	});

	it('calls fs.existsSync and emits a failed event if fs.existsSync returns false', () => {
		const { mock } = mockServiceContainer.sendIPCEvent;
		const call = mock.calls[5];

		expect(call[0]).toEqual(IPC_EVENTS.COMPRESS_IMAGE_FAIL);
		expect(call[1]).toEqual(siteID);
		expect(call[2]).toEqual(imageThreeID);
		expect(call[3]).toBeString();
	});
});
