/* ARTICLE SELECTOR
This is an input with auto-complete which suggests articles we know to exist in all languages.
User types in their home lang and the corresponding suggestion is displayed in their goal lang.

TODO: 
-Grey out search button if user is types in home language - 
-Article links should point to /read/<articleName> 
*/

import React from 'react';
import {connect} from 'react-redux';
import Wikipedia from './wikiTools/Wikipedia';
import ArticleReader from './ArticleReader';
import {v4 as uuid} from 'uuid';
import {abbrToName} from './Languages';

class ArticleSelector extends React.Component{
	constructor(props) {
		super(props);
		let available_articles = {};
		this.state = {
			homeSearch:"",
			learningSearch:"",
			suggestions:[],
			available_articles:{},
			results:null,
			both_lang_suggestions:false
		}
	}
	toggleBothLangs() {
		this.setState({both_lang_suggestions: !this.state.both_lang_suggestions})
	}
	componentDidUpdate(a) {
		if (this.props.prefs){
			let home = this.props.prefs.home;
			let learning = this.props.prefs.learning;
			if (!this.state.available_articles[home] || !this.state.available_articles[learning]) {
				// TODO we might already have one, don't need to fetch both every time
				// but this rarely runs
				this.getRecs(home, learning);
			}
		}
	}
	getRecs(lang, lang2){
		this.props.firebase.getArticleRecs(lang)
		.then(res=>{
			let available_articles = res.val();
			let oldRecs = this.state.available_articles;
			let newRecs = {[lang]:available_articles}
			this.setState(Object.assign(oldRecs,newRecs));
		});

		if (!lang2) {
			return;
		}

		this.props.firebase.getArticleRecs(lang2)
		.then(res=>{
			let available_articles = res.val();
			let oldRecs = this.state.available_articles;
			let newRecs = {[lang2]:available_articles}
			this.setState(Object.assign(oldRecs,newRecs));
		});
	}

	change(event) {
		console.log('set ' + event.target.name + ' to ' + event.target.value);
		this.setState({[event.target.name]:event.target.value});
		let lang, other;
		if (event.target.name == 'homeSearch') {
			lang = this.props.prefs.home;
			other = this.props.prefs.learning;
		}
		else {
			lang = this.props.prefs.learning;
			other = this.props.prefs.home;
		}

		if (!this.state.available_articles[lang]) {
			console.log(this.state);
			return; // we're still waiting on available_articles from server
		}
		let results = [];
		let guess = event.target.value;
		while (results.length < 1) {
			console.log('Guess: ',guess);
			if (guess.length <1) {
				break;
			}
			let available_articles = this.state.available_articles[lang].filter(s=>{
				return s.toLowerCase().indexOf(guess.toLowerCase()) > -1 
				&& !results.includes(s);
			});
			console.log('available_articles:',available_articles);
			results.push(...available_articles);
			guess = guess.substring(0,guess.length-1);
		}
		// we only store suggestions is user's learning language
		// if we're finding recs from a home-lang search, find and store corresponding learning-lang titles
		if (lang==this.props.prefs.home) {
			results = results.map(home_title => {
				let index = this.state.available_articles[lang].indexOf(home_title);
				return this.state.available_articles[this.props.prefs.learning][index];
			})
		}
		this.setState({suggestions:results});
	}
	searchWiki(term) {
		if (!term) {
			term = this.state.learningSearch;
		}
		console.log(term);
        Wikipedia.getWikiArray(term, this.props.prefs.learning)
            .then(arr => this.setState({results: arr}));
	}
	readerLink(learning, home) {
		let linkContent = learning;
		if (home) {
			linkContent += "  (" + home +  ")";
		}
		console.log(home, linkContent);
		return <a href="#" onClick={(e)=>this.onReaderLinkClick(e,learning)}>{linkContent}</a>
	}
	getReaderLinks() {
		let home = this.props.prefs.home;
		let learning = this.props.prefs.learning;
		let suggestions = this.state.suggestions;
		if (!suggestions || suggestions.length < 1) {
			// there are no suggestions - user has not searched anything
			// TODO show most popular articles, or random choices
			return this.readerLink('chicago')
		}
		let link_count = 5;
		let titles = suggestions.slice(0,link_count);
		console.log(titles);
		let links = titles.map(title => {
			if (!this.state.both_lang_suggestions) {
				return <li key={uuid()}>{this.readerLink(title,null)}</li>;
			}
			else {
				// we have to find corresponding home-language title
				let index = this.state.available_articles[learning].indexOf(title);
				let home_title = this.state.available_articles[home][index];
				return <li key={uuid()}>{this.readerLink(title, home_title)}</li>;
			}
		})
		return <ul className="article_links">{links}</ul>
	}
	onReaderLinkClick(e,term) {
		e.preventDefault();
		this.searchWiki(term);
	}
	render() {
		console.log(this.state.both_lang_suggestions);
		if (!this.props.prefs) return <div>I don't know what languages you're working with!</div>;
		return (
		<div>
			<div>
				Read about
				<input 
				value={this.state.homeSearch}
				onChange={this.change.bind(this)} 
				placeholder={"search in " + abbrToName[this.props.prefs.home]}
				className='search_input' 
				name='homeSearch'
				autoComplete="off"
				type='text' />

				<input
				value={this.state.learningSearch}
				onChange={this.change.bind(this)} 
				placeholder={"search in " + abbrToName[this.props.prefs.learning]}
				className='search_input' 
				name='learningSearch' 
				autoComplete="off"
				type='text' />
				<button onClick={(ev)=>this.searchWiki()}>search</button>
				show home language suggestions:
				<input type='checkbox' defaultChecked={false} onChange={this.toggleBothLangs.bind(this)} />
			</div>

			{this.getReaderLinks()}
			<ArticleReader items = {this.state.results} />
		</div>);
	}
}
let mstp = (state) => ({prefs:state.prefs, firebase:state.firebase});
export default connect(mstp)(ArticleSelector);