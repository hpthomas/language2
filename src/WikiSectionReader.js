import React from 'react';
import store from './store';
import {connect} from 'react-redux';

class WikiSectionReader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {cachedTranslation: null, showTranslation:false, status:props.status};
	}

	toggleTranslate(event) {
		// we only need to fetch translation, etc. if we're showing, not if we're hiding
		if (this.state.showTranslation) {
			this.setState({showTranslation:false});
			return;
		}
		this.setState({showTranslation: true});
		this.props.updateStatus('translated');
		this.setState({status:'translated'});
		if (!this.state.cachedTranslation) {
			this.translate();
		}
	}
	translate() {
		this.props.firebase.translate(this.props.data.text, this.props.prefs.away,this.props.prefs.home)
		.then(response => response.data)
		.then(t=>{
			if (t.err) {
				throw t.err;
			}
			this.setState({cachedTranslation: t});
		})
		.catch(error=>{
			if (error === 'quota reached') {
				let msg = "The translation quota has been exceeded for the month.";
				this.setState({cachedTranslation: msg});
			}
			else if (error === 'not authenticated'){
				let msg = "Please log in to view translations. If you are already logged in, this is an error.";
				this.setState({cachedTranslation: msg});
			}
			else {
				console.log('unknown error');
				console.log(error);
				let msg = "Error fetching translation";
				this.setState({cachedTranslation: msg});
			}
		})
	}
	markDone(event){
		this.props.updateStatus('done');
		this.setState({status:'done',showTranslation:false});
	}
	guestLogin() {
		return this.props.firebase.login(null,null)
		.then(res=>{
			store.dispatch({type:"LOGGED_IN", payload:res.user});
			this.translate(); // request translation again now that it will work
		})
	}
	guestMessage(){
		return (
			<div>
				Please log in to view translations. If you are already logged in, this is an error.
				<button className='linkButton' onClick={ev=>this.guestLogin(ev)}>Continue as a guest.</button>
			</div>);
	}
	render() {
		let Tag = this.props.data.tag.toLowerCase(); //uppercase var name can be JSX tag 
		let translation = this.state.cachedTranslation || 'fetching...';
		if (!this.props.user) {
			translation = this.guestMessage();
		}
		return (
			<div className={"reader-item"}>
				<div className={"reader-status " + (this.state.status || "no-status")}>
					{this.state.status || ""}
				</div>
				<div className="reader-main">
					<Tag>{this.props.data.text}</Tag>
				</div>
				<div className="reader-translate-button">
					<button onClick={this.toggleTranslate.bind(this)}>
						{this.state.showTranslation? "hide" : "translate"}
					</button>
					<button onClick={this.markDone.bind(this)}>
						Done
					</button>
				</div>
				<div className="reader-translation">
					{this.state.showTranslation && translation}
				</div>
			</div>
		);
	}
}	
function mstp(state, ownProps) {
	return {firebase:state.firebase, prefs:state.prefs, user:state.user};
}
export default connect(mstp)(WikiSectionReader);
