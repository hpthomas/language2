import React from 'react';
import {v4 as uuid} from 'uuid';
import {topArticles} from './topArticles';
import Wikipedia from './Wikipedia';
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
				name: link.substring(30,link.length),
				langs: Object.fromEntries(languages.map(l=>[l,null])),
				all:false,
			}));
		this.state = {articles:articles, selected:null, recs:null};
	}
	//TODO: separate into methods or something, this is a nightmare 
	componentDidMount() {
		let promises = this.state.articles.map(link=>Wikipedia.getLangAvails(link.name).then(res=>res.json()));
		Promise.all(promises)
		.then(responses=>responses.map(response=>{
		    try {
		        let page = response['query']['pages'];
		        let res =  page[Object.keys(page)[0]]['langlinks'];
				return res;
		    }
		    catch (error) {
		    	return null;
		    }
		    return null;
		}))
		.then(langdata=>{
			let articles = this.state.articles.slice(0);
			// loop through articles
			for (var i = 0; i < langdata.length;i++) {
				if (langdata[i]){
					// langs for article maps lang to name_in_lang for each lang its available in
					let langs_for_article = Object.fromEntries(langdata[i].map(l=>[l.lang,l['*']]));
					let count=0;
					languages.forEach(lang=>{
						if (langs_for_article[lang]) {
							articles[i].langs[lang]=langs_for_article[lang];
							count+=1;
						}
					});
					articles[i].all = (count == languages.length);
				}
				else {

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
										<td>{Object.keys(rec.langs).length==languages.length?"Y":"N"}</td>
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
		console.log(result);
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
	if (props.name=='-') return <span>-</span>
	let url = "https://" + props.lang + ".wikipedia.org/wiki/" + encodeURIComponent(props.name);
	return <a href={url}>{props.lang}</a>
}

let mstp = (state) => ({firebase:state.firebase});
export default connect(mstp)(AdminWikiTools);










