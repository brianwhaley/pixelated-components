"use client";

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { generateKey } from '../../general/utilities';
import { FormValidationProvider, useFormValidation } from './formvalidator';
import { FormSubmitWrapper, useFormSubmitContext } from './formsubmit';

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


/**
 * FormEngine — Render a form defined by a JSON `formData` schema. Converts `formData.fields` to React components and manages submission handling and validation.
 *
 * Can be used in two ways:
 * 1. JSON-driven (recommended): formData.properties defines form behavior. Wrap in FormSubmitWrapper or use alone (defaults apply)
 * 2. Code-driven (backwards compatible): Pass name, id, onSubmitHandler as props
 *
 * @param {string} [props.name] - Form HTML name attribute. Falls back to formData.properties.name
 * @param {string} [props.id] - Form HTML id attribute. Falls back to formData.properties.id
 * @param {string} [props.method] - HTTP method for form submission (default: 'post').
 * @param {function} [props.onSubmitHandler] - Optional submit handler invoked with the submit event.
 * @param {object} [props.formData] - JSON schema describing fields (object with `fields` array and optional `properties` object).
 */
FormEngine.propTypes = {
/** Form name attribute. Falls back to formData.properties.name */
	name: PropTypes.string,
	/** Form id attribute. Falls back to formData.properties.id */
	id: PropTypes.string,
	/** HTTP method (e.g., 'post') */
	method: PropTypes.string,
	/** Submit handler called when the form is valid and submitted. Falls back to FormSubmitWrapper context if available */
	onSubmitHandler: PropTypes.func,
	/** JSON schema describing form fields and submission properties */
	formData: PropTypes.object.isRequired
};
export type FormEngineType = InferProps<typeof FormEngine.propTypes>;
export function FormEngine(props: FormEngineType) {
	// Check if form should use internal FormSubmitWrapper
	const hasJsonProperties = (props.formData as any)?.properties;
	const hasNoSubmitHandler = !props.onSubmitHandler;
	const shouldUseFormSubmitWrapper = hasJsonProperties && hasNoSubmitHandler;

	return (
		<FormValidationProvider>
			{shouldUseFormSubmitWrapper ? (
				<FormSubmitWrapper {...(props.formData as any).properties}>
					<FormEngineInner {...(props as any)} />
				</FormSubmitWrapper>
			) : (
				<FormEngineInner {...(props as any)} />
			)}
		</FormValidationProvider>
	);
}

/**
 * FormEngineInner — Internal implementation of the `FormEngine` that renders the generated fields and handles form submit/validation.
 *
 * @param {string} [props.name] - Form HTML name attribute.
 * @param {string} [props.id] - Form HTML id attribute.
 * @param {string} [props.method] - HTTP method for submission.
 * @param {function} [props.onSubmitHandler] - Submit handler invoked when form is validated.
 * @param {object} [props.formData] - JSON schema describing fields (object with `fields` array).
 */
FormEngineInner.propTypes = {
/** Form name attribute */
	name: PropTypes.string,
	/** Form id attribute */
	id: PropTypes.string,
	/** HTTP method */
	method: PropTypes.string,
	/** Submit handler */
	onSubmitHandler: PropTypes.func,
	/** JSON form schema */
	formData: PropTypes.object.isRequired
};
type FormEngineInnerType = InferProps<typeof FormEngineInner.propTypes>;
function FormEngineInner(props: FormEngineInnerType) {
	const { validateAllFields } = useFormValidation();

	// Try to get handleSubmit from FormSubmitWrapper context
	let contextSubmitHandler: ((event: React.FormEvent<HTMLFormElement>) => Promise<void>) | undefined;
	try {
		const context = useFormSubmitContext();
		contextSubmitHandler = context?.handleSubmit;
	} catch (e) {
		// Not inside FormSubmitWrapper - use provided handler
	}

	function generateFormProps(props: any) {
		// GENERATE PROPS TO RENDER THE FORM CONTAINER, INTERNAL FUNCTION
		if (debug) console.log("Generating Form Props");
		// Create a clean copy without non-serializable properties
		const { formData, onSubmitHandler, ...formProps } = props;
		
		// Extract name/id from properties with fallback to props
		if (!formProps.name && (formData as any)?.properties?.name) {
			formProps.name = (formData as any).properties.name;
		}
		if (!formProps.id && (formData as any)?.properties?.id) {
			formProps.id = (formData as any).properties.id;
		}
		
		// Safety: default to POST to avoid accidental GET navigation (prevents query leakage)
		if (!formProps.method) formProps.method = 'post';
		return formProps;
	}

	/**
	 * generateNewFields — Internal: convert JSON-form `formData.fields` into React elements for rendering.
	 *
	 * @param {any} [props.formData] - JSON form schema with `fields` array to convert.
	 */
	generateNewFields.propTypes = {
		/** JSON form schema with `fields` array */
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

		// Try context handler first (from FormSubmitWrapper), then props handler
		const handler = contextSubmitHandler || props.onSubmitHandler;
		if (handler) handler(event as any);
		return true;
	}

	return (
		<form {...generateFormProps(props)} onSubmit={(event) => { handleSubmit(event); }} suppressHydrationWarning >{generateNewFields(props)}</form>
	);
}
