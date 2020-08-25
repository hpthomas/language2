/* ARTICLE SELECTOR
This is an input with auto-complete which suggests articles we know to exist in all languages.
User types in their home lang and the corresponding suggestion is displayed in their goal lang.

*/
import React from 'react';
import {connect} from 'react-redux';

class ArticleSelector extends React.Component{
	constructor(props) {
		super(props);
		let suggestions = {};
		this.state = {homeSearch:"",learningSearch:"",suggestions:{}}
	}
	componentDidUpdate(a) {
		console.log('did update');
		if (this.props.prefs) {
			let home = this.props.prefs.home;
			let learning = this.props.prefs.learning;
			if (!this.state.suggestions[home] || !this.state.suggestions[learning]) {
				console.log('getting for',this.props.prefs,home,learning)
				console.log('(already have:)',this.state.suggestions);
				this.getRecs(home, learning);
			}
			else {
				console.log('nothing to do')
			}
		}
	}
	getRecs(lang, lang2){
		this.props.firebase.getArticleRecs(lang)
		.then(res=>{
			let suggestions = res.val();
			let oldRecs = this.state.suggestions;
			let newRecs = {[lang]:suggestions}
			this.setState(Object.assign(oldRecs,newRecs));
		});

		if (!lang2) {
			return;
		}

		this.props.firebase.getArticleRecs(lang2)
		.then(res=>{
			let suggestions = res.val();
			let oldRecs = this.state.suggestions;
			let newRecs = {[lang2]:suggestions}
			this.setState(Object.assign(oldRecs,newRecs));
		});
	}

	change(event) {
		console.log('a change');
		this.setState({[event.target.name]:event.target.value});
		let lang;
		if (event.target.name == 'homeSearch') {
			lang = this.props.prefs.home;
		}
		else {
			lang = this.props.prefs.learning;
		}

		if (!this.state.suggestions[lang]) {
			console.log(this.state);
			return; // we're still waiting on suggestions from server
		}
		let results = [];
		let guess = event.target.value;
		while (results.length < 1) {
			console.log('Guess: ',guess);
			if (guess.length <1) {
				break;
			}
			let suggestions = this.state.suggestions[lang].filter(s=>{
				return s.toLowerCase().indexOf(guess.toLowerCase()) > -1 
				&& !results.includes(s);
			});
			console.log('suggestions:',suggestions);
			results.push(...suggestions);
			guess = guess.substring(0,guess.length-1);
		}
		console.log(results);

	}
	render() {
		if (!this.props.prefs) return <div>I don't know what languages you're working with!</div>;
		return (
		<div>
			<div>
				Read about
				<input 
				value={this.state.homeSearch}
				onChange={this.change.bind(this)} 
				className='search_input' 
				name='homeSearch' 
				type='text' />
				<input 
				value={this.state.learningSearch}
				onChange={this.change.bind(this)} 
				className='search_input' 
				name='learningSearch' 
				type='text' />
			</div>
		</div>);
	}
}
let mstp = (state) => ({prefs:state.prefs, firebase:state.firebase});
export default connect(mstp)(ArticleSelector);