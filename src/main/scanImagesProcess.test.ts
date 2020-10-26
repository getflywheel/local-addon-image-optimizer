
jest.mock('fs-extra');
fs.statSync.mockImplementation((filePath: string) => ({
	size: Math.floor(Math.random() * 99999) + 700
}));


const mockFilePaths = [
	'fake/path/file1.jpeg',
	'fake/path/file2.jpeg',
];

// mock out utils so that we don't accidentally make calls to fs, etc.
// also this makes assertions much easier and utils should be tested independantly anyways
jest.mock('./utils');
const utils = require('./utils');
utils.getImageFilePaths.mockImplementation(() => {
	return mockFilePaths;
});
utils.getFileHash.mockImplementation((filePath) => {
	return md5(filePath);
});

it('calls getImageFilePaths once with the correct args', () => {
	expect(utils.getImageFilePaths.mock.calls).toBeArrayOfSize(1);

	expect(utils.getImageFilePaths.mock.calls[0][0]).toEqual(
		serviceContainer.siteData.getSite.mock.results[0].value.paths.webRoot
	);
});

it('calls getFileHash once for each file ', () => {
	const { mock } = utils.getFileHash;
	expect(mock.calls).toBeArrayOfSize(mockFilePaths.length);
	expect(mock.calls.map(call => call[0])).toIncludeSameMembers(mockFilePaths);
});

