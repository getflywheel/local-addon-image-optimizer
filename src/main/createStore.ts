import {
	SiteImageData,
	CachedImageDataBySiteID,
	Store,
} from '../types';

export default function createStore(initialState: CachedImageDataBySiteID = {}): Store {
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
			return state[siteID] || ({} as SiteImageData);
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
		setStateBySiteID(siteID: string, newState: SiteImageData): void {
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
