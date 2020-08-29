import React from 'react';
import {withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import store from './store';

class SignupForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {email:"", pass:""};
	}
	submit(event) {
		event.preventDefault();
		this.props.firebase
			.createUser(this.state.email, this.state.pass)
				.then(res => {
					store.dispatch({type:'LOGGED_IN', payload:res.user})
					this.props.firebase.setPrefs(this.props.prefs);
					this.props.history.push("/");
				}); //todo .catch if failure
	}
	change(event) {
		this.setState({[event.target.name]:event.target.value});
	}
	render() {
		return (
		<div className="">
			<div className="">
			<h3 className="">Register New Account</h3>
			</div> 
			<form className="" onSubmit={this.submit.bind(this)}>
				<label> Email: </label>
				<input name="email" className="" value={this.state.email} onChange={this.change.bind(this)}/>
				<label> Password: </label>
				<input type="password" name="pass" className="" value={this.state.pass} onChange={this.change.bind(this)}/>
				<p></p>
				<button className="">submit</button>
			</form>
			{this.state.error? 
				<div>
					<h5>error!</h5>
					{this.state.error.message}
				</div> 
			: null}
		</div>);
	}
}

const SignupPage = withRouter(SignupForm);
let mstp = (state) => ({firebase:state.firebase, prefs:state.prefs});
export default connect(mstp)(SignupPage);
