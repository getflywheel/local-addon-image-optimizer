import 'jest-extended';
import * as LocalMain from '@getflywheel/local/main';
import { createMockServiceContainer } from '../test/mockCreators';
import { scanImagesFactory } from './scanImages';
import { createStore } from './createStore';


const sitePath = '/Users/cool-man-joe/Local Sites/twice-baked-potato';
const serviceContainer = createMockServiceContainer(sitePath);

const imageDataStore = createStore();

jest.mock('./errorReporting', () => ({
	reportScanRequest: jest.fn(),
	reportScanSuccess: jest.fn(),
	reportScanFailure: jest.fn()
}));

jest.mock('./utils');
const utils = require('./utils');

describe('scanImages', () => {
	const scanImages = scanImagesFactory(
		serviceContainer as unknown as LocalMain.ServiceContainerServices,
		imageDataStore
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

		Object.values(imageData).forEach(singleImageDataObject => {
			expect(singleImageDataObject).toContainAllKeys([
				'originalImageHash',
				'compressedImageHash',
				'filePath',
				'originalSize',
				'compressedSize',
				'fileStatus',
				'isChecked'
			]);
		});
	});

	it('confirms siteData contains appropriate keys', () => {
		expect(siteData).toContainAllKeys([
			'scanInProgress',
			'imageData',
			'lastScan',
			'originalTotalSize',
			'compressedTotalSize',
			'imageCount',
			'totalCompressedCount',
			'compressedImagesOriginalSize'
		]);
	});

	it('confirms originalTotalSize is calculated correctly', () => {
		expect(siteData.originalTotalSize).toBe(17000000);
	});

	it('confirms compressedTotalSize is calculated correctly', () => {
		expect(siteData.compressedTotalSize).toBe(8500000);
	});

	it('confirms totalCompressedCount is calculated correctly', () => {
		expect(siteData.totalCompressedCount).toBe(2);
	});

	it('confirms compressedImagesOriginalSize is calculated correctly', () => {
		expect(siteData.compressedImagesOriginalSize).toBe(17000000);
	});
});
