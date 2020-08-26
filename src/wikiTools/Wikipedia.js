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
		.then(this.wikiResponseToHtml)
		.then(this.wikiHtmlToArray);
	}

	static searchWiki(term, lang) {
	    var url = "https://" + lang 
	    + ".wikipedia.org/w/api.php?action=query&prop=extracts&format=json&origin=*&titles="
	    + term;
	    console.log(url);
	    return fetch(url);
	}

	static wikiResponseToHtml(response) {
	    try {
	        let page = response['query']['pages'];
	        let res =  page[Object.keys(page)[0]]['extract'];
			return res;
	    }
	    catch (error) {return null;}
	}

	static wikiHtmlToArray(html) {
	    if (!html) return;
	    let page = document.createElement('div');
	    page.innerHTML = html;
	    return Array.from(page.children)
	        .filter(n => n.nodeName === "P" || n.nodeName[0].toUpperCase()==="H")
	        .filter(n => n.innerText.length > 2)
	        .map(n => ({tag:n.nodeName, text:n.innerText /*, html:n.innerHTML */ }) );
	}
}
export default Wikipedia;
