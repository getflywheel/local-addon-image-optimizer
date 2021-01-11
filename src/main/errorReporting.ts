import * as LocalMain from '@getflywheel/local/main';
import fs from 'fs-extra';
import path from 'path';

const packageJSON = !process.env.JEST_WORKER_ID
	? fs.readJsonSync(path.join(__dirname, '../../package.json'))
	: null;

const { localLogger } = LocalMain.getServiceContainer().cradle;

const logger = localLogger.child({
	thread: 'main',
	class: 'AddonImageOptimizer',
	addonName: packageJSON?.name,
	addonVersion: packageJSON?.version,
});

export const reportScanRequest = (siteID: string): void => {
	logger.info(`Scanning REQUEST for site ${siteID}`);
};

export const reportScanSuccess = (siteID: string, imageCount: number): void => {
	logger.info(`Scanning SUCCESS for site ${siteID}. Found ${imageCount} image(s).`);
};

export const reportScanFailure = (siteID: string, error: typeof Error): void => {
	logger.error(`Scanning FAILURE for site ${siteID}. ${error}.`);
};

export const reportCompressRequest = (siteID: string): void => {
	logger.info(`Compress REQUEST for site ${siteID}`);
};

export const reportCompressSuccess = (siteID: string, imageCount: number): void => {
	logger.info(`Compress SUCCESS for site ${siteID}. Compressed ${imageCount} image(s).`);
};

export const reportCompressFailure = (siteID: string, error: typeof Error): void => {
	logger.error(`Compress FAILURE for site ${siteID}. ${error}.`);
};

export const reportNoBinFound = (binaryPath: string): void => {
	logger.error(`No binary found at ${binaryPath}`);
};

export const reportBinOutput = (imagePath: string, bin: string, output: string): void => {
	logger.info(`[attempting to compress] ${imagePath} [using] ${bin} [ouput] ${output}`);
};

export const reportRestoreBackupFailure = (errorMessage: string): void => {
	logger.error(errorMessage);
};
