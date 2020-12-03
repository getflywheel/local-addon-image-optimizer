import {
	SiteData,
	SiteDataBySiteID,
	Store,
	RuntimeData,
	RuntimeStore,
} from '../types';

/**
 * @todo rename this to imageDataStore
 */
export function createStore(initialState: SiteDataBySiteID = {}): Store {
	let state = initialState;

	return {
		/**
		 * returns the current state
		 */
		getState(): SiteDataBySiteID {
			return state;
		},

		/**
		 * Get the state for a particular site or default to en empty object if it does not yet exist
		 *
		 * @param siteID
		 */
		getStateBySiteID(siteID: string): SiteData {
			return state[siteID] || ({ imageData: {}} as SiteData);
		},

		/**
		 * Merges in new state with existing state
		 *
		 * @param update new state
		 */
		setState(newState: SiteDataBySiteID): void {
			state = {
				...state,
				...newState,
			};
		},

		/**
		 * remove a site by id
		 *
		 * @param siteID
		 */
		deleteSiteData(siteID) {
			delete state[siteID];
		},

		/**
		 * Merges in new SiteData with existing SiteData or
		 * creates a new entry for that SiteData
		 *
		 * @param siteID
		 * @param newState
		 */
		setStateBySiteID(siteID: string, newState: Partial<SiteData>): void {
			state = {
				...state,
				[siteID]: {
					...(state[siteID] || {} as SiteData),
					...newState,
				}
			};
		},
	};
}

export function createRuntimeStore(initialState: RuntimeData = {}): RuntimeStore {
	let state = initialState;
	return {
		/**
		 * returns the current state
		 */
		getState() {
			return state;
		},

		/**
		 * get the current state by siteID
		 *
		 * @param siteID
		 */
		getStateBySiteID(siteID) {
			return state[siteID] || {};
		},

		/**
		 * set if a compression process should be canceled
		 *
		 * @param siteID
		 * @param cancelCompression
		 */
		setCancelCompressionBySiteID(siteID, cancelCompression) {
			if (!state[siteID]) {
				state[siteID] = {}
			}

			state[siteID].cancelCompression = cancelCompression;
		}
	};
}
