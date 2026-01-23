import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import * as FC from './formcomponents';
import * as FVF from './formfieldvalidations';
import { capitalize, attributeMap } from './formutils';
import { FormEngine } from './formengine';
const debug = false;

/*
===== FORM EXTRACT =====
Submit a page URL of a form to extract all form elements and
convert them to JSON to create a form via FormEngine
*/

FormExtractor.propTypes = {
	url: PropTypes.string,
	htmlPaste: PropTypes.string
};
export type FormExtractorType = InferProps<typeof FormExtractor.propTypes>;
export function FormExtractor(props: FormExtractorType) {

	const [ url, setURL ] = useState<string>(props.url || "");
	const [ htmlPaste, setHtmlPaste ] = useState<string>(props.htmlPaste || "");
	const [ formData, setFormData ] = useState ({ fields: [] });

	setParentState.propTypes = {
		url: PropTypes.string.isRequired,
		htmlPaste: PropTypes.string.isRequired,
	};
	type setParentStateType = InferProps<typeof setParentState.propTypes>;
	function setParentState(childState: setParentStateType) {
		// SET STATE FROM PARENT VALUES - EXPOSED EXTERNAL
		if (debug) console.log("Setting Parent State...");
		setURL(childState.url);
		setHtmlPaste(childState.htmlPaste);
	}

	return (
		<div>
			<div className="section-container">
				<FormExtractUI setParentState={setParentState} />
			</div>

			<div className="section-container">
				<br /><br /><hr /><br /><br />
			</div>

			<div className="section-container">
				<FormExtractEngine url={url} htmlPaste={htmlPaste} setFormData={setFormData} />
			</div>

			<div className="section-container">
				<br /><br /><hr /><br /><br />
			</div>

			<div className="section-container">
				<FormEngine formData={formData} />
			</div>
		</div>
	);
}

FormExtractUI.propTypes = {
	setParentState: PropTypes.func.isRequired
};
export type FormExtractUIType = InferProps<typeof FormExtractUI.propTypes>;
export function FormExtractUI(props: FormExtractUIType) {
	const [url, setURL] = useState();
	const [htmlPaste, setHtmlPaste] = useState();

	function onChange (event: React.ChangeEvent) {
		// UPDATE URL OR HTML_PASTE ON CHANGE - EXTERNAL
		if (debug) console.log("Element Changed...");
		const target = event.target as HTMLFormElement;
		if(target.name == "url") {
			setURL(target.value);
		} else if (target.name == "htmlPaste") {
			setHtmlPaste(target.value);
		}
	}

	function onSubmit() {
		// SET PARENT STATE WITH URL OR HTML PASTE - EXTERNAL
		if (debug) console.log("Form Submitted...");
		props.setParentState({url: url!, htmlPaste: htmlPaste!});
	}

	return (
		<form onSubmit={ e => { e.preventDefault(); } } method="post" name="extract">
			<label htmlFor="url">URL : </label>
			<input type="text" list="form_urls" id="url" name="url" size={100} onChange={onChange} />
			<FC.FormDataList id='form_urls' items={FVF.formURLs} />
			<div style={{ width: '100%', textAlign: 'center' }}>OR</div>
			<label htmlFor="htmlPaste">HTML : </label>
			<textarea id="htmlPaste" name="htmlPaste" rows={10} cols={80} onChange={onChange} /><br />
			<div style={{ width: '100%', textAlign: 'center' }}>
				<button type="button" onClick={onSubmit}>Extract</button>
				<input type="reset" />
			</div>
		</form>
	);
}

FormExtractEngine.propTypes = {
	url: PropTypes.string,
	htmlPaste: PropTypes.string,
	setFormData: PropTypes.func.isRequired
};
export type FormExtractEngineType = InferProps<typeof FormExtractEngine.propTypes>;
export function FormExtractEngine(props: FormExtractEngineType) {
	const proxy = 'https://proxy.pixelated.tech/prod/proxy?url=';
	// const proxy = "https://x3cf4kv0nk.execute-api.us-east-2.amazonaws.com/prod/proxy?url=";
	// const proxy = "https://thingproxy.freeboard.io/fetch/";
	const [ url, setURL ] = useState<string | null | undefined>(props.url);
	const [ htmlPaste, setHtmlPaste ] = useState<string | null | undefined>(props.htmlPaste);
	const [ formJson, setFormJson ] = useState<any>();

	function extractOptions (thisElement: HTMLSelectElement) {
		// GENERATE OPTIONS FOR SELECT FIELD - INTERNAL
		if (debug) console.log("Extracting Options...");
		if (thisElement.tagName.toLowerCase() === 'select' && thisElement.options && thisElement.options.length) {
			const options = [];
			for (let option = 0; option < thisElement.options.length; option++) {
				const thisOption = thisElement.options[option];
				const attribs: { [key: string]: any } = {};
				for (let attrib = 0; attrib < thisOption.attributes.length; attrib++) {
					const thisAttrib = thisOption.attributes[attrib];
					attribs[attributeMap(thisAttrib.name)] = thisAttrib.value;
				}
				if (thisOption.innerText) attribs.text = thisOption.innerText;
				if (Object.keys(attribs).length > 0) options.push(attribs); // not empty then add
			}
			if (options.length > 0) return options;
		}
		return false;
	}

	function extractSelectedOptions (thisOptions: any) {
		if (debug) console.log("Extracting Selected Options...");
		// GENERATE LIST OF SELECTED OPTIONS FOR SELECT FIELD - INTERNAL
		if (thisOptions && thisOptions.length) {
			const selected = [];
			for (let option = 0; option < thisOptions.length; option++) {
				const thisOption = thisOptions[option];

				if (Object.prototype.hasOwnProperty.call(thisOption, 'selected')) {
					selected.push(thisOption.value);
					delete thisOptions[option].selected;
				}
			}
			// MULTIPLE - Return array
			if (selected.length > 1) return selected;
			// Not Multiple = return string
			if (selected.length === 1) return selected.toString();
		}
		return false;
	}

	function extractAttribs (thisElement: HTMLFormElement) {
		if (debug) console.log("Extracting Attributes...");
		// EXTRACT ALL ATTRIBUTES FOR A FORM ELEMENT - INTERNAL
		// LOOK AT THAT - JAVASCRIPT REFLECTION!
		if (thisElement && thisElement.attributes && thisElement.attributes.length) {
			const props: { [key: string]: any } = {};
			for (let attrib = 0; attrib < thisElement.attributes.length; attrib++) {
				const thisAttrib = thisElement.attributes[attrib];
				if (thisAttrib.name === 'style') {
					// Do not gather styles
				} else if (['disabled', 'multiple', 'readonly', 'required', 'selected'].indexOf(thisAttrib.name.toLowerCase()) > -1) {
					// Flag type Attributes
					props[attributeMap(thisAttrib.name)] = attributeMap(thisAttrib.name);
				} else if (thisAttrib && thisAttrib.name && thisAttrib.value) {
					// use attributeMap to map html props to React props
					props[attributeMap(thisAttrib.name)] = thisAttrib.value;
				}
			}
			if (Object.keys(props).length > 0) return props;
		}
		return false;
	}

	function extractLabel (html: any, thisElement: HTMLFormElement) {
		// IDENTIFY AND EXTRACT LABEL PROPERTIES FOR A SPECIFIC FIELD - INTERNAL
		if (debug) console.log("Extracting Label...");
		const myElement = thisElement.attributes.getNamedItem('id');
		if (myElement && myElement.value) {
			const thisID = myElement.value;
			const thisLabel = html.querySelector("label[for='" + thisID + "']");
			if (thisLabel) return thisLabel;
		}
		return false;
	}

	function formToJSON (html: any) {
		// CONVERT HTML TO CONFIG JSON - INTERNAL
		if (debug) console.log("Converting Form to JSON...");
		const json: { [key: string]: any } = {};
		json.fields = [];
		const forms = html.getElementsByTagName('form');
		// ----- FORMS
		for (let form = 0; form < forms.length; form++) {
			const thisForm = forms[form];
			if (Object.keys(thisForm).length > 0) {
				// ----- ELEMENTS
				for (let element = 0; element < thisForm.elements.length; element++) {
					const thisElement = thisForm[element];
					const elem: { [key: string]: any } = {};
					if (thisElement && thisElement.attributes && thisElement.tagName) {
						// ----- COMPONENT
						elem.component = 'Form' + capitalize(thisElement.tagName);
						let props: { [key: string]: any } = {};
						// ----- ELEMENT ATTRIBUTES
						const thisProps = extractAttribs(thisElement);
						if (thisProps) props = thisProps;
						// ----- ELEMENT OPTIONS
						const thisOptions = extractOptions(thisElement);
						if (thisOptions) {
							// only true for SELECT elements
							const thisSelected = extractSelectedOptions(thisOptions);
							if (thisSelected) props.defaultValue = thisSelected;
							props.options = thisOptions;
						} else {
							// get innerText on all but SELECT elements
							if (thisElement.innerText) props.text = thisElement.innerText;
						}
						elem.props = props;
						// ----- LABEL
						const thisLabel = extractLabel(html, thisElement);
						if (thisLabel) {
							elem.props.label = (thisLabel.innerText || thisLabel.textContent);
						}
					}
					if (Object.keys(elem).length > 0) json.fields.push(elem);
				}
			}
		}
		return json;
	}

	function getHTML (url: string, callback: any) {
		// GET SERVER SIDE HTML THROUGH XMLHTTPREQUEST - INTERNAL
		if (debug) console.log("Getting HTML From URL...");
		const xhr = new XMLHttpRequest();
		// xhr.onreadystatechange = (e) => {
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4 && xhr.status === 200) {
				const json = callback(xhr.responseXML);
				setFormJson( json );
				props.setFormData(json);
			}
		};
		xhr.open('GET', url);
		xhr.responseType = 'document';
		xhr.send(null);
	}

	useEffect(() => {
		if (debug) console.log("Component Is Mounted...");
		if (props.url) {
			const newURL = proxy + props.url;
			if (!url || (props.url !== url)) {
				setURL( props.url );
				getHTML(newURL, formToJSON);
			} else if (url && !formJson) {
				getHTML(newURL, formToJSON);
			}
		} else if (props.htmlPaste) {
			let json: { [key: string]: any } = {};
			if (!htmlPaste || (props.htmlPaste !== htmlPaste)) {
				setHtmlPaste( props.htmlPaste );
				const thisHTML = new DOMParser().parseFromString(props.htmlPaste, 'text/html');
				json = formToJSON(thisHTML);
				setFormJson( json );
				props.setFormData(json);
			} else if (htmlPaste && !formJson) {
				const thisHTML = new DOMParser().parseFromString(htmlPaste, 'text/html');
				json = formToJSON(thisHTML);
				setFormJson( json );
				props.setFormData(json);
			}
		}
	}); // no dependencies = run on every render

	return (
		<div>
			<pre id='formJson'>{ JSON.stringify(formJson, null, 2) }</pre>
		</div>
	);
}