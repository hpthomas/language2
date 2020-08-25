/* Demo and Explanation Page

This is the first thing a new user sees - an expandable FAQ and a demo.
The user is shown a reader, in the simplest sense, configured as:
-show all selectors
-auto fill with the 'cats(gatos)' article
With the <Results> being already fetched somehow. 
That way I can have a translation to show them.
Maybe reader will have a fakeresults={obj} pref
*/

import React from 'react';
import {connect} from 'react-redux';
import PrefSelector from './PrefSelector';
import ArticleSelector from './ArticleSelector';

class Demo extends React.Component{
	constructor(props) {
		super(props);
	}
	render() {
		// we need a key prop for PrefSelector that changes whenever its props will change
		// and forces it to re-run the constructor.
		let langs = this.props.prefs.home + this.props.prefs.learning;
		return (
			<div>
				<PrefSelector key={langs}/>
				<ArticleSelector demo_specific_stuff={true} />
			</div>);
	}
}
let mstp = state => {
	return {
		prefs:state.prefs,
	};
}
export default connect(mstp)(Demo);
