let languages = [
	{full:"English", abbr:"en"},
	{full:"Spanish", abbr:"es"},
	{full:"French", abbr:"fr"},
	{full:"German", abbr:"de"},
	{full:"Italian", abbr:"it"},
	{full:"Portuguese", abbr:"pt"}
];
// convenience methods to get dict of {abbr:full} or vice versa
let nameToAbbr = {};
languages.forEach(lang =>{
	nameToAbbr[lang.full] = lang.abbr;
})

let abbrToName = {};
languages.forEach(lang =>{
	abbrToName[lang.abbr] = lang.full;
})

export {nameToAbbr, abbrToName};
export default languages;