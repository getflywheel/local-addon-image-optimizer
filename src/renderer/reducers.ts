/**
 * This serves as the centralized point for all Redux store reducers
 */
import { PREFERENCES_REDUCER_ACTION_TYPES } from '../constants';

export const preferencesReducer = (state = {}, action) => {
	switch(action.type) {
		case PREFERENCES_REDUCER_ACTION_TYPES.META_DATA:
			return {
				...state,
				stripMetaData: action.payload
			};
		default:
			return state;
	};
};
