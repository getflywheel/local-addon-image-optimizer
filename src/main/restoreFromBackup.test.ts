import 'jest-extended';
import path from 'path';
import fs from 'fs-extra';
import glob from 'glob';
import escapeGlob from 'glob-escape';
import * as LocalMain from '@getflywheel/local/main';
import { RevertToBackupStatus } from '../types';
import { createMockServiceContainer } from '../test/mockCreators';
import { saveImageDataToDisk } from './utils';
import { createStore } from './createStore';
import { restoreImageFromBackupFactory } from './restoreFromBackup';

jest.mock('fs-extra');
jest.mock('glob');
jest.mock('glob-escape');
jest.mock('./utils');

escapeGlob.mockImplementation((glob: string) => glob);

const siteID = 'abcdefg';
const imageID = '123456';
const imageName = 'cool-image.jpg';
const sitePath = '/Users/cool-man-joe/Local Sites/twice-baked-potato';
const imagePath = path.join(sitePath, 'app', 'public', 'wp-content', 'uploads', '2590', '03', imageName);
const mockServiceContainer = createMockServiceContainer(sitePath);
const store = createStore();

describe('restoreImageFromBackupFactory', () => {
	let restoreImageFromBackup;



	beforeAll(() => {
		restoreImageFromBackup = restoreImageFromBackupFactory(
			mockServiceContainer as unknown as LocalMain.ServiceContainerServices,
			store,
		);
	});

	beforeEach(() => {
		store.setStateBySiteID(siteID, {
			imageData: {
				[imageID]: {
					originalImageHash: 'fdsa',
					compressedImageHash: 'asdf',
					originalSize: 20093,
					compressedSize: 1200,
					filePath: imagePath,
				}
			}
		});
	});

	it('returns a function', () => {
		expect(restoreImageFromBackupFactory).toBeFunction();
	});

	it('calls the glob related functions as expected', async () => {
		await restoreImageFromBackup(siteID, imageID);

		expect(glob.sync.mock.calls.length).toEqual(1);
		expect(escapeGlob.mock.calls.length).toEqual(1);
	});

	it('if no glob matches are found, returns success: false and writes to the store & disk correctly', async () => {
		const { success } = await restoreImageFromBackup(siteID, imageID);

		/**
		 * Simulates no glob matches found
		 */
		glob.sync.mockImplementationOnce(() => []);

		expect(success).toBeFalse();

		const state = store.getStateBySiteID(siteID);
		const image = state.imageData[imageID];

		expect(image.compressedImageHash).toEqual('asdf');
		expect(image.compressedSize).toEqual(1200);
		expect(image.revertToBackupStatus).toEqual(RevertToBackupStatus.SUCCESS);
	});

	it('glob pattern should include the site path', async () => {
		await restoreImageFromBackup(siteID, imageID);

		const arg = glob.sync.mock.calls[0][0];

		expect(arg).toContain(sitePath);
	});

	it('calls fs.copySync and passes it the backup that was created most recently', async () => {
		fs.statSync.mockImplementationOnce(() => ({
			birthtimeMs: 300,
		}));

		fs.statSync.mockImplementationOnce(() => ({
			birthtimeMs: 1000,
		}));

		fs.statSync.mockImplementationOnce(() => ({
			birthtimeMs: 609,
		}));

		const newestFile = 'fake/file/one.jpg';
		glob.sync.mockImplementationOnce(() => [
			'fake/file/two.jpg',
			newestFile,
			'fake/file/three.jpg',
		]);

		await restoreImageFromBackup(siteID, imageID);

		const args = fs.copySync.mock.calls[0];

		expect(args[0]).toEqual(newestFile);
		expect(args[1]).toEqual(imagePath);
	});

	it('writes an update to the in memory store and subsequently to disk', async () => {
		glob.sync.mockImplementationOnce(() => [
			'fake/file/image.jpg',
		]);

		fs.statSync.mockImplementation(() => ({
			birthtimeMs: 30,
		}));

		await restoreImageFromBackup(siteID, imageID);

		const state = store.getStateBySiteID(siteID);
		const image = state.imageData[imageID];

		expect(image.compressedImageHash).toBeFalsy();
		expect(image.compressedSize).toBeFalsy();
		expect(image.errorMessage).toBeFalsy();
		expect(image.revertToBackupStatus).toEqual(RevertToBackupStatus.FAILURE);

		/* @ts-ignore */
		const saveImageDataArgs = saveImageDataToDisk.mock.calls[saveImageDataToDisk.mock.calls.length - 1];

		expect(saveImageDataArgs[0]).toEqual(store);
		expect(saveImageDataArgs[1]).toEqual(mockServiceContainer);
	});

	it('returns the correct success message if everything went well', async () => {
		glob.sync.mockImplementationOnce(() => [
			'fake/file/image.jpg',
		]);

		fs.statSync.mockImplementation(() => ({
			birthtimeMs: 30,
		}));

		const { success } = await restoreImageFromBackup(siteID, imageID);

		expect(success).toBeTrue();
	});
});
