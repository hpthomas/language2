import React from 'react';
import {Link} from 'react-router-dom';
class About extends React.Component{
	constructor(props) {
		super(props);
	}
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

				<p>
					To view translations, you must first <Link to='/login'> Log In</Link>.
				</p>
			</div>);
	}
}
export default About;
