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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export function pushNewValueToStateArray (that: any, oldState: any, newValue: any) {
	const myNewArray = that.state[oldState];
	myNewArray.push(newValue);
	that.setState({ [oldState]: myNewArray });
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
