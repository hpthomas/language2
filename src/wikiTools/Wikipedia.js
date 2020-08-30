class Wikipedia {
	constructor(firebase) {
		this.firebase=firebase;
	}

	// for now, assumes term is in English
	getLangAvails(term) {
		let url = "https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&lllimit=500&format=json&origin=*"
		  + "&titles=" + encodeURIComponent(term);
		  return fetch(url);
	}

	getWikiArray(term, lang) {
		return this.searchWiki(term, lang)
		.then(response=>response.json())
		.then(res=>this.parseWikiResponse(res));
	}

	// finds current revision ID for a wiki page
	// sets it on firebase, returns promise resolving to revID
	findAndSetCurrentRevision(term, lang) {
	    var url = "https://" + lang 
	    + ".wikipedia.org/w/api.php?"
	    	+ "action=query"
	    	+ "&prop=revisions"
	    	+ "&format=json"
	    	+ "&formatversion=2"
	    	+ "&origin=*"
	    	+ "&titles="
		    + term;
		return fetch(url)
		.then(res=>res.json())
		.then(revisions=>{
			let revision = revisions.query.pages[0].revisions[0].revid;
			// set on firebase but don't wait for results
			this.firebase.setArticleRevision(term, lang, revision);
			return revision;
		})
		.catch(err=>{
			console.log('no revision found for ' + term + ','+ lang);
			console.log(err)
		})
	}
	searchWiki(term, lang) {
		return this.firebase.getArticleRevision(term,lang)
		.then(res=>res.val())
		.then(revisionID=>{
			if (revisionID) {
				return revisionID;
			}
			else {
				return this.findAndSetCurrentRevision(term, lang);
			}
		})
		.then(revisionID=>{
		    var url = "https://" + lang 
		    + ".wikipedia.org/w/api.php?"
		    	+ "action=parse"
		    	+ "&prop=text"
		    	+ "&format=json"
		    	+ "&formatversion=2"
		    	+ "&origin=*"
			    + "&oldid="
			    + revisionID;
		    return fetch(url);
		});
	}

	// Returns text of an article section cleaned-up
	// given a dom element made from Wikiedia's text
	// right now this just strips unprintable 'style' tags
	getCleanText(element) {
		let children = element.children;
		Array.from(children).forEach(childElement => {
			if (childElement.nodeName.toLowerCase() === 'style') {
				element.removeChild(childElement);
			}
		})

		// regex to strip out all [###]: s.replace(/(\[\d+\])/g,'');

		let text = element.innerText;
		// regex matches anything between brackes non-greedily
		let re = /\[(.*?)\]/g;
		return text.replace(re,'');
	}

	// the reponse to action=parse is the html contents of the page
	// easier to deal with than WikiText
	// TODO this is hard coded & inflexible, but mediaWiki should be stable
	parseWikiResponse(response) {
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
					if (i===3) window.e=element;
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
