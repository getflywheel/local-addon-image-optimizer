import { createMockServiceContainer } from '../test/mockCreators';
import { scanImagesFactory } from './scanImages';

const sitePath = '/Users/cool-man-joe/Local Sites/twice-baked-potato';
const serviceContainer = createMockServiceContainer(sitePath);

const imageDataStore = {};

/**
 * @todo Clean up dependencies that are unused and make fs-extra a dev only dependency
 */

jest.mock('fs-extra');
const fsExtra = require('fs-extra');

// mock out utils so that we don't accidentally make calls to fs, etc.
// also this makes assertions much easier and utils should be tested independantly anyways
jest.mock('./utils');
const utils = require('./utils');
utils.getImageFilePaths.mockImplementation((site) => {
	return [
		'fake/path/file1.jpeg',
		'fake/path/file1.jpeg',
	];
});
utils.getFileHash.mockImplementation((file) => {

});

describe('scanImages', () => {
	const scanImages = scanImagesFactory(serviceContainer, imageDataStore);
	const siteID = '1234';


	beforeAll(async () => {
		const res = await scanImages(siteID, fsExtra);
	});

	it('', () => {});
	it('', () => {});
});
