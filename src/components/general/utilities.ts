
const debug = false; 

export function html2dom (str: string) {
	if (window.DOMParser) {
		 
		const parser = new DOMParser();
		const doc = parser.parseFromString(str, 'text/html');
		return doc.body.firstChild;
	}
	const dom = document.createElement('div');
	dom.innerHTML = str;
	return dom;
}

 
export function mergeDeep (a: any, b: any) {
	// first is default vals, all other objects overwrite
	const extended: { [key: string]: any } = {};
	for (let i = 0; i < arguments.length; i++) {
		const thisObj = arguments[i];
		for (const prop in thisObj) {
			if (Object.prototype.hasOwnProperty.call(thisObj, prop)) {
				if (
					Object.prototype.toString.call(thisObj[prop]) === '[object Object]'
				) {
					// not sure why true was the first param... or why there were 3 params
					extended[prop] = mergeDeep(extended[prop], thisObj[prop]);
				} else {
					extended[prop] = thisObj[prop];
				}
			}
		}
	}
	return extended;
}

export function randomBetween (min: number, max: number) {
	/* ===== RANDOM NUM BETWEEN MIN AND MAX ===== */
	if (min < 0) {
		return min + Math.random() * (Math.abs(min) + max);
	} else {
		return min + Math.random() * (max - min);
	}
}

export function generateKey () {
	const vals = [];
	vals[0] = Math.random().toString(36).substring(2, 15);
	vals[1] = Math.floor(
		performance.now() * Math.floor(Math.random() * 1000)
	).toString(36);
	vals[2] = Math.floor(Math.random() * new Date().getTime()).toString(36);
	vals[3] = Number(
		 
		crypto.getRandomValues(new Uint16Array(4)).join('')
	).toString(36);
	return (
		vals[Math.floor(Math.random() * 4)] + vals[Math.floor(Math.random() * 4)]
	);
}

export function generateUUID () {
	// https://stackoverflow.com/questions/105034/how-do-i-create-a-guid-uuid
	// var d8 = crypto.randomUUID();
	 
	return window.URL.createObjectURL(new Blob([])).substr(-36);
}

export function capitalize (str: string) {
	return str[0].toUpperCase() + str.toLowerCase().slice(1);
}

/*
Array.prototype.contains = function(obj) {
  return this.indexOf(obj) > -1;
};
*/

export function attributeMap (oldAttribute: string) {
	// https://reactjs.org/docs/dom-elements.html
	const attributes: { [key: string]: string } = {
		autocapitalize: 'autoCapitalize',
		autocomplete: 'autoComplete',
		autocorrect: 'autoCorrect',
		autofocus: 'autoFocus',
		cellpadding: 'cellPadding',
		cellspacing: 'cellSpacing',
		charset: 'charSet',
		class: 'className',
		colspan: 'colSpan',
		datetime: 'dateTime',
		defaultvalue: 'defaultValue',
		for: 'htmlFor',
		formaction: 'formAction',
		formmethod: 'formMethod',
		formtarget: 'formTarget',
		frameborder: 'frameBorder',
		hreflang: 'hrefLang',
		httpequiv: 'httpEquiv',
		marginheight: 'marginHeight',
		marginwidth: 'marginWidth',
		maxlength: 'maxLength',
		minlength: 'minLength',
		onchange: 'onChange',
		readonly: 'readOnly',
		rowspan: 'rowSpan',
		spellcheck: 'spellCheck',
		tabindex: 'tabIndex'
	};
	return (attributes[oldAttribute] ? attributes[oldAttribute] : oldAttribute);
}



/**
	 * Adds a single 'change' event listener to the document and uses event delegation
	 * to log the event and the value of the target element when a change occurs
	 * on an input, select, or textarea element.
	 */
export function logAllChange() {
	// Attach a single 'change' event listener to the document
	document.addEventListener('change', function(event) {
		// The event.target is the specific element that triggered the event
		const targetElement = event.target as HTMLElement;

		// Check if the target element is one that typically has a 'change' event (form controls)
		if (targetElement && 
			( targetElement.tagName === 'INPUT' || 
			targetElement.tagName === 'SELECT' || 
			targetElement.tagName === 'TEXTAREA') ) {
		
			if (debug) console.log('Change event triggered:', event);
			// For text inputs, the change event only fires when the element loses focus
			// For checkboxes/radio buttons, event.target.checked provides the value
			const inputElement = targetElement as HTMLInputElement;
			const changeValue = inputElement.type === 'checkbox' || inputElement.type === 'radio' ? inputElement.checked : inputElement.value;
			if (debug) console.log('Changed value:', changeValue);
		}
	});
}
// Call the function to activate the listeners once the script is loaded
// logChangeToAllElements();

/* ===== CLIENT COMPONENT DETECTION ===== */
/**
 * Regex patterns that identify client-only code requiring browser execution
 * Used by both ESLint rules and build scripts to determine client vs server components
 */
export const CLIENT_ONLY_PATTERNS = [
	/\baddEventListener\b/,
	/\bcreateContext\b/,
	/\bdocument\./,
	/\blocalStorage\b/,
	/\bnavigator\./,
	/\bonBlur\b/,
	/\bonChange\b/,
	/\bonClick\b/,
	/\bonFocus\b/,
	/\bonInput\b/,
	/\bonKey\b/,
	/\bonMouse\b/,
	/\bonSubmit\b/,
	/\bremoveEventListener\b/,
	/\bsessionStorage\b/,
	/\buseCallback\b/,
	/\buseContext\b/,
	/\buseEffect\b/,
	/\buseLayoutEffect\b/,
	/\buseMemo\b/,
	/\buseReducer\b/,
	/\buseRef\b/,
	/\buseState\b/,
	/\bwindow\./,
	/["']use client["']/  // Client directive
];

/**
 * Determines if a component file contains client-only code that requires browser execution
 * @param fileContent - The source code content of the file
 * @returns true if the file contains client-only patterns
 */
export function isClientComponent(fileContent: string): boolean {
	return CLIENT_ONLY_PATTERNS.some(pattern => pattern.test(fileContent));
}

/* ===== COMPONENT FILE DETECTION ===== */
/**
 * Glob patterns for finding component files
 */
export const TS_FILE_IGNORE_PATTERNS = [
	'**/*.d.ts',
	'**/*.test.ts',
	'**/*.spec.ts',
	'**/*.stories.ts',
	'**/documentation/**',
	'**/examples/**',
	'**/*.example.*'
];

export const TSX_FILE_IGNORE_PATTERNS = [
	'**/*.test.tsx',
	'**/*.spec.tsx',
	'**/*.stories.tsx',
	'**/documentation/**',
	'**/examples/**',
	'**/*.example.*'
];

/* ===== SERVER COMPONENT DETECTION ===== */
/**
 * Regex patterns that identify server-only code that should not run on client
 */
export const SERVER_ONLY_PATTERNS = [
	/["']use server["']/,  // Server directive
	/\b__dirname\b/,
	/\b__filename\b/,
	/@aws-sdk/,
	/\bchild_process\b/,
	/\bexec\b/,
	/\bexecAsync\b/,
	/\bfs\b/,
	/\bfs\.readFileSync\b/,
	/\bfs\.existsSync\b/,
	/\bcrypto\b/,
	/\bimport.*googleapis\b|\brequire.*googleapis\b/,  // Actual import of googleapis
	/\bimport.*next\/server\b|\brequire.*next\/server\b/,  // Actual import of next/server
	/\bimport.*path\b|\brequire.*path\b/,  // Actual import of path module
	/\bprocess\.cwd\(\)/,
	/\brequire\.resolve\b/,
	/\butil\b/
//	/\bNextRequest\b/,
//	/\bNextResponse\b/
];
