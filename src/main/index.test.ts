import 'jest-extended';
import * as LocalMain from '@getflywheel/local/main';
import { filterDeletedSiteData } from './filterDeletedSiteData';
import { createStore, createRuntimeStore } from './createStore';
import { COMPRESSED_IMAGE_DATA_FILE_NAME, PREFERENCES_FILE_NAME } from '../constants';

const serviceContainer = LocalMain.getServiceContainer().cradle;

jest.mock('./filterDeletedSiteData');
jest.mock('./createStore');

// @ts-ignore
filterDeletedSiteData.mockReturnValue({
	fakeID: {},
});
// @ts-ignore
createStore.mockReturnValue({
	getState: () => ({}),
});
// @ts-ignore
createRuntimeStore.mockReturnValue({
	getState: () => ({}),
});

/**
 * import index to force it to run since we want to test that the entire file does what we want
 * instead of testing named or default exports explicity. It must be imported after the mocks are created so that it actually runs
 * the mocked modules
 */
import './index';

describe('index.ts', () => {
	it('should call LocalMain.serviceContainer.userData.get once with the correct args', () => {
		// @ts-ignore
		const { mock } = serviceContainer.userData.get;

		expect(mock.calls[0][0]).toEqual(COMPRESSED_IMAGE_DATA_FILE_NAME);
		expect(mock.calls[0][1]).toBeObject();

		expect(mock.calls[1]).toBeUndefined();
	});

	it('should call LocalMain.serviceContainer.userData.set once with the correct args', () => {
		// @ts-ignore
		const { mock } = serviceContainer.userData.set;

		expect(mock.calls[0][0]).toEqual(COMPRESSED_IMAGE_DATA_FILE_NAME);
		expect(mock.calls[0][1]).toBeObject();

		expect(mock.calls[1]).toBeUndefined();
	});

	it('calls filterDeletedSiteData once with the correct args', () => {
		// @ts-ignore
		const { mock } = filterDeletedSiteData;

		expect(mock.calls[0][0]).toContainAllKeys(['a']);
		expect(mock.calls[0][0].a).toEqual('brian eno');
		expect(mock.calls[0][1]).toEqual(serviceContainer);
		expect(mock.calls[1]).toBeUndefined();
	});

	it('properly creates a store using "createStore" and passes it the return value from filterDeletedSiteData', () => {
		// @ts-ignore
		const { mock } = createStore;

		expect(mock.calls[0][0]).toContainAllKeys(['fakeID']);
	});

	it('calls createRuntimeStore once with the correct args', () => {
		// @ts-ignore
		const { mock } = createRuntimeStore;

		expect(mock.calls[0]).toBeEmpty();
		expect(mock.calls[1]).toBeUndefined();
	});
});
