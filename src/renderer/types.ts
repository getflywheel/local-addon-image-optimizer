import { SiteImageData } from "../types";

export interface RenderedImageData extends SiteImageData {
	selectAllFilesValue?: boolean;
	isCurrentlyOptimizing?: boolean;
	compressionListTotal?: number;
	compressionListCounter?: number;
	compressionListCompletionPercentage?: number;
}
