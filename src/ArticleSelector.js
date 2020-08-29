/* ARTICLE SELECTOR
This is an input with auto-complete which suggests articles we know to exist in all languages.
User types in their home lang and the corresponding suggestion is displayed in their goal lang.

TODO: 
-Grey out search button if user is types in home language - 
-Article links should point to /read/<articleName> 
*/

import React from 'react';
import {connect} from 'react-redux';
import ArticleReader from './ArticleReader';
import {v4 as uuid} from 'uuid';
import {abbrToName} from './Languages';

class ArticleSelector extends React.Component{
	constructor(props) {
		super(props);
		let available_articles = {};
		this.state = {
			homeSearch:"",
			awaySearch:"",
			suggestions:[],
			available_articles:{},
			both_lang_suggestions:false,
			finalTerm: null
		}
	}
	toggleBothLangs() {
		this.setState({both_lang_suggestions: !this.state.both_lang_suggestions})
	}

	componentDidUpdate(prevProps, prevState) {
		console.log('update to selector');
		if (this.props.prefs != prevProps.prefs){
			let home = this.props.prefs.home;
			let away = this.props.prefs.away;
			this.setState({homeSearch:'',awaySearch:'',suggestions:'', finalTerm:null})
			if (!this.state.available_articles[home] || !this.state.available_articles[away]) {
				this.getRecs(home, away);
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
		this.setState({[event.target.name]:event.target.value});
		let lang, other;
		if (event.target.name == 'homeSearch') {
			lang = this.props.prefs.home;
			other = this.props.prefs.away;
		}
		else {
			lang = this.props.prefs.away;
			other = this.props.prefs.home;
		}

		if (!this.state.available_articles[lang]) {
			return; // we're still waiting on available_articles from server
		}
		let results = [];
		let guess = event.target.value;
		while (results.length < 1) {
			if (guess.length <1) {
				break;
			}
			let available_articles = this.state.available_articles[lang].filter(s=>{
				return s.toLowerCase().indexOf(guess.toLowerCase()) > -1 
				&& !results.includes(s);
			});
			results.push(...available_articles);
			guess = guess.substring(0,guess.length-1);
		}
		// we only store suggestions is user's away language
		// if we're finding recs from a home-lang search, find and store corresponding away-lang titles
		if (lang==this.props.prefs.home) {
			results = results.map(home_title => {
				let index = this.state.available_articles[lang].indexOf(home_title);
				return this.state.available_articles[this.props.prefs.away][index];
			})
		}
		this.setState({suggestions:results});
	}
	searchWiki(term) {
		if (!term) {
			term = this.state.awaySearch;
		}
		this.setState({finalTerm:term})
	}
	readerLink(away, home) {
		let linkContent = away;
		if (home) {
			linkContent += "  (" + home +  ")";
		}
		return <a href="#" onClick={(e)=>this.onReaderLinkClick(e,away)}>{linkContent}</a>
	}
	getReaderLinks() {
		let home = this.props.prefs.home;
		let away = this.props.prefs.away;
		let suggestions = this.state.suggestions;
		if (!suggestions || suggestions.length < 1) {
			// there are no suggestions - user has not searched anything
			// TODO show most popular articles, or random choices
			return this.readerLink('Chicago')
		}
		let link_count = 5;
		let titles = suggestions.slice(0,link_count);
		let links = titles.map(title => {
			if (!this.state.both_lang_suggestions) {
				return <li key={uuid()}>{this.readerLink(title,null)}</li>;
			}
			else {
				// we have to find corresponding home-language title
				let index = this.state.available_articles[away].indexOf(title);
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
				value={this.state.awaySearch}
				onChange={this.change.bind(this)} 
				placeholder={"search in " + abbrToName[this.props.prefs.away]}
				className='search_input' 
				name='awaySearch' 
				autoComplete="off"
				type='text' />
				<button onClick={(ev)=>this.searchWiki()}>search</button>
				show home language suggestions:
				<input type='checkbox' defaultChecked={false} onChange={this.toggleBothLangs.bind(this)} />
			</div>

			{this.getReaderLinks()}
			<ArticleReader term = {this.state.finalTerm} />
		</div>);
	}
}
let mstp = (state) => ({prefs:state.prefs, firebase:state.firebase, wikipedia:state.wikipedia});
export default connect(mstp)(ArticleSelector);