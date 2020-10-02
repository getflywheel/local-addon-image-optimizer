import { SiteImageData } from "../types";

export interface RenderedImageData extends SiteImageData {
	selectAllFilesValue?: boolean;
	optimizationStatus?: OptimizerStatus;
	compressionListTotal?: number;
	compressionListCounter?: number;
	compressionListCompletionPercentage?: number;
	totalFileSizeDeductions?: string;
}

export enum OptimizerStatus {
	BEFORE = 'before',
	RUNNING = 'running',
	COMPLETE = 'complete'
}
