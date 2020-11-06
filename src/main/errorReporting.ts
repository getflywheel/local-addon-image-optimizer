import * as LocalMain from '@getflywheel/local/main';
import fs from 'fs-extra';
import path from 'path';
import { ImageData } from '../types';
const packageJSON = fs.readJsonSync(path.join(__dirname, '../../package.json'));

const { localLogger } = LocalMain.getServiceContainer().cradle;

const logger = localLogger.child({
    thread: 'main',
    class: 'AddonImageOptimizer',
    addonName: packageJSON.name,
    addonVersion: packageJSON.version,
});

export const reportScanRequest = (siteID: string) => {
    logger.info(`Scanning REQUEST for site ${siteID}`);
}

export const reportScanSuccess = (siteID: string, imageCount: number) => {
    logger.info(`Scanning SUCCESS for site ${siteID}. Found ${imageCount} image(s).`);
}

export const reportScanFailure = (siteID: string, error: typeof Error) => {
    logger.error(`Scanning FAILURE for site ${siteID}. ${error}.`);
}

export const reportCompressRequest = (siteID: string) => {
    logger.info(`Compress REQUEST for site ${siteID}`);
}

export const reportCompressSuccess = (siteID: string, imageCount: number) => {
    logger.info(`Compress SUCCESS for site ${siteID}. Compressed ${imageCount} image(s).`);
}

export const reportCompressFailure = (siteID: string, error: typeof Error) => {
    logger.error(`Compress FAILURE for site ${siteID}. ${error}.`);
}

export const reportNoBinFound = (binaryPath: string) => {
	logger.error(`No binary found at ${binaryPath}`);
}

export const reportBinOutput = (imagePath: string, bin: string, output: string) => {
	logger.info(`[attempting to compress] ${imagePath} [using] ${bin} [ouput] ${output}`);
}
