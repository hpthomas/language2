/* NAV BAR AND PARENT OF EVERYTHING 
this has all the routes and such too
*/
import React from 'react';
import {connect} from 'react-redux';
import {Link, Route} from 'react-router-dom';
import UserPage from './UserPage';
import Home from './Home';
import About from './About';
import Login from './Login';
import Signup from './Signup';
import ReaderPage from './ReaderPage';
import AdminWikiTools from './wikiTools/AdminWikiTools';
import store from './store';
class TopBar extends React.Component{
	logOut(){
		this.props.firebase.logOut();
		// dispatch logout success action without waiting for confirmation - this is fine I think
		store.dispatch({type:'LOGGED_OUT'});
	}

	render() {
		return (
			<div className="top">
				<div className="navigation">
					<div className="name">
						<Link to={'/'}>LingBash</Link>
					</div>
					<div className="menu-list">
						<ul className="navbar-center">
							<li className='home_link'>
								<Link to={'/'}>
									Home	
								</Link>
							</li>
							<li className='about_top_link'>
								<Link to={'/about'}>
									About	
								</Link>
							</li>

							{ this.props.user && this.props.user.uid==='Gw83uZdDAQZD9Evc38RPN1vwp0u2'?
								<li className='about_top_link'>
									<Link to={'/wikitools'}>
										Wiki Tools	
									</Link>
								</li>
								:null
							}

						</ul>
					</div>
					<div className="menu-list-right">
						<ul>
							<li>
								{this.props.user? 
									<Link to={'/user/'+this.props.user.uid}>{this.props.user.email||'anonymous'}</Link>
									:<Link to='/signup'>Register</Link>
								}
							</li>
							<li>
								{this.props.user? <button type='button' onClick={this.logOut.bind(this)}>log out</button>
								: <Link to='/login'>Log In</Link>
								}
							</li>
						</ul>
					</div>
				</div>
				<Route exact path='/' component = {Home} />
				<Route path='/about' component = {About} />
				<Route path='/read' component = {ReaderPage} />
				<Route path='/login' component = {Login} />
				<Route path='/signup' component = {Signup} />
				<Route path='/wikitools' component = {AdminWikiTools} />
				<Route path='/user/:user' component = {UserPage} />
			</div>);
	}
}
let mstp = (state) => {
	return {
		s:state,
		user:state.user,
		firebase:state.firebase
	}
}
export default connect(mstp)(TopBar);
