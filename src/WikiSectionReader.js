import React from 'react';
import {connect} from 'react-redux';

class WikiSectionReader extends React.Component {
	constructor(props) {
		super(props);
		this.state = {cachedTranslation: null, showTranslation:false};
	}

	translate(event) {
		this.setState({showTranslation: !this.state.showTranslation});
		let msg = "Please log in to view translations. If you are already logged in, this is an error.";
		this.props.firebase.translate(this.props.data.text, this.props.prefs.src,this.props.prefs.target)
		.then(t=>JSON.parse(t.data))
		.then(t => t['text'][0])
		.then(t => {
			this.setState({cachedTranslation: t});
		})
		.catch(error=>{
			console.log("translation error");
			console.log(error);
			this.setState({cachedTranslation: msg});
		})
	}
	render() {
		let Tag = `${this.props.data.tag.toLowerCase()}`;
		return (
			<div className="row">
				<div className="col-6">
					<Tag>{this.props.data.text}</Tag>
				</div>
				<div className="col-1">
					<button onClick={this.translate.bind(this)}>
						{this.state.showTranslation? "hide" : "translate"}
					</button>
				</div>
				<div className="col-4">
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
