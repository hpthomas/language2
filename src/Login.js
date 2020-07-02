import React from 'react';
import {Link, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import store from './store';

class LoginForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {email:"", pass:"", error:null, welcome:false};
	}
	submit(event) {
		event.preventDefault();
		this.props.firebase.login(this.state.email, this.state.pass)
			.then(res=>{
				store.dispatch({type:"LOGGED_IN", payload:res.user});
				this.setState({email:"",pass:""});
				this.props.firebase.getPrefs().then(res=>{
					let saved_prefs = res.val();
					this.props.history.push("/");	
					store.dispatch({type:"GOT_PREFS", payload:saved_prefs});
				})
			})
			.catch(error=>{
				this.setState({error:error});
			});
	}
	change(event) {
		this.setState({[event.target.name]:event.target.value});
	}
	render() {
		return (
		<div>
			<form className="" onSubmit={this.submit.bind(this)}>
				<label> Email: </label>
				<input name="email" className="" value={this.state.email} onChange={this.change.bind(this)}/>
				<label> Password: </label>
				<input type="password" name="pass" className="" value={this.state.pass} onChange={this.change.bind(this)}/>
				<p></p>
				<button className="form-control">submit</button>
				{this.state.error? <p>{this.state.error.message}</p> : null }
			</form>
		</div>);
	}
}
let mapStateToProps = function(state) {return {...state}};
let Connected = connect(mapStateToProps)(LoginForm);
const Login = withRouter(Connected);
export default Login;