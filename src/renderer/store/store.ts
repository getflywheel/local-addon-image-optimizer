import { useSelector, TypedUseSelectorHook } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { activeSiteIDSlice } from './activeSiteID';
import { preferencesSlice } from './preferences';
import { sitesSlice } from './sites';

export { selectors } from './selectors';

export const store = configureStore({
	reducer: {
		activeSiteID: activeSiteIDSlice.reducer,
		preferences: preferencesSlice.reducer,
		sites: sitesSlice.reducer,
	},
});

export const actions = {
	...activeSiteIDSlice.actions,
	...preferencesSlice.actions,
	...sitesSlice.actions,
};

type State = ReturnType<typeof store.getState>;
export const useStoreSelector = useSelector as TypedUseSelectorHook<State>;
export const useFancyAssSelector = useStoreSelector;
