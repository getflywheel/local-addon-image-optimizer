import 'jest-extended';
import * as LocalMain from '@getflywheel/local/main';
import { createMockServiceContainer } from '../test/mockCreators';
import { scanImagesFactory } from './scanImages';
import { createStore } from './createStore';
import { workerFork } from '../test/mockLocalMain';

const sitePath = '/Users/cool-man-joe/Local Sites/twice-baked-potato';
const serviceContainer = createMockServiceContainer(sitePath);

const imageDataStore = createStore();

jest.mock('./errorReporting');

jest.mock('./utils');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utils = require('./utils');

describe('scanImages', () => {
	const scanImages = scanImagesFactory(
		serviceContainer as unknown as LocalMain.ServiceContainerServices,
		imageDataStore,
	);
	const siteID = '1234';
	let siteData;

	beforeAll(async () => {

		await scanImages(siteID);

		siteData = imageDataStore.getStateBySiteID(siteID);
	});

	it('calls serviceContainer.getSite', () => {
		expect(serviceContainer.siteData.getSite.mock.calls).toBeArrayOfSize(1);
	});

	it('calls LocalMain.workerFork with the correct args', () => {
		expect(workerFork.mock.calls).toBeArrayOfSize(1);
	});

	it('calls saveImageDataToDisk with the correct args', () => {
		const { mock } = utils.saveImageDataToDisk;

		expect(mock.calls[0][0]).toEqual(imageDataStore);

		expect(mock.calls[0][1]).toEqual(serviceContainer);
	});

	it('updates imageDataStore[siteID] with the newly scanned imageData', () => {
		expect(imageDataStore.getStateBySiteID(siteID)).toEqual(siteData);
	});

	it('siteData.imageData contains keys and the appropriate fields for each of the hashed files', () => {
		const { imageData } = siteData;

		expect(imageData).toContainAllKeys(['aoeuaoeuaoeuaou', 'yfyfyfyfyfyfyfyfy']);

		Object.values(imageData).forEach((singleImageDataObject) => {
			expect(singleImageDataObject).toContainAllKeys([
				'originalImageHash',
				'compressedImageHash',
				'filePath',
				'originalSize',
				'compressedSize',
				'fileStatus',
				'isChecked',
			]);
		});
	});

	it('confirms siteData contains appropriate keys', () => {
		expect(siteData).toContainAllKeys([
			'imageData',
			'lastScan',
		]);
	});
});
