import { createStore } from 'redux';
import Firebase from './Firebase';

let defaultPrefs = {home:"en",learning:"es"};

function mainReducer(state, action) {
	switch (action.type) {
		case 'LOGGED_IN':
			return {...state, user:action.payload}
		case 'LOGGED_OUT':
			return {...state, user:null}
		case 'GOT_PREFS':
			console.log('got prefs');
			if (!action.payload || !action.payload.home || !action.payload.learning) {
				console.log('BAD ONES!');
				// we've got invalid prefs! this is fine
				// they were set in old version with different names, or I deleted the database
				state.firebase.setPrefs(defaultPrefs);
				return {...state, prefs:defaultPrefs};
			}
			return {...state, prefs:action.payload};
		default:
			return state
	}
}
function defaultState() {
	return {
		user: null,
		prefs: defaultPrefs,
		firebase: new Firebase()
	}
}
export default createStore(
  mainReducer,
  defaultState() );
