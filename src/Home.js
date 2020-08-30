/* HOME PAGE - lingbash.com/ 

If not logged in, this displays a splash page.
If logged in, this is the user's profile/'home' page, showing:
-Articles they've read
-Suggestions
-Conti<p></p>nue reading

*/
import React from 'react';
import PrefSelector from './PrefSelector';
import ArticleSelector from './ArticleSelector';
import {connect} from 'react-redux';

class Home extends React.Component{
	render() {
		// we need a key prop for PrefSelector that changes whenever its props will change
		// and forces it to re-run the constructor.
		let langs = this.props.prefs? this.props.prefs.home + this.props.prefs.away : "noprefs";
		return (
			<div>
				<PrefSelector key={langs}/>
				<ArticleSelector demo_specific_stuff={true} />
			</div>);
	}
}
let mstp = state => {
	return {
		user:state.user
	};
}
export default connect(mstp)(Home);
