import {
	SiteImageData,
	CachedImageDataBySiteID,
	Store,
	RuntimeData,
	RuntimeStore,
} from '../types';

export function createStore(initialState: CachedImageDataBySiteID = {}): Store {
	let state = initialState;

	return {
		/**
		 * returns the current state
		 */
		getState(): CachedImageDataBySiteID {
			return state;
		},

		/**
		 * Get the state for a particular site or default to en empty object if it does not yet exist
		 *
		 * @param siteID
		 */
		getStateBySiteID(siteID: string): SiteImageData {
			return state[siteID] || ({ imageData: {}} as SiteImageData);
		},

		/**
		 * Merges in new state with existing state
		 *
		 * @param update new state
		 */
		setState(newState: CachedImageDataBySiteID): void {
			state = {
				...state,
				...newState,
			};
		},

		/**
		 * Merges in new SiteImageData with existing SiteImageData or
		 * creates a new entry for that SiteImageData
		 *
		 * @param siteID
		 * @param newState
		 */
		setStateBySiteID(siteID: string, newState: Partial<SiteImageData>): void {
			state = {
				...state,
				[siteID]: {
					...(state[siteID] || {} as SiteImageData),
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
