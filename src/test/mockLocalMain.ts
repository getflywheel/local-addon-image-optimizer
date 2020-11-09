export const ServiceContainer = {
	cradle: {
		localLogger: { child: jest.fn() },
		userData: {
			get: jest.fn(() => ({ a: 'brian eno' })),
			set: jest.fn(),
		},
	},
};

export const getServiceContainer = () => ServiceContainer;

export const workerFork = jest.fn();

export const childProcessMessagePromiseFactory = () => async (name: string, payload?: any) => {
	if (name === 'get-file-paths') {
		return [
			'fake/path/file1.jpeg',
			'fake/path/file2.jpeg',
		]
	}

	if (name === 'get-image-stats') {
		return {
			'aoeuaoeuaoeuaou': {
				originalImageHash: 'aoeuaoeuaoeuaou',
				compressedImageHash: 'snthsnthsnthstnh',
				filePath: 'fake/path/file1.jpeg',
				originalSize: 10000000,
				compressedSize: 5000000,
				fileStatus: 'succeeded',
				isChecked: true,
			},
			'yfyfyfyfyfyfyfyfy': {
				originalImageHash: 'yfyfyfyfyfyfyfyfy',
				compressedImageHash: 'hdhdhdhdhdhdhdhdhd',
				filePath: 'fake/path/file2.jpeg',
				originalSize: 7000000,
				compressedSize: 3500000,
				fileStatus: 'succeeded',
				isChecked: true,
			}
		}
	}
	return []
};
