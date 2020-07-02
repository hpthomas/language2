/* HOME PAGE - lingbash.com/ 

If not logged in, this displays a splash page.
If logged in, this is the user's profile/'home' page, showing:
-Articles they've read
-Suggestions
-Conti<p></p>nue reading

*/
import React from 'react';
import Demo from './Demo';
import {connect} from 'react-redux';

class Home extends React.Component{
	constructor(props) {
		super(props);
	}
	render() {
		if (!this.props.user) {
			return <Demo />;
		}
		return <div>welcome back! <Demo /> </div>;
	}
}
let mstp = state => {
	return {
		user:state.user
	};
}
export default connect(mstp)(Home);
