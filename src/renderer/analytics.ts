import { ipcRenderer } from "electron";

const BASE = `v2_image_optimizer_`
const EVENT_LIFECYCLES = {
	START: `_start`,
	SUCCESS: `_success`,
	FAILURE: `_failure`,
	CANCEL: `_cancel`,
}

export const ANALYTIC_EVENT_TYPES = {
	SCAN_START: `${BASE}scan${EVENT_LIFECYCLES.START}`,
	SCAN_SUCCESS: `${BASE}scan${EVENT_LIFECYCLES.SUCCESS}`,
	SCAN_FAILURE: `${BASE}scan${EVENT_LIFECYCLES.FAILURE}`,
	SCAN_CANCEL: `${BASE}scan${EVENT_LIFECYCLES.CANCEL}`, // do not think this is a planned feature?
	OPTIMIZE_START: `${BASE}optimize${EVENT_LIFECYCLES.START}`,
	OPTIMIZE_SUCCESS: `${BASE}optimize${EVENT_LIFECYCLES.SUCCESS}`,
	OPTIMIZE_FAILURE: `${BASE}optimize${EVENT_LIFECYCLES.FAILURE}`,
	OPTIMIZE_CANCEL: `${BASE}optimize${EVENT_LIFECYCLES.CANCEL}`, // done
	OPTIMIZE_INCLUDE_ALL_FILES: `${BASE}include_all`, // done
	OPTIMIZE_EXCLUDE_ALL_FILES: `${BASE}exclude_all`, // done
	OPTIMIZE_INCLUDE_SINGLE_FILE: `${BASE}include`, // done
	OPTIMIZE_EXLUDE_SINGLE_FILE: `${BASE}exclude`, // done
	PREFERENCE_METADATA: `${BASE}preference_metadata` // done
}

export const reportAnalytics = (eventName: string, additionalProperties?: Object) => {
	const channel = 'analyticsV2:trackEvent';
	if (additionalProperties) {
		ipcRenderer.send(channel, eventName, additionalProperties);
		console.log(channel, eventName, additionalProperties);
	} else {
		ipcRenderer.send(channel, eventName);
		console.log(channel, eventName);
	}
}
