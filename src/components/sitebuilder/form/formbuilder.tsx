"use client";

import React, { useState, JSX } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import * as FC from './formcomponents';
import { mapTypeToComponent, generateTypeField } from './formutils';
import { FormEngine } from './formengine';
const debug = false;

/* =====  FORM BUILDER =====
Display all the components for a Form Builder -
Element Buttons, Element Details, and the Form */

/**
 * FormBuilder — Visual editor for composing forms via JSON schema. Provides a field editor and a live preview powered by `FormEngine`.
 *
 * @param {function} [props.setFormData] - Callback that receives generated field JSON when building a new field (used by the UI to pass schema to the preview).
 */
FormBuilder.propTypes = {
	/** Callback invoked with generated form JSON */
	setFormData: PropTypes.func,
};
export type FormBuilderType = InferProps<typeof FormBuilder.propTypes>;
export function FormBuilder(): JSX.Element {
	// const [ url, setURL ] = useState('');
	// const [ htmlPaste, setHtmlPaste ] = useState('');
	type FormFieldsType = { fields: any[] } & { [key: string]: any }
	const [ formData, setFormData ] = useState<FormFieldsType>({ fields: [] });
	const [ fieldFormData, setFieldFormData ] = useState<FormFieldsType>({ fields: [] });

	function appendFormData(event: React.FormEvent) {
		// APPEND JSON FOR NEW FIELD TO EXISTING JSON CONFIG OBJECT - EXPOSED EXTERNAL
		if (debug) console.log("Appending form Data...");
		const props: { [key: string]: any } = {};
		const target = event.target as HTMLFormElement;
		for (const prop in target) {
			const thisProp = (target as any)[prop];
			if (thisProp && thisProp.value && ( thisProp.value !== Object(thisProp.value) ) ) {
				props[thisProp.name] = thisProp.value;
			}
		}
		const field: { [key: string]: any } = {};
		field.props = props;
		field.component = mapTypeToComponent(field.props.type);
		let fields = [];
		if (Object.keys(formData).length > 0) { fields = JSON.parse(JSON.stringify(formData.fields)); }
		fields[fields.length] = field;
		setFormData( { fields: fields } );
		setFieldFormData({ fields: [] });
		return (field);
	}

	/* function getCircularReplacer() {
		const seen = new WeakSet();
		return (key, value) => {
		  	if (typeof value === 'object' && value !== null) {
				if (seen.has(value)) {
			  		return ; // return undefined ;
				}
				seen.add(value);
		  	}
		  	return value;
		};
	} */

	return (
		<div className="section-container">
			<div style={{ display: 'inline-block', verticalAlign: 'top' }}>
				<FormBuild setFormData={setFieldFormData} />
				<div></div>
				<FormEngine name="field_props" id="field_props"
					onSubmitHandler={appendFormData}
					formData={fieldFormData} />
			</div>
			<div style={{ display: 'inline-block', verticalAlign: 'top' }} >
				<pre style={{ width: '100%' }} >{ JSON.stringify(formData, null, 2) }</pre>
			</div>
			<div><br /><br /><hr /><br /><br /></div>
			<div style={{ display: 'block', verticalAlign: 'top' }}>
				<FormEngine formData={formData || {}} />
			</div>
		</div>
	);
}



/*
===== FORM BUILD =====
Dynamically generate, component by component, and prop by prop,
the JSON to create a form via FormEngine
*/

FormBuild.propTypes = {
/** Callback used to set the generated field JSON in the parent */
	setFormData: PropTypes.func.isRequired,
};
export type FormBuildType = InferProps<typeof FormBuild.propTypes>;
export function FormBuild(props: FormBuildType) {

	function generateFieldJSON (component: string, type: string) {
		// GENERATE THE JSON TO DISPLAY A FORM TO ADD A FIELD - INTERNAL
		if (debug) console.log("Generating Form JSON for ", component , " Type : ", type);
		const form: { fields: { [key: string]: any }[] } = { fields: [] };
		let i = 0;
		for (const prop in FC[component as keyof typeof FC].propTypes) {
			const field: { [key: string]: any } = {};
			field.component = 'FormInput';
			const props: { [key: string]: any } = {};
			props.label = prop;
			props.name = prop;
			props.id = prop;
			props.type = 'text';
			if (prop === 'type') {
				props.disabled = true;
				props.value = type;
				props.list = 'inputTypes';
			}
			field.props = props;
			form.fields[i] = field;
			i++;
		}
		const addButton = {
			component: 'FormButton',
			props: {
				label: 'Add ' + component,
				type: 'submit',
				id: 'Add ' + component,
				text: 'Add ' + component
			}
		};
		form.fields[i] = addButton;
		return (form);
	}

	function handlePhaseOneSubmit(event: React.FormEvent){
		// GENERATE THE JSON TO DISPLAY A FORM TO ADD A FIELD - EXTERNAL
		const target = event.target as HTMLFormElement;
		const typeElement = target.elements.namedItem('type') as HTMLInputElement;
		const myType = typeElement ? typeElement.value : '';
		const myComponent = mapTypeToComponent(myType);
		const fieldJSON = generateFieldJSON(myComponent, myType);
		props.setFormData(fieldJSON);
		return true;
	}

	return (
		<>
			<FormEngine
				formData={generateTypeField()}
				onSubmitHandler={ event => { handlePhaseOneSubmit(event); } }
				name="build"
				id="build"
				method="post" />
		</>
	);
}