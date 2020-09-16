import 'jest-extended';

import { EventEmitter } from 'events';
import md5 from 'md5';
import path from 'path';
import { compressImagesFactory, backupDirName } from './compressImages';
import { IMAGE_OPTIMIZER } from '../constants';
import { createMockServiceContainer } from '../test/mockCreators';


const sitePath = '/Users/cool-man-joe/Local Sites/twice-baked-potato';

const mockServiceContainer = createMockServiceContainer(sitePath);
const wpContent = path.join(mockServiceContainer.siteData.paths.webRoot, 'wp-content');
const backupDir = path.join(sitePath, backupDirName);


jest.mock('./utils');
const utils = require('./utils');


jest.mock('fs-extra');
const fsExtra = require('fs-extra');
fsExtra.statSync.mockImplementation((path: string) => ({
	size: 1000,
}));


jest.mock('child_process');
const childProcess = require('child_process');
const emitter = new EventEmitter();
childProcess.spawn.mockImplementation((command: string, args: any[]) => {
	return emitter;
});


describe('compressImages', () => {
	const siteID = '1234';
	const imageID = md5('strongbad');
	const imageDataStore = {
		[siteID]: {
			imageData: {
				[imageID]: {
					filePath: path.join(wpContent, 'uploads', '1.jpeg'),
					compressedImageHash: md5('compressed-fake-file'),
					originalImageHash: imageID,
					originalSize: 30000,
				},
			}
		},
	};

	const expectedImageDataKeys = [
		'originalImageHash',
		'compressedImageHash',
		'filePath',
		'originalSize',
		'compressedSize',
	];

	const compressImages = compressImagesFactory(
		mockServiceContainer,
		imageDataStore,
	);

	let res

	beforeAll(async (done) => {
		res = compressImages(siteID, Object.keys(imageDataStore[siteID].imageData), fsExtra)
			.then(() => done());

		/**
		 * emit "close" with a good status code so that the the promises that compressImages is waiting
		 * on can resolve
		 */
		emitter.emit('close', 0);

		done();
	});

	it('calls serviceContainer.siteData.getSite with the passed in siteID', () => {
		expect(mockServiceContainer.siteData.getSite.mock.calls[0][0]).toEqual(siteID);
	});

	it('calls fs.ensureDir once with the backup path (site.longPath + backup file name)', async () => {
		expect(fsExtra.ensureDir.mock.calls[0][0]).toEqual(backupDir);
	});

	it('calls fs.copySync once for each md5 hash (image id) passed in and copies to the correct path in the backup dir', () => {
		expect(fsExtra.copySync.mock.calls).toBeArrayOfSize(1);

		const args = fsExtra.copySync.mock.calls[0];

		const compressedFileRelativePathPieces = args[0].replace(`${wpContent}/`, '').split('/');
		const backupFileRelativePathPieces = args[1].replace(`${backupDir}/`, '').split('/');

		compressedFileRelativePathPieces.forEach((piece, i) => {
			expect(backupFileRelativePathPieces[i]).toEqual(piece);
		});


	});

	it('calls child_process.spawn with the correct args', () => {
		const mock = childProcess.spawn.mock;
		const cliArgs = [ ...mock.calls[0][1] ];

		expect(mock.calls.length).toEqual(1);

		expect(mock.calls[0][0]).toEqual('jpeg-recompress');
		expect(cliArgs).toBeArray();

		expect(cliArgs.pop()).toEqual(path.join(wpContent, 'uploads', '1.jpeg'));
		expect(cliArgs.pop()).toEqual(path.join(backupDir, 'uploads', '1.jpeg'));
	});

	it('calls sendIPCEvent with the correct args when successful', () => {
		const mock = mockServiceContainer.sendIPCEvent.mock;

		expect(mock.calls[0][0]).toEqual(IMAGE_OPTIMIZER.COMPRESS_IMAGE_SUCCESS);
		expect(mock.calls[0][1]).toContainKeys(expectedImageDataKeys);
	});

	it('calls the saveImageDataToDisk util with the correct args', () => {
		const mock = utils.saveImageDataToDisk.mock;

		expect(mock.calls[0][0]).toEqual(siteID);

		expect(mock.calls[0][1].imageData).toBeTruthy();

		expect(mock.calls[0][1].imageData[imageID]).toContainKeys(expectedImageDataKeys);
	});
});
