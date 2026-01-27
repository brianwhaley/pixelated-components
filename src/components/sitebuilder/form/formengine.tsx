"use client";

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { generateKey } from './formutils';
import { FormValidationProvider, useFormValidation } from './formvalidator';

import * as FC from './formcomponents';
import { CompoundFontSelector } from '../config/CompoundFontSelector';
import { FontSelector } from '../config/FontSelector';

// Merge a local components map to include config-level components without re-exporting them
export const COMPONENTS: Record<string, React.ElementType> = {
	...(FC as Record<string, React.ElementType>),
	CompoundFontSelector,
	FontSelector,
};

const debug = false;

/* ===== FORM ENGINE =====
Generate all the elements to display a form */


FormEngine.propTypes = {
	name: PropTypes.string,
	id: PropTypes.string,
	method: PropTypes.string,
	onSubmitHandler: PropTypes.func,
	formData: PropTypes.object.isRequired
};
export type FormEngineType = InferProps<typeof FormEngine.propTypes>;
export function FormEngine(props: FormEngineType) {
	return (
		<FormValidationProvider>
			<FormEngineInner {...(props as any)} />
		</FormValidationProvider>
	);
}

FormEngineInner.propTypes = {
	name: PropTypes.string,
	id: PropTypes.string,
	method: PropTypes.string,
	onSubmitHandler: PropTypes.func,
	formData: PropTypes.object.isRequired
};
type FormEngineInnerType = InferProps<typeof FormEngineInner.propTypes>;
function FormEngineInner(props: FormEngineInnerType) {
	const { validateAllFields } = useFormValidation();

	function generateFormProps(props: any) {
		// GENERATE PROPS TO RENDER THE FORM CONTAINER, INTERNAL FUNCTION
		if (debug) console.log("Generating Form Props");
		// Create a clean copy without non-serializable properties
		const { formData, onSubmitHandler, ...formProps } = props;
		// Safety: default to POST to avoid accidental GET navigation (prevents query leakage)
		if (!formProps.method) formProps.method = 'post';
		return formProps;
	}

	generateNewFields.propTypes = {
		formData: PropTypes.any.isRequired,
	};
	type generateNewFieldsType = InferProps<typeof generateNewFields.propTypes>;
	function generateNewFields(props: generateNewFieldsType) {
		// CORE OF THE FORM ENGINE - CONVERT JSON TO COMPONENTS - INTERNAL
		if (debug) console.log("Generating Form Fields");
		const newFields = [];
		const formFields = props.formData.fields;
		if (props.formData && formFields) {
			// const thisFields = formFields;
			for (let field = 0; field < formFields.length; field++) {
				const thisField = formFields[field];
				// Shallow clone props to preserve function handlers (JSON stringify drops functions)
				const newProps: any = { ...thisField.props };
				newProps.key = thisField.props.id || generateKey();

				// Convert string numeric props to numbers where needed
				const numericProps = ['maxLength', 'minLength', 'rows', 'cols', 'size', 'step'];
				numericProps.forEach(prop => {
					if (
						newProps[prop] !== undefined &&
						newProps[prop] !== null &&
						newProps[prop] !== ''
					) {
						// Only convert if the value is not already a number
						if (typeof newProps[prop] === 'string') {
							const num = Number(newProps[prop]);
							if (!isNaN(num)) {
								newProps[prop] = num;
							}
						}
					}
				});

				const componentName: string = thisField.component;
				const newElementType = (COMPONENTS as Record<string, React.ElementType>)[componentName];
				const newElement = React.createElement(newElementType, newProps);
				newFields.push(newElement);
			}
		}
		return newFields;
	}

	function handleSubmit(event: React.FormEvent) {
		// HANDLES THE FORM ACTION / FORM SUBMIT - EXPOSED EXTERNAL
		event.preventDefault();

		// Check if form is valid before submission
		if (!validateAllFields()) {
			// Form has validation errors, don't submit
			return false;
		}

		if (props.onSubmitHandler) props.onSubmitHandler(event);
		return true;
	}

	return (
		<form {...generateFormProps(props)} onSubmit={(event) => { handleSubmit(event); }} suppressHydrationWarning >{generateNewFields(props)}</form>
	);
}
