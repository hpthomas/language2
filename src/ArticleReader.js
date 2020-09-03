/* ARTICLE READER 
This component is given an article name and the languages as props. 
It fetches the article and displays it.
*/
import React from 'react';
import WikiSectionReader from './WikiSectionReader';
import {connect} from 'react-redux';
import {v4 as uuid} from 'uuid';

class ArticleReader extends React.Component{
	constructor(props) {
		super(props);
		this.state = {term:null,items:this.props.items, userArticleHistory:null};
	}

	// listen for state changes
	// if items is new, update everything and fetch new results
	componentDidUpdate() {
		// if term has changed, fetch the new article and the user's history
		if (this.props.term !== this.state.term) {

			this.setState({term:this.props.term,items:[]});
			if (!this.props.term) {
				return; // don't search wiki for null if term was cleared
			}
	        this.props.wikipedia.getWikiArray(this.props.term, this.props.prefs.away)
	            .then(arr => this.setState({items: arr}));

	        this.props.firebase.getUserArticleHistory(this.props.term, this.props.prefs.away)
	        	.then(res=>res ? res.val() : [])
	        	.then(history=> this.setState({userArticleHistory:history}));
		}
	}
	// save section update to firebase and update local state so UI is updated right away
	updateSectionHistory(index, status) {
		let term = this.state.term;
		let lang = this.props.prefs.away;
		this.props.firebase.setUserArticleHistorySection(term, lang, index, status);
		let newHist = {...this.state.userArticleHistory};
		newHist[index] = status;
		this.setState({userArticleHistory:newHist});
	}
	completionStats(historyObject, items) {
		if (!historyObject || !items) {
			return '';
		}
		//TODO make this a utility method and use for user page
		let complete_sections = Object.keys(historyObject)
			.filter(sectionID => historyObject[sectionID]=='done');
		let percent_complete = complete_sections.length / items.length;
		let formatted_percent_complete = 
			percent_complete.toLocaleString(undefined, {style:'percent',minimumFractionDigits:2});

		let translated_sections = Object.keys(historyObject)
			.filter(sectionID => historyObject[sectionID]=='translated');
		let percent_translated = translated_sections.length / items.length;
		let formatted_percent_translated = 
			percent_translated.toLocaleString(undefined, {style:'percent',minimumFractionDigits:2});

		return `${formatted_percent_complete} complete, ${formatted_percent_translated} translated`;
	}
	render() {
		// in case we have no histories yet, use empty object
		let history = this.state.userArticleHistory || {};
		let complete_message = this.completionStats(history, this.state.items);
		return (!this.state.items)? null : 
		( 
			<ul className="">
				<li>
					<h2>{this.state.term}</h2>
					<h3>{complete_message}</h3>
				</li>
			{this.state.items.map((item,index) => 
				<li key={index} className="">
					<WikiSectionReader 
						data={item} 
						section_index={index} 
						status = {history[index]}
						updateStatus={this.updateSectionHistory.bind(this, index)}/>
				</li>
			)}
			</ul>
		);
	}
}
function mstp(state) {
	return {firebase:state.firebase, wikipedia:state.wikipedia, prefs:state.prefs};
}
export default connect(mstp)(ArticleReader);