/**
 * @todo prune out the unused redux deps once this is done
 */
import { createStore, combineReducers } from 'redux';
import { useSelector, TypedUseSelectorHook } from 'react-redux';
import {
	configureStore,
	createAction,
	createSlice,
	PayloadAction,
} from '@reduxjs/toolkit';

import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from '../constants';
import { Preferences } from '../types';
import { preferencesReducer } from './reducers';


const preferencesSlice = createSlice({
	name: 'preferences',
	initialState: {} as Preferences,
	reducers: {
		stripMetaData: (state, action: PayloadAction<boolean>) => {
			state.stripMetaData = action.payload;
		},
		hydrate: (_, action: PayloadAction<Preferences>) => {
			return action.payload;
		},

	},
});

export const store = configureStore({
	reducer: {
		preferences: preferencesSlice.reducer,
		example: createSlice({
			name: `Example001`,
			initialState: {
				count: 1,
			},
			reducers: {},
		}).reducer,
	}
});

export const actions = {
	preferences: preferencesSlice.actions,
};

type State = ReturnType<typeof store.getState>;

// type FirstArgument<T> = T extends (arg1: infer U, ...args: any[]) => any ? U : any;
type FirstArgument<T> = T extends (arg1: State) => any ? State : any;
type CB = (state: State) => Partial<State>;

export const useStoreSelector: ReturnType<FirstArgument<useSelector>> = useSelector as CB;
