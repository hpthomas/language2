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

class Demo extends React.Component{
	constructor(props) {
		super(props);
	}
	render() {
		return (
			<div>
				<PrefSelector />
			</div>);
	}
}
let mstp = state => {
	return {
		state:state,
	};
}
export default connect(mstp)(Demo);
