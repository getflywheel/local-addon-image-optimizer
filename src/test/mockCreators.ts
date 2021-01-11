import path from 'path';

class MockSiteData {
	sitePath: string;

	paths: { webRoot: string; };

	constructor (sitePath) {
		this.sitePath = sitePath;
		this.paths = {
			webRoot: path.join(this.sitePath, 'app', 'public'),
		};
	}

	getSite = jest.fn((siteID: string) => ({
		paths: { webRoot: path.join(this.sitePath, 'app', 'public') },
		longPath: this.sitePath,
	}));

	sendIPCEvent = jest.fn();
}

class MockUserData {
	mockUserData: { [key: string]: any } = {};

	get = jest.fn((fileName, defaultData) => this.mockUserData[fileName] || defaultData);

	set = jest.fn((fileName, newData) => {
		this.mockUserData[fileName] = newData;

		return newData;
	});
}

export const createMockServiceContainer = (sitePath = '/Users/Local Sites/my-cool-site') => ({
	siteData: new MockSiteData(sitePath),
	sendIPCEvent: jest.fn(),
	userData: new MockUserData(),
});
