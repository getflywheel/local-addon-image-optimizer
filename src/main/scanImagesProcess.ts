import fs from 'fs-extra';
import { getImageFilePaths, getImageIfCompressed, getFileHash } from './utils';
import { SiteData } from '../types';

export const scanImages = async (payload) => {
	const { webRoot } = payload;
	const filePaths = await getImageFilePaths(webRoot);

	return filePaths;
};

export const getImageStats = async (payload) => {
	const { filePaths, imageData } = payload;

	return await filePaths.reduce(async (
		imageDataAccumulator: Promise<SiteData['imageData']>,
		filePath: string,
	) => {
		const fileSize = fs.statSync(filePath).size;

		const fileHash = await getFileHash(filePath);

		let compressedImage = getImageIfCompressed(fileHash, imageData)
		if (compressedImage) {
			return {
				...(await imageDataAccumulator),
				[compressedImage.originalImageHash]: compressedImage,
			}
		}

		return {
			...(await imageDataAccumulator),
			[fileHash]: {
				originalImageHash: fileHash,
				filePath,
				originalSize: fileSize,
			},
		};
	}, Promise.resolve({})) as SiteData['imageData'];
};

function processSafeSend(name) {
	return (payload?) => {
		process.send?.({ name, payload });
	};
}

process.on('message', async (message: {name: string, payload: unknown}) => {
	const { name, payload } = message;
	const reply = processSafeSend(name);

	if (name === 'get-file-paths') {
		reply(await scanImages(payload));
	}

	if (name === 'get-image-stats') {
		reply(await getImageStats(payload));
	}
});
