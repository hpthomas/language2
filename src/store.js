import { createStore } from 'redux';
import Firebase from './Firebase';
import Wikipedia from './wikiTools/Wikipedia';

let defaultPrefs = {home:"en",away:"es"};

function mainReducer(state, action) {
	switch (action.type) {
		case 'LOGGED_IN':
			return {...state, user:action.payload}
		case 'LOGGED_OUT':
			return {...state, user:null}
		case 'GOT_PREFS':
			if (!action.payload || !action.payload.home || !action.payload.away) {
				// we've got invalid prefs! this is fine
				// they were set in old version with different names, or I deleted the database
				state.firebase.setPrefs(defaultPrefs);
				return {...state, prefs:defaultPrefs};
			}
			return {...state, prefs:action.payload};
		default:
			return state;
	}
}
function defaultState() {
	let firebase = new Firebase();
	let wikipedia = new Wikipedia(firebase);
	return {
		user: null,
		prefs: defaultPrefs,
		firebase: firebase,
		wikipedia: wikipedia
	}
}
export default createStore(
  mainReducer,
  defaultState() );
