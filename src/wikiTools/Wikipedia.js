class Wikipedia {

	// for now, assumes term is in English
	static getLangAvails(term) {
		let url = "https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&lllimit=500&format=json&origin=*"
		  + "&titles=" + encodeURIComponent(term);
		  return fetch(url);
	}

	static getWikiArray(term, lang) {
		return this.searchWiki(term, lang)
		.then(response=>response.json())
		.then(res=>this.parseWikiResponse(res));
	}

	static searchWiki(term, lang) {
	    //CHECK FIREBASE FOR KNOWN IN-USE REVISION
	    //IF NOT PRESENT
	    	//GET ID FOR CURRENT REVISION
	    	//SAVE THAT IN FIREBASE
	    //GET THAT REVISION
	    var url = "https://" + lang 
	    + ".wikipedia.org/w/api.php?"
	    	+ "action=parse"
	    	+ "&prop=text"
	    	+ "&format=json"
	    	+ "&formatversion=2"
	    	+ "&origin=*"
	    	+ "&page="
		    + term;
	    return fetch(url);
	}

	// Returns text of an article section cleaned-up
	// given a dom element made from Wikiedia's text
	// right now this just strips unprintable 'style' tags
	static getCleanText(element) {
		let children = element.children;
		Array.from(children).forEach(childElement => {
			if (childElement.nodeName.toLowerCase() == 'style') {
				element.removeChild(childElement);
			}
		})

		// regex to strip out all [###] 
		let text = element.innerText.replace(/(\[\d+\])/g,'');
		return text;;
	}

	// the reponse to action=parse is the html contents of the page
	// easier to deal with than WikiText
	// TODO this is hard coded & inflexible, but mediaWiki should be stable
	static parseWikiResponse(response) {
		try {
			let wiki_html = response.parse.text;
			var doc = new DOMParser().parseFromString(wiki_html,'text/html');

			// this is where we find list of article sections
			let elements = doc.children[0].children[1].children[0].children;
			let sections = [];
			for (var i = 0; i < elements.length; i++) {
				let element = elements[i];
				if (element.nodeName.toUpperCase() === "P" || element.nodeName[0].toUpperCase()==="H") {
					// look through children for a style tag and get rid of it
					if (i==3) window.e=element;
					let clean_text = this.getCleanText(element);
					if (clean_text.length > 3) {
						let section = {tag:element.nodeName, text:clean_text};
						sections.push(section);
					}
				}
			}
			return sections;
		}
		catch(err) {
			console.log('err',err);
			return null;
		}
	}
}
export default Wikipedia;
