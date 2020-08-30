import React from 'react';
import {v4 as uuid} from 'uuid';
import {topArticles} from './topArticles';
import LinkSelector from '../LinkSelector';
import {connect} from 'react-redux';

let languages = ["fr", "de", "es",  "ru", "it", "zh", "pt", "ar", "fa"];
class AdminWikiTools extends React.Component {
	constructor(props){ 
		super();
		let articles = topArticles();
		articles = articles.slice(0,1000);
		articles = articles.map (link => 
			({
				url: link,
				name: link.substring(30,link.length).replace(/_/g,' '),
				langs: Object.fromEntries(languages.map(l=>[l,null])),
				all:false,
			}));
		console.log('SET ARTICLES TO:');
		console.log(articles);
		this.state = {articles:articles, selected:null, recs:null};
	}
	// This is where we request wikipedia languages and parse the results
	componentDidMount() {
		let promises = this.state.articles
			.map(link=>this.props.wikipedia.getLangAvails(link.name)
			.then(res=>res.json()));

		Promise.all(promises)
		.then(responses=>{
			return responses.map(response=>{
			    try {
			        let page = response['query']['pages'];
			        let res =  page[Object.keys(page)[0]]['langlinks'];
					return res;
			    }
			    catch (error) {
			    	return null;
			    }
			});
		})
		.then(langdata=>{
			let articles = this.state.articles.slice(0);
			// for each article
			for (var i = 0; i < langdata.length;i++) {
				// if links to other language versions are present for article
				if (langdata[i]){
					// read lang links into array of [language,article name in language]
					let article_names =  langdata[i].map(l=>[l.lang,l['*']])
					// turn article_names into dict of {lang:name}
					let langs_for_article = Object.fromEntries(article_names);

					// save into articles array with count of lang availability
					let count=0;
					for (var l = 0; l<languages.length; l++){
						let lang = languages[l]
						if (langs_for_article[lang]) {
							articles[i].langs[lang]=langs_for_article[lang];
							count+=1;
						}
					}
					articles[i].all = (count === languages.length);
				}
			}
			this.setState(({articles:articles}));
		})

	}
	changeSelection(target) {
		this.setState({selected:target});
	}
	render() {
		let links=  this.state.articles.slice(0,50);
		//console.log(this.state);window.s=this.state;
		return (
			<div className="adminWikiTools"> 
				<h1>Admin Tools</h1>
				<div className='gridParent'>
					<div className='links'>
						<h2>Links</h2>
						<LinkSelector selected={this.state.selected} options={['Top 25','All']} change={this.changeSelection.bind(this)} />
						<table>
						<tbody>
							<tr>
								<td>Article</td>
								{languages.map(lang=><td key={uuid()}>{lang}</td>)}
								<td>All Languages</td>
							</tr>

						{
							links.map(link=>
								<tr key={uuid()}>
									<td>
										<a href={link.url}>{link.name}</a>
									</td>
									{languages.map(lang=>
										<td key={uuid()}><LinkToArticle lang={lang} name={link.langs[lang] || '-'}/></td>
										)}
									<td>{link.all?"Yes":"-"}</td>
								</tr>
							)
						}
						</tbody>
						</table>
					</div>
					<div className='selections'>
						<h2> Reccomended Articles</h2>
						<button onClick={this.populateRecs.bind(this)}>Populate from Languages </button>
						<button onClick={this.saveRecs.bind(this)}> Save </button>
						{this.state.recs?
							<table>
							<tbody>
								<tr>
									<td>Article (en)</td>
									<td>Available in</td>
								</tr>
								{this.state.recs.map(rec=>
									<tr key={uuid()}>
										<td>{rec.englishName}</td>
										<td>{Object.keys(rec.langs).length===languages.length?"Y":"N"}</td>
									</tr> )
								}
							</tbody>
							</table> 
							: null
						}
					</div>
				</div>
			</div>
		);
	}
	saveRecs() {
		let recs = this.state.recs;
		let result = {'en':[]};
		result['en'] = recs.map(rec=>rec.englishName);
		languages.forEach(language=>{
			result[language] = recs.map(rec=>rec.langs[language]);
		})
		//console.log(result);
		this.props.firebase.setArticleRecs(result);
	}
	populateRecs() {
		let guesses = this.state.articles.filter(a => a.all)
		.map(a => ({
			englishName:a.name,
			langs:a.langs
		}));
		this.setState({recs:guesses});
	}
}
let LinkToArticle = (props) => {
	if (props.name==='-') return <span>-</span>
	let url = "https://" + props.lang + ".wikipedia.org/wiki/" + encodeURIComponent(props.name);
	return <a href={url}>{props.lang}</a>
}

let mstp = (state) => ({firebase:state.firebase, wikipedia:state.wikipedia});
export default connect(mstp)(AdminWikiTools);










