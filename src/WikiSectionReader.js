import React from 'react';
import {connect} from 'react-redux';

class WikiSectionReader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {cachedTranslation: null, showTranslation:false};
	}

	translate(event) {
		this.setState({showTranslation: !this.state.showTranslation});
		this.props.firebase.translate(this.props.data.text, this.props.prefs.learning,this.props.prefs.home)
		.then(response => response.data)
		.then(t=>{
			if (t.err) {
				throw t.err;
			}
			this.setState({cachedTranslation: t});
		})
		.catch(error=>{
			if (error == 'quota reached') {
				let msg = "The translation quota has been exceeded for the month.";
				this.setState({cachedTranslation: msg});
			}
			else if (error == 'not authenticated'){
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
	render() {
		let Tag = `${this.props.data.tag.toLowerCase()}`;
		return (
			<div className="reader-item">
				<div className="reader-main">
					<Tag>{this.props.data.text}</Tag>
				</div>
				<div className="reader-translate-button">
					<button onClick={this.translate.bind(this)}>
						{this.state.showTranslation? "hide" : "translate"}
					</button>
				</div>
				<div className="reader-translation">
					{
						(!this.state.showTranslation)? null 
						: (this.state.cachedTranslation || "fetching... ")
					} 
				</div>
			</div>
		);
	}
}	
function mstp(state, ownProps) {
	return {firebase:state.firebase, prefs:state.prefs};
}
export default connect(mstp)(WikiSectionReader);
