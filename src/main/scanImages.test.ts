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

jest.mock('./utils');

describe('scanImages', () => {
	const scanImages = scanImagesFactory(serviceContainer, imageDataStore);
	const siteID = '1234';


	beforeAll(async () => {
		const res = await scanImages(siteID, fsExtra);
	});

	it('', () => {});
	it('', () => {});
});
