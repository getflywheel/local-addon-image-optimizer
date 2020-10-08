import {
	CombinedStateData,
	CachedStateBySiteID,
	Store, CancelCompression, RuntimeStore
} from '../types';

export function createStore(initialState: CachedStateBySiteID = {}): Store {
	let state = initialState;

	return {
		/**
		 * returns the current state
		 */
		getState(): CachedStateBySiteID {
			return state;
		},

		/**
		 * Get the state for a particular site or default to en empty object if it does not yet exist
		 *
		 * @param siteID
		 */
		getStateBySiteID(siteID: string): CombinedStateData {
			return state[siteID] || ({} as CombinedStateData);
		},

		/**
		 * Merges in new state with existing state
		 *
		 * @param update new state
		 */
		setState(newState: CachedStateBySiteID): void {
			state = {
				...state,
				...newState,
			};
		},

		/**
		 * Merges in new CombinedStateData with existing CombinedStateData or
		 * creates a new entry for that CombinedStateData
		 *
		 * @param siteID
		 * @param newState
		 */
		setStateBySiteID(siteID: string, newState: CombinedStateData): void {
			state = {
				...state,
				[siteID]: {
					...(state[siteID] || {} as CombinedStateData),
					...newState,
				}
			};
		},
	};
}

export function createRuntimeStore(initialState: CancelCompression = {cancelCompression: true}): RuntimeStore {
	let state = initialState;
	return {
		/**
		 * returns the current state
		 */
		getState(): CancelCompression {
			return state;
		},

		/**
		 * Merges in new state with existing state
		 *
		 * @param update new state
		 */
		setState(newState: CancelCompression) {
			state = {
				...state,
				...newState,
			};
		},
	};
}
