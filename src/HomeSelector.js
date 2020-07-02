import React from 'react';
class HomeSelector extends React.Component{
	constructor(props) {
		super(props);
		this.setState({lang:props.prefs.home});
	}
	render() {
		return (<div>
			I speak
		</div>);
	}
}
let mstp = (state)=>{
	return {
		firebase:state.firebase,
		prefs:state.prefs
	};
}
export default connnect(mstp)(HomeSelector);