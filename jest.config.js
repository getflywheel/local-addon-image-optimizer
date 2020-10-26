module.exports = {
	preset: 'ts-jest',
	setupFilesAfterEnv: ['jest-extended'],
	moduleNameMapper: {
		'^@getflywheel/local/main': '<rootDir>/src/test/mockLocalMain.ts',
	},
};
