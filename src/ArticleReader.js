/* ARTICLE READER 
This component is given an article name and the languages as props. 
It fetches the article and displays it.
*/
import React from 'react';
import WikiSectionReader from './WikiSectionReader';
import {connect} from 'react-redux';

class ArticleReader extends React.Component{
	constructor(props) {
		super(props);
	}
	render() {
		return (!this.props.items)? null : 
		( 
			<ul className="">
			{this.props.items.map((item,index) => 
				<li key={index} className="">
					<WikiSectionReader prefs={this.props.prefs} data={item} />
				</li>
			)}
			</ul>
		);
	}
}

export default ArticleReader;