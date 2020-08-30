import React from 'react';
import {v4 as uuid} from 'uuid';
class LinkSelector extends React.Component {
	change(option) {
		this.props.change(option);
	}
	render() {
		return (
			<div className="linkSelector">
				{this.props.options.map(option => (
					<span key={uuid()}
					className={option===this.props.selected? "selectedLink" : ""}
					onClick={this.change.bind(this, option)}>

						{option}
						
					</span>)
				)}
			</div>);
		}
}
export default LinkSelector;