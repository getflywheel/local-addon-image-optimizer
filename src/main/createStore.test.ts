import 'jest-extended';

import { createStore } from './createStore';
import {
	CachedStateBySiteID,
	CombinedStateData
} from '../types';

describe('createStore', () => {
	let store;

	const siteIDOne = 1234;
	const siteIDTwo = 4321;
	const siteIDThree = 6789;

	const initialState: CachedStateBySiteID = {
		[siteIDOne]: {
			imageData: {},
		} as CombinedStateData,
	};

	const secondState: CachedStateBySiteID = {
		[siteIDTwo]: {} as CombinedStateData,
	};

	const thirdState: CachedStateBySiteID = {
		[siteIDThree]: {
			imageData: {},
			scanLoading: false,
			lastScan: 1601675284054,
			originalTotalSize: 120303,
			compressedTotalSize: 494,
			imageCount: 394,
		} as CombinedStateData,
	}

	beforeAll(() => {
		store = createStore(initialState);
	});

	it('getState returns a reference to the initially passed in data if the the store has not been updated yet', () => {
		expect(store.getState()).toEqual(initialState);
	});

	 it('getStateBySiteID returns a reference to the correct state', () => {
		 expect(store.getStateBySiteID(siteIDOne)).toEqual(initialState[siteIDOne]);
	 });

	 it('getStateBySiteID returns an empty object if the site id does not yet exist as a key on state', () => {
		 expect(store.getStateBySiteID(siteIDTwo)).toContainKeys([]);
	 });

	 it('setState creates a new object by merging the previous state with the next state', () => {
		store.setState(secondState);

		const state = store.getState();

		expect(state[siteIDOne]).toEqual(initialState[siteIDOne]);

		expect(state[siteIDTwo]).toEqual(secondState[siteIDTwo]);
	 });

	 it('setStateBySiteID merges in a new item to state if the siteID does not yet exist in state', () => {
		store.setStateBySiteID(siteIDThree, thirdState[siteIDThree]);

		expect(store.getStateBySiteID(siteIDOne)).toEqual(initialState[siteIDOne]);

		expect(store.getStateBySiteID(siteIDTwo)).toEqual(secondState[siteIDTwo]);

		const siteThreeState = store.getStateBySiteID(siteIDThree);

		expect(siteThreeState).toEqual(thirdState[siteIDThree]);

		expect(siteThreeState === thirdState[siteIDThree]).toBeFalse();
	 });

	 it('setStateBySiteID merges in new state to exising site data', () => {
		const newSiteThreeState = {
			lastScan: new Date(),
		};

		store.setStateBySiteID(siteIDThree, newSiteThreeState);

		const siteThreeState = store.getStateBySiteID(siteIDThree);

		expect(siteThreeState).not.toEqual(thirdState[siteThreeState]);

		expect(siteThreeState).toEqual({
			...thirdState[siteIDThree],
			...newSiteThreeState,
		});

		expect(siteThreeState.lastScan).not.toEqual(thirdState[siteIDThree].lastUpdated);
		expect(siteThreeState.lastScan).toEqual(newSiteThreeState.lastScan);
	 });
});
