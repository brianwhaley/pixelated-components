
 
function isPartialMatchInArray(searchString: string, array: string[]): boolean {
	// Convert both the search string and array items to lowercase for case-insensitive matching
	const lowerCaseSearchString = searchString.toLowerCase();
	return array.every(item => {
		return item.toLowerCase().includes(lowerCaseSearchString);
	});
}

export function preloadAllCSS() {
	// console.log("Deferring all CSS loading...");
	// Select all link tags with rel="stylesheet"
	const stylesheets = document.querySelectorAll('link[rel="stylesheet"]') as NodeListOf<HTMLLinkElement>;
	stylesheets.forEach(function(stylesheet) {
		// PRELOAD THE STYLESHEET WITH A LINK TAG
		const link = document.createElement('link');
		link.rel = 'preload';
		link.as = 'style';
		link.href = stylesheet.href;
		link.fetchPriority = 'high';
		document.head.appendChild(link);
		stylesheet.setAttribute('fetchpriority', 'high');
	});
	// Provide a noscript fallback for browsers that don't execute JavaScript
	const noscript = document.createElement('noscript');
	stylesheets.forEach(function(link) {
		const fallbackLink = document.createElement('link');
		fallbackLink.rel = 'stylesheet';
		fallbackLink.href = link.href;
		fallbackLink.fetchPriority = 'high';
		fallbackLink.type = 'text/css';
		noscript.appendChild(fallbackLink);
	});
	document.head.appendChild(noscript);
}



export function deferAllCSS() {
	// console.log("Deferring all CSS loading...");
	// Select all link tags with rel="stylesheet"
	const stylesheets = document.querySelectorAll('link[rel="stylesheet"]') as NodeListOf<HTMLLinkElement>;
	stylesheets.forEach(function(link) {
		// Change rel to "preload" and as to "style" to asynchronously load the stylesheet
		link.rel = 'preload';
		link.as = 'style';
		// Add an onload handler to apply the stylesheet once loaded
		link.onload = function() {
			link.rel = 'stylesheet'; // Apply the stylesheet
			link.onload = null;      // Remove the onload handler to prevent re-execution
		};
	});
	// Provide a noscript fallback for browsers that don't execute JavaScript
	const noscript = document.createElement('noscript');
	stylesheets.forEach(function(link) {
		const fallbackLink = document.createElement('link');
		fallbackLink.rel = 'stylesheet';
		fallbackLink.href = link.href;
		noscript.appendChild(fallbackLink);
	});
	document.head.appendChild(noscript);
}

// Call the function when the DOM is ready
// document.addEventListener('DOMContentLoaded', deferAllCSS);
