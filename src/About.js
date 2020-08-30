import React from 'react';
import store from './store';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

class About extends React.Component{
	render() {
		return (
			<div>
				<h3>
					LingBash is a language learning tool!
				</h3>
				<p>
					Designed to help users with vocabulary and reading comprehension, LingBash allows users to read wikipedia articles in your goal language without viewing translations.
					The articles are displayed section-by-section. If you reach a section you don't fully understand, you can view a translation into your native language.
					Try to read as much as you can without translating!
				</p>

				{(!this.props.user) &&
					<p>
						To view translations, you must first <Link to='/login'> Log In</Link> or 
						<button className='linkButton' onClick={ev=>this.guestLogin(ev)}> Continue as a Guest</button>.
					</p>
				}

			</div>);
	}
	guestLogin(ev) {
		ev.preventDefault();
		this.props.firebase.login(null,null)
		.then(res=>{
			store.dispatch({type:"LOGGED_IN", payload:res.user});
			this.props.history.push('/');
		})
	}
}
let mstp = state => ({firebase:state.firebase, user:state.user});
export default withRouter(connect(mstp)(About));
