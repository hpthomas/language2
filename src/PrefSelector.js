/* Preference Selector 
I speak ___
I'm learning ___ 
with dropdowns for languages.
*/
import React from 'react';
import {connect} from 'react-redux';
import languages from './Languages';
import store from './store';
class PrefSelector extends React.Component{
	constructor(props) {
		console.log('constructing');
		console.log(props.prefs);
		super(props);
		this.state = {home:props.prefs.home, learning:props.prefs.learning, invalid:false};
	}
    change(event) {
        let val = event.target.value;
        let changed = event.target.name;
        let other = changed==='home'?'learning':'home';
        this.setState( { 
            [changed]: val, 
            invalid: (val===this.state[other])
        });
    }
    save() {
    	let newPrefs = {home:this.state.home, learning:this.state.learning};
    	this.props.firebase.setPrefs(newPrefs);	
    	store.dispatch({type:"GOT_PREFS", payload:newPrefs});
    }
	render() {
		return (
			<div>
				<div>
					<label> I speak:</label>
					<select value={this.state.home} onChange={this.change.bind(this)} className="" name="home">
						{languages.map((lang,i) =>  (
							<option key={i} value={lang.abbr} >
								 	{lang.full}
						 	</option>)
						)}
					</select>
				</div>

				<div>
					<label> I'm learning:</label>
					<select value={this.state.learning} onChange={this.change.bind(this)} className="" name="learning">
						{languages.map((lang,i) =>  (
							<option key={i} value={lang.abbr}>
								 	{lang.full}
						 	</option>)
						)}
					</select>
				</div>
				<button disabled={this.state.invalid} onClick={this.save.bind(this)}>save</button>
			</div>);
	}
}
let mstp = (state)=>{
	return {
		firebase:state.firebase,
		prefs:state.prefs
	};
}
export default connect(mstp)(PrefSelector);