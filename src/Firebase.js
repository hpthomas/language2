/* Singleton to interface with firebase - kept in redux store */
import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';
import 'firebase/functions';
import store from './store';
var firebaseConfig = {
    apiKey: "AIzaSyA-nW21JGoMUfz5JyI5cFQiJL8_9etUXBw",
    authDomain: "react-language.firebaseapp.com",
    databaseURL: "https://react-language.firebaseio.com",
    projectId: "react-language",
    storageBucket: "",
    messagingSenderId: "624932585997",
    appId: "1:624932585997:web:14319ed2f1ff3514"
};

class Firebase {
	constructor() {
		app.initializeApp(firebaseConfig);
		this.auth = app.auth();
		this.db = app.database();
		this.functions = app.functions();
		window.auth=this.auth;
		// catch if user is logged in already on initial page load
		this.unsub = this.auth.onAuthStateChanged(user=>{
			if (user) {
				store.dispatch({type:'LOGGED_IN', payload:user});
				this.getPrefs().then(res=>{
					let prefs = res.val();
					if (prefs) {
						store.dispatch({type:'GOT_PREFS', payload:prefs});
					}
				});
			}
			this.unsub(); //unsubscribe to auth change - only want this to run once 
		});
	}

	email() {
		return this.auth.currentUser ? this.auth.currentUser.email : null;
	}

	createUser = (email, pass) => {
		return this.auth.createUserWithEmailAndPassword(email,pass);
	}

	login = (email, pass)=> {
		if (!email || !pass) {
			return this.auth.signInAnonymously();
		}
		return this.auth.signInWithEmailAndPassword(email, pass);
	}

	logOut = ()=> {
		return this.auth.signOut();
	}

	resetPass = (email) => {
		return this.auth.sendPasswordResetEmail(email);
	}

	updatePass = (newPass) => {
	    return this.auth.currentUser.updatePassword(newPass);
	}
	getPrefs = () => {
		if (!this.auth.currentUser) return null;
		return this.db.ref('/users/' + this.auth.currentUser.uid + '/prefs').once('value');
	}
	setPrefs = (newPrefs) => {
		if (!this.auth.currentUser) return null;
		let prefs = this.db.ref('/users/' + this.auth.currentUser.uid + '/prefs');
		prefs.update(newPrefs);
	}
	translate = (text, source, target) => {
		let params = {text: text, source:source, target:target};
		return this.functions.httpsCallable('translate')(params);
	}
	setArticleRecs = (newRecs) => {
		this.db.ref('/article_recs').update(newRecs);
	}
	getArticleRecs = (lang) => {
		return this.db.ref('/article_recs/' + lang).once('value');
	}
	getArticleRevision = (term, lang) => {
		let safe_name = this.makeKeySafeName(term);
		return this.db.ref('/article_revisions/' + lang + '/' + safe_name).once('value')
		.then(thing=>{
			return thing;
		})
	}
	setArticleRevision = (term, lang, revision) => {
		let safe_name = this.makeKeySafeName(term);
		let update = {[safe_name]:revision};
		return this.db.ref('/article_revisions/' + lang).update(update);
	}

	getUserArticleHistory = (term,lang) => {
		if (!this.auth.currentUser) return Promise.resolve(null);
		let safe_name = this.makeKeySafeName(term);
		let path = '/users/' + this.auth.currentUser.uid + '/articleHstories/' + lang + '/' + safe_name;
		return this.db.ref(path).once('value');
	}
	setUserArticleHistorySection(term, lang, sectionIndex, status) {
		if (!this.auth.currentUser) return Promise.resolve(null);
		let safe_name = this.makeKeySafeName(term);
		let path = '/users/' + this.auth.currentUser.uid + '/articleHstories/' + lang + '/' + safe_name;
		let update = {[sectionIndex]:status};
		return this.db.ref(path).update(update);
	}
	makeKeySafeName(term) {
		// strip out dot, hash, dollar, brackets 
 		let re =  /(\.|\$|\[|\]|#)/g ;
		return term.replace(re,'');
	}
}
export default Firebase;
