import path from 'path';

class MockSiteData {
	sitePath: string;

	paths: { webRoot: string; };

	constructor(sitePath) {
		this.sitePath = sitePath;
		this.paths = {
			webRoot: path.join(this.sitePath, 'app', 'public'),
		}
	}

	getSite = jest.fn((siteID: string) => {
		return {
			paths: { webRoot: path.join(this.sitePath, 'app', 'public')},
			longPath: this.sitePath,
		};
	});

	sendIPCEvent = jest.fn();
}

export const createMockServiceContainer = (sitePath = '/Users/Local Sites/my-cool-site') => ({
	siteData: new MockSiteData(sitePath),
	sendIPCEvent: jest.fn(),
});

