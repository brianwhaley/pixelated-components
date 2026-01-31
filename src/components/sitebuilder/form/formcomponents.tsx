
'use client';

import React, { useState } from "react";
import PropTypes, { InferProps } from "prop-types";
import { validateField } from "./formvalidator";
import { useFormValidation } from "./formvalidator";
import * as FVF from "./formfieldvalidations";
import { FontSelector } from "../config/FontSelector";
import { CompoundFontSelector } from "../config/CompoundFontSelector";
import "./form.css";


/*
InferProps to generate Types
https://amanhimself.dev/blog/prop-types-in-react-and-typescript/#inferring-proptypes-in-typescript
*/

// Shared helper to setup input props for form components
const setupInputProps = (props: any, display?: string) => {
	// Clone props efficiently using destructuring instead of JSON.parse/stringify
	let inputProps = { ...props };

	// Remove props that shouldn't go to DOM
	inputProps = Object.fromEntries(
		Object.entries(inputProps).filter(([key]) =>
			!['display', 'label', 'listItems', 'validate', 'options', 'parent', 'text', 'checked'].includes(key)
		)
	);

	// Set className based on display mode
	inputProps["className"] = (display == "vertical") ? "display-vertical" : "" ;

	// Handle controlled vs uncontrolled inputs properly
	// If value is provided, use it for controlled behavior
	// Otherwise, use defaultValue for uncontrolled behavior
	if (props.value !== undefined) {
		inputProps["value"] = props.value;
		// Remove defaultValue if value is present to avoid conflicts
		delete inputProps["defaultValue"];
	} else if (props.defaultValue !== undefined) {
		inputProps["defaultValue"] = props.defaultValue;
	}

	// For radio buttons, prioritize defaultChecked over checked to let browser handle state
	// This prevents React's "both checked and defaultChecked" error
	if (props.type === 'radio' || (props.parent && props.parent.type === 'radio')) {
		if (props.checked !== undefined) {
			delete inputProps["checked"];
		}
	}

	return inputProps;
};





// Custom hook for common form component logic
const useFormComponent = (props: any) => {
	const [validationState, setValidationState] = useState({ isValid: true, errors: [] as string[] });
	const { validateField: validateFormField } = useFormValidation();

	// Handle onChange for immediate feedback
	const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		// Determine the value (checkbox vs other)
		const target = event.target;
		const value = target.type === 'checkbox' ? ((target as HTMLInputElement).checked ? target.value : '') : event.target.value;

		// Call custom onChange handler synchronously so controlled inputs update immediately
		const customOnChange = props.onChange || (props.parent && props.parent.onChange);
		if (customOnChange) {
			try {
				customOnChange(value);
			} catch {
				// swallow handler errors to avoid breaking validation flow
			}
		}
	};

	// Handle onBlur for full validation
	const handleBlur = (event: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
		validateField(props, event).then(result => {
			setValidationState(result);
			if (props.id) {
				validateFormField(props.id, result.isValid, result.errors);
			}
		});
	};

	const formValidate = <FormTooltip id={`${props.id}-validate`} mode="validate" text={validationState.errors} />;
	const inputProps = setupInputProps(props, props.display);

	// Add validation event handlers
	inputProps["onChange"] = handleChange;
	inputProps["onBlur"] = handleBlur;
	inputProps["onInput"] = handleChange; // Also handle onInput for tests

	return { validationState, formValidate, inputProps, handleChange, handleBlur };
};





// Helper function for generating options (used by FormSelect, FormRadio, FormCheckbox)
const generateOptions = (
	options: any[],
	parentProps: any,
	prefix: string,
	optionComponent: React.ComponentType<any>
) => {
	let result = [];
	for (let option in options) {
		let key: any = option;
		let thisOption = options[key];
		// Create parent object without options to avoid circular references
		const parentWithoutOptions = Object.fromEntries(
			Object.entries(parentProps).filter(([key]) => key !== 'options')
		);
		thisOption.parent = { ...parentWithoutOptions };
		let thisKey = prefix + "-" + parentProps.id + "-" + thisOption.value;
		let newOption = React.createElement(optionComponent, { key: thisKey, ...thisOption });
		result.push(newOption);
	}
	return result;
};






/**
 * FormLabel — Render a label and optional tooltip for a form field.
 *
 * @param {string} [props.id] - ID of the form control the label targets.
 * @param {string} [props.label] - Text to display as the label.
 * @param {string} [props.tooltip] - Optional tooltip text explaining the field.
 * @param {string} [props.className] - Optional CSS class names for the label element.
 */
FormLabel.propTypes = {
/** ID of the control associated with this label */
	id: PropTypes.string.isRequired,
	/** Label text to display */
	label: PropTypes.string,
	/** Optional tooltip text */
	tooltip: PropTypes.string,
	/** Additional CSS class names */
	className: PropTypes.string,
};
FormLabel.defaultProps = {
	id: "",
	label: "",
	tooltip: "",
};
export type FormLabelType = InferProps<typeof FormLabel.propTypes>;
function FormLabel(props: FormLabelType) {
	return (
		< >
			{ props.label && props.id 
				? <label className={props.className || ''} 
					id={`lbl-${props.id}`} htmlFor={props.id}>{props.label}</label> 
				: "" }
			{ props.tooltip 
				? <FormTooltip id={props.id} text={[props.tooltip]} />
				: "" }
		</>
	);
}





/**
 * FormTooltip — Display contextual helper or validation messages for a form field.
 *
 * @param {string} [props.id] - ID used to associate the tooltip with a control.
 * @param {arrayOf} [props.text] - Array of strings to render inside the tooltip.
 * @param {string} [props.className] - CSS class names applied to the tooltip container.
 * @param {oneOf} [props.mode] - Mode of the tooltip: 'tooltip' for help or 'validate' for validation messages.
 */
FormTooltip.propTypes = {
/** Associated control id */
	id: PropTypes.string,
	/** Text lines to display in the tooltip */
	text: PropTypes.arrayOf(PropTypes.string).isRequired,
	/** Additional CSS class names */
	className: PropTypes.string,
	/** Tooltip mode */
	mode: PropTypes.oneOf(['tooltip', 'validate']),
};
FormTooltip.defaultProps = {
	id: "",
	mode: 'tooltip',
};
export type FormTooltipType = InferProps<typeof FormTooltip.propTypes>;
function FormTooltip(props: FormTooltipType) {
	const mode = props.mode || 'tooltip';
	if (mode === 'validate' && props.text.length <= 0) { return null; }
	const [showTooltip, setShowTooltip] = useState(false);
	const content = props.text.map((item, index) => (
		<div key={index} className="tooltip-text-item">{item}</div>	
	));
	const toggleTooltip = () => setShowTooltip(!showTooltip);
	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			toggleTooltip();
		}
	};
	const modeIcons = {
		tooltip: 'ⓘ', // U+24D8
		validate: '❌' // U+274C
	};
	let icon = modeIcons[mode as keyof typeof modeIcons];
	let mouseEvents = {
		onMouseEnter: () => setShowTooltip(true),
		onMouseLeave: () => setShowTooltip(false),
	};
	let clickHandler = toggleTooltip;

	return (
		<>
			<div id={ mode + "-" + props.id} className={`tooltip-container ${props.className || ''}`}>
				<span
					className={"tooltip-icon tooltip-icon-" + mode}
					{...mouseEvents}
					onClick={clickHandler}
					onKeyDown={handleKeyDown}
					aria-label="Show more info"
					aria-expanded={showTooltip}
					aria-describedby={showTooltip ? `${props.id}-tooltip` : undefined}
					tabIndex={0}
					role="button"
				>{icon}</span>
				{showTooltip && <div className="tooltip-text" role="tooltip" id={`${props.id}-tooltip`}>{content}</div>}
			</div>
		</>
	);
}





/**
 * FormInput — Generic input field used by the FormEngine. Supports standard input attributes and validation hooks.
 *
 * @param {string} [props.type] - Input type (text, number, email, etc.).
 * @param {string} [props.id] - Input id attribute (required).
 * @param {string} [props.name] - Input name attribute.
 * @param {string} [props.defaultValue] - Default value for uncontrolled inputs.
 * @param {string} [props.value] - Controlled value for the input.
 * @param {string} [props.list] - Datalist id to associate with the input.
 * @param {string} [props.listItems] - Comma-separated datalist items (internal convenience prop).
 * @param {string} [props.size] - Size attribute for text input.
 * @param {string} [props.maxLength] - Maximum characters allowed.
 * @param {string} [props.placeholder] - Placeholder text.
 * @param {string} [props.autoComplete] - Autocomplete hint.
 * @param {number} [props.tabIndex] - Tab order index.
 * @param {object} [props.style] - Inline styles applied to the input element.
 * @param {string} [props.min] - Minimum value (for number/date inputs).
 * @param {string} [props.max] - Maximum value (for number/date inputs).
 * @param {string} [props.step] - Step increment (for number inputs).
 * @param {string} [props.autoFocus] - Whether to autofocus the input.
 * @param {string} [props.disabled] - Disabled flag.
 * @param {string} [props.readOnly] - Read-only flag.
 * @param {string} [props.required] - Required flag.
 * @param {string} [props.display] - Display style (inline/block) for layout purposes.
 * @param {string} [props.label] - Label text associated with the input.
 * @param {string} [props.tooltip] - Tooltip/help text for the input.
 * @param {string} [props.className] - CSS class names applied to the input container.
 * @param {string} [props.validate] - Named validation rule to run for this input.
 * @param {function} [props.onChange] - Change handler invoked with synthetic change events.
 */
FormInput.propTypes = {
/** Input type (text, number, email, etc.) */
	type: PropTypes.string,
	/** Input id attribute */
	id: PropTypes.string.isRequired,
	/** Input name attribute */
	name: PropTypes.string,
	/** Default value for uncontrolled inputs */
	defaultValue: PropTypes.string,
	/** Controlled value */
	value: PropTypes.string,
	/** Associated datalist id */
	list: PropTypes.string,
	/** Comma-separated datalist items */
	listItems: PropTypes.string, /* this one is mine */
	/** Input size attribute */
	size: PropTypes.string,
	/** Maximum allowed characters */
	maxLength: PropTypes.string,
	/** Placeholder text */
	placeholder: PropTypes.string,
	/** Autocomplete hint */
	autoComplete: PropTypes.string,
	/** Tab ordering index */
	tabIndex: PropTypes.number,
	/** Inline style object */
	style: PropTypes.object,
	"aria-label": PropTypes.string,
	"aria-hidden": PropTypes.string,
	/** Minimum value for numeric/date inputs */
	min: PropTypes.string,
	/** Maximum value for numeric/date inputs */
	max: PropTypes.string,
	/** Step increment for numeric inputs */
	step: PropTypes.string,
	// flag attributes
	/** Autofocus flag */
	autoFocus: PropTypes.string,
	/** Disabled flag */
	disabled: PropTypes.string,
	/** Read-only flag */
	readOnly: PropTypes.string,
	/** Whether this field is required (use 'required' to mark mandatory) */
	required: PropTypes.string,
	// className, 
	// data-mapping, data-component-endpoint, data-testid
	// aria-invalid, aria-describedby, 
	// ----- for calculations
	/** Layout hint; use 'vertical' to stack label and control */
	display: PropTypes.string,
	/** Text label associated with the control */
	label: PropTypes.string,
	/** Helper text shown in a tooltip for the control */
	tooltip: PropTypes.string,
	/** Additional CSS classes applied to the container */
	className: PropTypes.string,
	/** Name of the validation rule to run for this field */
	validate: PropTypes.string,
	/** Change handler invoked with the new value */
	onChange: PropTypes.func,
};
export type FormInputType = InferProps<typeof FormInput.propTypes>;
export function FormInput(props: FormInputType) {
	const { formValidate, inputProps } = useFormComponent(props);
	let formDataList = props.list && props.list in FVF
		? FVF[props.list as keyof typeof FVF]
		: props.list && props.listItems
			? props.listItems.split(',')
			: undefined ;

	return (
		<div>
			{ props.type == "checkbox" ? <input {...inputProps} /> : "" }
			<FormLabel key={"label-" + props.id} id={props.id} label={props.label} />
			{ props.tooltip ? <FormTooltip id={props.id} text={[props.tooltip]} /> : "" }
			{ props.display == "vertical" ? formValidate : "" }
			{ props.type != "checkbox" ? <input {...inputProps} /> : "" }
			{ formDataList && Array.isArray(formDataList) ? <FormDataList id={props.list ?? ''} items={formDataList} /> : "" }
			{ props.display != "vertical" ? formValidate : "" }
		</div>
	);
}







/**
 * FormSelect — Render a standard HTML <select> element with generated option items.
 *
 * @param {string} [props.id] - Input id attribute.
 * @param {string} [props.name] - Input name attribute.
 * @param {string} [props.size] - visual size attribute for single-select lists.
 * @param {string} [props.autoComplete] - Autocomplete hint.
 * @param {oneOfType} [props.defaultValue] - Default selected value (string or array for multi-select).
 * @param {string} [props.autoFocus] - Autofocus flag.
 * @param {string} [props.disabled] - Disabled flag.
 * @param {string} [props.multiple] - Multiple selection flag.
 * @param {string} [props.readOnly] - Read-only flag.
 * @param {string} [props.required] - Required flag.
 * @param {string} [props.selected] - Currently selected value.
 * @param {array} [props.options] - Array of option objects used to generate options.
 * @param {string} [props.display] - Layout hint (e.g., 'vertical').
 * @param {string} [props.label] - Field label text.
 * @param {string} [props.tooltip] - Tooltip/help text.
 * @param {string} [props.className] - CSS class names.
 * @param {string} [props.validate] - Named validation rule.
 * @param {function} [props.onChange] - Change handler invoked with new value.
 */
FormSelect.propTypes = {
/** Input id */
	id: PropTypes.string.isRequired,
	/** Input name */
	name: PropTypes.string,
	/** Visual size for select */
	size: PropTypes.string,
	/** Autocomplete hint */
	autoComplete: PropTypes.string,
	/** Default selected value (or array for multi-select) */
	defaultValue: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.array
	]),
	/** Autofocus flag */
	autoFocus: PropTypes.string,
	/** Disabled flag */
	disabled: PropTypes.string,
	/** Multiple selection flag */
	multiple: PropTypes.string,
	/** Read-only flag */
	readOnly: PropTypes.string,
	/** Required flag */
	required: PropTypes.string,
	/** Option list array */
	options: PropTypes.array,
	/** Layout hint (e.g., 'vertical') */
	display: PropTypes.string,
	/** Label text */
	label: PropTypes.string,
	/** Helper text shown in a tooltip for the control */
	tooltip: PropTypes.string,
	/** Additional CSS classes applied to the select container */
	className: PropTypes.string,
	/** Name of the validation rule to run for this field */
	validate: PropTypes.string,
	/** Change handler invoked with the new value */
	onChange: PropTypes.func,
};
export type FormSelectType = InferProps<typeof FormSelect.propTypes>;
export function FormSelect(props: FormSelectType) {
	const { formValidate, inputProps } = useFormComponent(props);
	const options = generateOptions(props.options || [], props, "select", FormSelectOption);
	return (
		<div>
			<FormLabel key={"label-" + props.id} id={props.id} label = {props.label} />
			{ props.tooltip ? <FormTooltip id={props.id} text={[props.tooltip]} /> : "" }
			{ props.display == "vertical" ? formValidate : "" }
			<select {...inputProps} suppressHydrationWarning >
				{options}
			</select>
			{ props.display != "vertical" ? formValidate : "" }
		</div>
	);
}







/**
 * FormSelectOption — Render an individual <option> element for a select.
 *
 * @param {string} [props.text] - Visible option text.
 * @param {string} [props.value] - Option value attribute.
 * @param {boolean} [props.disabled] - Disable this option when true.
 */
FormSelectOption.propTypes = {
/** Visible text for the option */
	text: PropTypes.string,
	/** Option value attribute */
	value: PropTypes.string,
	/** Disabled flag for the option */
	disabled: PropTypes.bool,
};
export type FormSelectOptionType = InferProps<typeof FormSelectOption.propTypes>;
function FormSelectOption(props: FormSelectOptionType) {
	const { text, disabled, value, ...otherProps } = props;
	const inputProps: React.OptionHTMLAttributes<HTMLOptionElement> = {
		...otherProps,
		...(disabled !== null && disabled !== undefined ? { disabled } : {}),
		...(value !== null && value !== undefined ? { value } : {})
	};
	return (
		<option {...inputProps} >{text}</option>
	);
}








/**
 * FormTextarea — Multi-line text input with optional validation and label/tooltip support.
 *
 * @param {string} [props.id] - Textarea id attribute.
 * @param {string} [props.name] - Textarea name attribute.
 * @param {string} [props.rows] - Number of rows to display.
 * @param {string} [props.cols] - Number of columns (cols) attribute.
 * @param {string} [props.defaultValue] - Default text value for uncontrolled mode.
 * @param {number} [props.maxLength] - Maximum characters allowed.
 * @param {string} [props.placeholder] - Placeholder text.
 * @param {string} [props.autoComplete] - Autocomplete hint.
 * @param {string} [props.autoFocus] - Autofocus flag.
 * @param {string} [props.disabled] - Disabled flag.
 * @param {string} [props.readOnly] - Read-only flag.
 * @param {string} [props.required] - Required flag.
 * @param {string} [props.display] - Layout hint (e.g., 'vertical').
 * @param {string} [props.label] - Field label text.
 * @param {string} [props.tooltip] - Tooltip/help text.
 * @param {string} [props.className] - CSS class names.
 * @param {string} [props.validate] - Named validation rule.
 * @param {function} [props.onChange] - Change handler invoked with new value.
 */
FormTextarea.propTypes = {
/** Textarea id */
	id: PropTypes.string.isRequired,
	/** Textarea name */
	name: PropTypes.string,
	/** Number of rows */
	rows: PropTypes.string,
	/** Number of columns (visual width) */
	cols: PropTypes.string,
	/** Default uncontrolled text value */
	defaultValue: PropTypes.string,
	/** Maximum number of characters allowed */
	maxLength: PropTypes.number,
	/** Short hint displayed when the field is empty */
	placeholder: PropTypes.string,
	/** Browser autocomplete hint */
	autoComplete: PropTypes.string,
	// flag attributes
	/** If set, the control will receive focus on mount */
	autoFocus: PropTypes.string,
	/** Set to 'disabled' to render the control disabled */
	disabled: PropTypes.string,
	/** Set to 'readOnly' to prevent user edits */
	readOnly: PropTypes.string,
	/** Whether this field is required ('required' to mark mandatory) */
	required: PropTypes.string,
	// ----- for calculations
	/** Layout hint; use 'vertical' to stack label and control */
	display: PropTypes.string,
	/** Text label associated with the control */
	label: PropTypes.string,
	/** Helper text shown in a tooltip for the control */
	tooltip: PropTypes.string,
	/** Additional CSS classes applied to the container */
	className: PropTypes.string,
	/** Name of the validation rule to run for this field */
	validate: PropTypes.string,
	/** Change handler invoked with the new value */
	onChange: PropTypes.func,
};
export type FormTextareaType = InferProps<typeof FormTextarea.propTypes>;
export function FormTextarea(props: FormTextareaType) {
	const { formValidate, inputProps } = useFormComponent(props);
	return (
		<div>
			<FormLabel key={"label-" + props.id} id={props.id} label = {props.label} />
			{ props.tooltip ? <FormTooltip id={props.id} text={[props.tooltip]} /> : "" }
			{ props.display == "vertical" ? formValidate : "" }
			<textarea {...inputProps} />
			{ props.display != "vertical" ? formValidate : "" }
		</div>
	);
}






/**
 * FormRadio — Render a group of radio buttons from the provided options and handle selection.
 *
 * @param {string} [props.id] - Unique id for this control group.
 * @param {string} [props.name] - HTML name attribute shared by the radio inputs.
 * @param {array} [props.options] - Array of option objects ({ text, value, ... }).
 * @param {string} [props.autoFocus] - If present, the control will receive focus on mount.
 * @param {string} [props.disabled] - Set to 'disabled' to disable the control group.
 * @param {string} [props.readOnly] - Read-only flag; selection cannot be changed.
 * @param {string} [props.required] - Set to 'required' to mark the group mandatory.
 * @param {string} [props.selected] - Currently selected value.
 * @param {string} [props.display] - Layout hint ('vertical' to stack options).
 * @param {string} [props.label] - Optional label text shown above the group.
 * @param {string} [props.tooltip] - Optional helper text shown in a tooltip.
 * @param {string} [props.validate] - Named validation rule to apply to this field.
 * @param {function} [props.onChange] - Handler invoked with the new selected value.
 */
FormRadio.propTypes = {
/** Unique id for the control group */
	id: PropTypes.string.isRequired, // not using?
	/** HTML name attribute shared by all radio inputs in the group */
	name: PropTypes.string.isRequired,
	/** Array of option objects used to create radio options */
	options : PropTypes.array,
	// flag attributes
	/** If present, the control will receive focus on mount */
	autoFocus: PropTypes.string,
	/** Set to 'disabled' to disable the control group */
	disabled: PropTypes.string,
	/** Read-only flag; prevent user changes when set to 'readOnly' */
	readOnly: PropTypes.string,
	/** Set to 'required' to mark the group mandatory */
	required: PropTypes.string,
	// ? selected: PropTypes.string,
	// ----- for calculations
	/** Layout hint (use 'vertical' to stack options) */
	display: PropTypes.string,
	/** Optional label text shown above the group */
	label: PropTypes.string,
	/** Helper text shown in a tooltip for the group */
	tooltip: PropTypes.string,
	/** Named validation rule to apply */
	validate: PropTypes.string,
	/** Handler invoked with the new selected value */
	onChange: PropTypes.func,
};
export type FormRadioType = InferProps<typeof FormRadio.propTypes>;
export function FormRadio(props: FormRadioType) {
	const { formValidate } = useFormComponent(props);
	const options = generateOptions(props.options || [], props, "radio", FormRadioOption);
	return (
		<div>
			<FormLabel key={"label-" + props.id} id={props.name} label={props.label} />
			{ props.tooltip ? <FormTooltip id={props.id} text={[props.tooltip]} /> : "" }
			{ props.display == "vertical" ? formValidate : "" }
			{options}
			{ props.display != "vertical" ? formValidate : "" }
		</div>
	);
}






/**
 * FormRadioOption — Render an individual radio option within a FormRadio group.
 *
 * @param {string} [props.name] - HTML name attribute shared by the option.
 * @param {string} [props.text] - Visible label text for the option.
 * @param {string} [props.value] - Option value submitted when selected.
 * @param {string} [props.checked] - Whether this option is currently selected.
 * @param {any} [props.parent] - Reference to the parent control (used for controlled behavior).
 */
FormRadioOption.propTypes = {
/** HTML name attribute shared by the option */
	name: PropTypes.string,
	/** Visible label text for the option */
	text: PropTypes.string,
	/** Option value submitted when selected */
	value: PropTypes.string.isRequired,
	// flag attributes
	/** Whether this option is currently selected */
	checked : PropTypes.string,
	// ----- for calculations
	/** Reference to the parent control (used for controlled behavior) */
	parent : PropTypes.any,
};
export type FormRadioOptionType = InferProps<typeof FormRadioOption.propTypes>;
function FormRadioOption(props: FormRadioOptionType) {
	const inputProps = setupInputProps(props);
	// Determine whether parent supplied a controlled contract (value + updater)
	const parentHasOnChange = Boolean(props.parent && typeof props.parent.onChange === 'function');
	const isChecked = props.parent && props.parent.checked === props.value;

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (props.parent && typeof props.parent.onChange === 'function') {
			props.parent.onChange(props.value);
		}
	};

	// If there is no parent onChange (no updater), render uncontrolled via defaultChecked
	const controlProps = parentHasOnChange ? { checked: isChecked } : { defaultChecked: isChecked };

	return (
		<span className={ props.parent && props.parent.display == "vertical" ? "display-vertical" : ""}>
			<input type="radio"
				id={`${props.parent?.name}-${props.value}`}
				name={props.parent?.name}
				value={props.value}
				{...controlProps}
				onChange={handleChange}
				required={!!(props.parent && props.parent.required)}
				{...inputProps} />
			<label htmlFor={`${props.parent?.name}-${props.value}`}>{props.text}</label>
		</span>
	);
}






/**
 * FormCheckbox — Render a set of checkbox inputs from provided options and manage selection array.
 *
 * @param {string} [props.id] - Unique id for this control group.
 * @param {string} [props.name] - Base name used for generated checkbox inputs.
 * @param {array} [props.options] - Array of option objects ({ text, value, ... }).
 * @param {string} [props.autoFocus] - If present, the control will receive focus on mount.
 * @param {string} [props.disabled] - Set to 'disabled' to disable the control group.
 * @param {string} [props.readOnly] - Read-only flag; selection cannot be changed.
 * @param {string} [props.display] - Layout hint (e.g., 'vertical' to stack checkboxes).
 * @param {string} [props.label] - Optional label text shown above the group.
 * @param {string} [props.tooltip] - Optional helper text shown in a tooltip.
 * @param {string} [props.className] - Additional CSS classes applied to the container.
 * @param {string} [props.validate] - Named validation rule to apply to the group.
 * @param {function} [props.onChange] - Handler invoked with the updated selected values array.
 */
FormCheckbox.propTypes = {
/** Unique id for the control group */
	id: PropTypes.string.isRequired,
	/** Base name used for generated checkbox inputs */
	name: PropTypes.string.isRequired,
	/** Array of option objects used to create checkbox options */
	options : PropTypes.array,
	// flag attributes
	/** If present, the control will receive focus on mount */
	autoFocus: PropTypes.string,
	/** Set to 'disabled' to disable the control group */
	disabled: PropTypes.string,
	/** Read-only flag; prevent user changes when set to 'readOnly' */
	readOnly: PropTypes.string,
	// ----- for calculations
	/** Layout hint; use 'vertical' to stack checkboxes */
	display: PropTypes.string,
	/** Optional label text shown above the group */
	label: PropTypes.string,
	/** Helper text shown in a tooltip for the group */
	tooltip: PropTypes.string,
	/** Additional CSS classes applied to the container */
	className: PropTypes.string,
	/** Named validation rule to apply to the group */
	validate: PropTypes.string,
	/** Handler invoked with the updated selected values array */
	onChange: PropTypes.func,
};
export type FormCheckboxType = InferProps<typeof FormCheckbox.propTypes>;
export function FormCheckbox(props: FormCheckboxType) {
	const { formValidate } = useFormComponent(props);
	const options = generateOptions(props.options || [], props, "checkbox", FormCheckboxOption);
	return (
		<div>
			<FormLabel key={"label-" + props.id} id={props.name} label={props.label} />
			{ props.tooltip ? <FormTooltip id={props.id} text={[props.tooltip]} /> : "" }
			{ props.display == "vertical" ? formValidate : "" }
			{options}
			{ props.display != "vertical" ? formValidate : "" }
		</div>
	);
}







/**
 * FormCheckboxOption — Render a single checkbox option for a FormCheckbox group.
 *
 * @param {string} [props.text] - Visible label text for the checkbox option.
 * @param {string} [props.value] - Value attribute for the option.
 * @param {string} [props.selected] - Whether this option is selected (initial/default state).
 * @param {any} [props.parent] - Reference to the parent control (used to update values).
 */
FormCheckboxOption.propTypes = {
/** Visible label text for the checkbox option */
	text: PropTypes.string.isRequired,
	/** Value attribute for the option */
	value: PropTypes.string.isRequired,
	// flag attributes
	/** Whether this option is selected (used for initial/default state) */
	selected : PropTypes.string,
	// ----- for calculations
	/** Reference to the parent control (used to update values) */
	parent : PropTypes.any,
	
};
export type FormCheckboxOptionType = InferProps<typeof FormCheckboxOption.propTypes>;
function FormCheckboxOption(props: FormCheckboxOptionType) {
	const inputProps = setupInputProps(props);
	const isChecked = props.parent.checked ? props.parent.checked.includes(props.value) : false;
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (props.parent.onChange) {
			const currentChecked = props.parent.checked || [];
			let newChecked;
			if (e.target.checked) {
				newChecked = [...currentChecked, props.value];
			} else {
				newChecked = currentChecked.filter((val: string) => val !== props.value);
			}
			props.parent.onChange(newChecked);
		}
	};
	return (
		<span className={ props.parent.display == "vertical" ? "display-vertical" : ""}>
			<input type="checkbox" 
				id={props.parent.name + "_" + props.text} 
				name={props.text} value={props.value} 
				checked={isChecked}
				onChange={handleChange}
				{...inputProps}
			/>
			<label htmlFor={props.parent.name + "_" + props.text}>{props.text}</label>
		</span>
	);
}






/**
 * FormButton — Render a standard HTML button used for form actions.
 *
 * @param {string} [props.type] - Button type: 'button' | 'submit' | 'reset'.
 * @param {string} [props.id] - Unique identifier for the button element.
 * @param {string} [props.text] - Text displayed inside the button.
 * @param {string} [props.className] - Additional CSS classes for the button.
 * @param {function} [props.onClick] - Click handler function.
 */
FormButton.propTypes = {
/** Button type: 'button' | 'submit' | 'reset' */
	type: PropTypes.string,
	/** Unique identifier for the button element */
	id: PropTypes.string.isRequired,
	/** Text displayed inside the button */
	text: PropTypes.string,
	// ----- for calculations
	/** Additional CSS classes for the button */
	className: PropTypes.string,
	/** Click handler function */
	onClick: PropTypes.func
};
export type FormButtonType = InferProps<typeof FormButton.propTypes>;
export function FormButton(props: FormButtonType) {
	return (
		<div>
			<button 
				type={props.type as "button" | "submit" | "reset" | undefined} 
				id={props.id} 
				className={props.className || ""} 
				onClick={props.onClick || undefined}>{props.text}</button>
		</div>
	);
}








/**
 * FormDataList — Render a native HTML <datalist> used to provide suggestions for text inputs.
 *
 * @param {string} [props.id] - Id attribute for the generated <datalist> element.
 * @param {array} [props.items] - Array of string items to include as options.
 */
FormDataList.propTypes = {
/** Id attribute for the generated <datalist> element */
	id: PropTypes.string.isRequired,
	/** Array of string items to include as options */
	items: PropTypes.array,
};
export type FormDataListType = InferProps<typeof FormDataList.propTypes>;
export function FormDataList(props: FormDataListType) {
	const options = [];
	for (const item in props.items) {
		let key: any = item;
		const thisItem = props.items[key];
		const newOption = <option key={props.id + '-' + thisItem} value={thisItem} />;
		options.push(newOption);
	}
	return (
		<datalist id={props.id}>{options}</datalist>
	);
}








/**
 * FormTagInput — Tag entry control that allows adding/removing multiple string tags.
 *
 * @param {string} [props.id] - Unique id for the tag input control.
 * @param {string} [props.name] - Name attribute for the input element.
 * @param {arrayOf} [props.defaultValue] - Initial tags for uncontrolled mode.
 * @param {arrayOf} [props.value] - Controlled tags array when used as a controlled component.
 * @param {string} [props.placeholder] - Placeholder text shown when empty.
 * @param {string} [props.autoComplete] - Browser autocomplete hint.
 * @param {string} [props.disabled] - Set to 'disabled' to disable input.
 * @param {string} [props.readOnly] - Set to 'readOnly' to prevent edits.
 * @param {string} [props.required] - Mark field as required when set to 'required'.
 * @param {string} [props.display] - Layout hint (e.g., 'vertical' to place validation below).
 * @param {string} [props.label] - Label text for the control.
 * @param {string} [props.tooltip] - Helper text shown in a tooltip.
 * @param {string} [props.className] - Additional CSS classes for the component.
 * @param {string} [props.validate] - Named validation rule to run for this field.
 * @param {function} [props.onChange] - Change handler invoked with the updated tags array.
 */
FormTagInput.propTypes = {
/** Unique id for the tag input control */
	id: PropTypes.string.isRequired,
	/** Name attribute for the input element */
	name: PropTypes.string,
	/** Initial tags for uncontrolled mode */
	defaultValue: PropTypes.arrayOf(PropTypes.string),
	/** Controlled tags array when used as a controlled component */
	value: PropTypes.arrayOf(PropTypes.string),
	/** Placeholder text shown when empty */
	placeholder: PropTypes.string,
	/** Browser autocomplete hint */
	autoComplete: PropTypes.string,
	// flag attributes
	/** Set to 'disabled' to disable input */
	disabled: PropTypes.string,
	/** Set to 'readOnly' to prevent edits */
	readOnly: PropTypes.string,
	/** Mark field as required when set to 'required' */
	required: PropTypes.string,
	// ----- for calculations
	/** Layout hint (e.g., 'vertical' to place validation below) */
	display: PropTypes.string,
	/** Label text for the control */
	label: PropTypes.string,
	/** Helper text shown in a tooltip */
	tooltip: PropTypes.string,
	/** Additional CSS classes for the component */
	className: PropTypes.string,
	/** Named validation rule to run for this field */
	validate: PropTypes.string,
	/** Change handler invoked with the updated tags array */
	onChange: PropTypes.func,
};
export type FormTagInputType = InferProps<typeof FormTagInput.propTypes>;
export function FormTagInput(props: FormTagInputType) {
	const [inputValue, setInputValue] = useState('');
	const [internalTags, setInternalTags] = useState<string[]>(
		Array.isArray(props.defaultValue) ? props.defaultValue.filter((tag): tag is string => tag != null) : []
	);
	const { formValidate, handleBlur } = useFormComponent(props);
	const { validateField } = useFormValidation();

	// Determine if component is controlled or uncontrolled
	const isControlled = props.value !== undefined;
	
	// Get current tags array - use props.value if controlled, otherwise internal state
	const currentTags = isControlled 
		? (Array.isArray(props.value) ? props.value.filter((tag): tag is string => tag != null) : [])
		: internalTags;

	// Handle adding a new tag
	const addTag = (tag: string) => {
		const trimmedTag = tag.trim();
		if (trimmedTag && !currentTags.includes(trimmedTag)) {
			const newTags = [...currentTags, trimmedTag];
			
			// Always call onChange if provided (for external updates)
			if (props.onChange) {
				props.onChange(newTags);
			}
			
			if (!isControlled) {
				// Uncontrolled mode: update internal state
				setInternalTags(newTags);
			}
			
			// Trigger form validation
			if (props.id) {
				validateField(props.id, true, []);
			}
		}
		setInputValue('');
	};

	// Handle removing a tag
	const removeTag = (tagToRemove: string) => {
		const newTags = currentTags.filter(tag => tag !== tagToRemove);
		
		// Always call onChange if provided (for external updates)
		if (props.onChange) {
			props.onChange(newTags);
		}
		
		if (!isControlled) {
			// Uncontrolled mode: update internal state
			setInternalTags(newTags);
		}
		
		// Trigger form validation
		if (props.id) {
			validateField(props.id, true, []);
		}
	};

	// Handle input key events
	const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key === 'Enter' || event.key === ',') {
			event.preventDefault();
			addTag(inputValue);
		} else if (event.key === 'Backspace' && inputValue === '' && currentTags.length > 0) {
			// Remove last tag on backspace when input is empty
			const lastTag = currentTags[currentTags.length - 1];
			if (lastTag) {
				removeTag(lastTag);
			}
		}
	};

	// Handle input change
	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);
	};

	return (
		<div className={`form-tag-input ${props.className || ''}`}>
			<FormLabel key={"label-" + props.id} id={props.id} label={props.label} />
			{props.tooltip ? <FormTooltip id={props.id} text={[props.tooltip]} /> : ""}
			{props.display === "vertical" ? formValidate : ""}

			{/* Tag display area */}
			<div className="tag-container">
				{currentTags.map((tag, index) => (
					<span key={index} className="tag-chip">
						{tag}
						<button
							type="button"
							className="tag-remove"
							onClick={() => removeTag(tag as string)}
							aria-label={`Remove ${tag}`}
							disabled={props.disabled === 'disabled'}
						>
							×
						</button>
					</span>
				))}

				{/* Input field for adding new tags */}
				<input
					type="text"
					id={props.id}
					name={props.name || undefined}
					value={inputValue}
					onChange={handleInputChange}
					onKeyDown={handleKeyDown}
					placeholder={props.placeholder || "Add tag..."}
					autoComplete={props.autoComplete || undefined}
					disabled={props.disabled === 'disabled'}
					readOnly={props.readOnly === 'readOnly'}
					required={props.required === 'required'}
					className="tag-input"
					aria-label="Add new tag"
				/>
			</div>

			{props.display !== "vertical" ? formValidate : ""}
		</div>
	);
}








/**
 * FormFieldset — Semantic grouping container used by form components.
 *
 * This component currently does not accept any props but provides a named
 * placeholder for grouping form fields and future extensions.
 * @param {any} [props] - No props are accepted by FormFieldset.
 */
/** FormFieldset.propTypes — No props */
FormFieldset.propTypes = { /** no props */ };
export type FormFieldsetType = InferProps<typeof FormFieldset.propTypes>;
export function FormFieldset(props: FormFieldsetType) {
	return (
		<></>
	);
}








/*
  FormHoneypot — MVP
  - id: "winnie" (canonical)
  - default name: "website"
  - inline off-screen styling: { position: 'absolute', top: '-9999px' }
  - aria-hidden + tabIndex -1 + autocomplete="off"
  - no label / no validation / no required
*/
/**
 * FormHoneypot — Render a hidden honeypot text input used to trap automated spam bots.
 *
 * @param {string} [props.id] - Id for the honeypot field (defaults to 'winnie').
 * @param {string} [props.name] - Name attribute for the honeypot input (defaults to 'website').
 */
FormHoneypot.propTypes = {
/** Id for the honeypot field (defaults to 'winnie') */
	id: PropTypes.string.isRequired,
	/** Name attribute for the honeypot input (defaults to 'website') */
	name: PropTypes.string,
};
export type FormHoneypotType = InferProps<typeof FormHoneypot.propTypes>;
export function FormHoneypot({ id = "winnie", name }: FormHoneypotType) {
	const hpProps: FormInputType = {
		type: 'text',
		id: "winnie",
		name: name || 'website',
		defaultValue : null,
		autoComplete: 'off',
		'aria-hidden': 'true',
		tabIndex: -1,
		style: { position: 'absolute', top: '-9999px' },
	};
	return (
		<FormInput {...hpProps} />
	);
}
