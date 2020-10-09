import { createStore, combineReducers } from 'redux';
import * as LocalRenderer from '@getflywheel/local/renderer';
import { IPC_EVENTS } from '../constants';
import { Preferences } from '../types';
import { preferencesReducer } from './reducers'


const makeStore = async () => {
	const preferences: Preferences = await LocalRenderer.ipcAsync(
		IPC_EVENTS.READ_PREFERENCES_FROM_DISK
	);

	return createStore(
		combineReducers({ preferences: preferencesReducer }),
		{ preferences },
	);
};

export default makeStore;
