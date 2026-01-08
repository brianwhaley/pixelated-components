
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
	inputProps["className"] = (display == "vertical") ? "displayVertical" : "" ;

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






FormLabel.propTypes = {
	id: PropTypes.string.isRequired,
	label: PropTypes.string,
	tooltip: PropTypes.string,
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





FormTooltip.propTypes = {
	id: PropTypes.string,
	text: PropTypes.arrayOf(PropTypes.string).isRequired,
	className: PropTypes.string,
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





FormInput.propTypes = {
	type: PropTypes.string,
	id: PropTypes.string.isRequired,
	name: PropTypes.string,
	defaultValue: PropTypes.string,
	value: PropTypes.string,
	list: PropTypes.string,
	listItems: PropTypes.string, /* this one is mine */
	size: PropTypes.string,
	maxLength: PropTypes.string,
	placeholder: PropTypes.string,
	autoComplete: PropTypes.string,
	"aria-label": PropTypes.string,
	min: PropTypes.string,
	max: PropTypes.string,
	step: PropTypes.string,
	// flag attributes
	autoFocus: PropTypes.string,
	disabled: PropTypes.string,
	readOnly: PropTypes.string,
	required: PropTypes.string,
	// className, 
	// data-mapping, data-component-endpoint, data-testid
	// aria-invalid, aria-describedby, 
	// ----- for calculations
	display: PropTypes.string,
	label: PropTypes.string,
	tooltip: PropTypes.string,
	className: PropTypes.string,
	validate: PropTypes.string,
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







FormSelect.propTypes = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string,
	size: PropTypes.string,
	autoComplete: PropTypes.string,
	defaultValue: PropTypes.oneOfType([
		  PropTypes.string,
		  PropTypes.array
	]),
	// flag attributes
	autoFocus: PropTypes.string,
	disabled: PropTypes.string,
	multiple: PropTypes.string,
	readOnly: PropTypes.string,
	required: PropTypes.string,
	// selected: PropTypes.string, // not used
	// ----- for calculations
	options : PropTypes.array,
	display: PropTypes.string,
	label: PropTypes.string,
	tooltip: PropTypes.string,
	className: PropTypes.string,
	validate: PropTypes.string,
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







FormSelectOption.propTypes = {
	text: PropTypes.string,
	value: PropTypes.string,
	// flag attributes
	disabled: PropTypes.bool,
	// selected : PropTypes.string
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








FormTextarea.propTypes = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string,
	rows: PropTypes.string,
	cols: PropTypes.string,
	defaultValue: PropTypes.string,
	maxLength: PropTypes.number,
	placeholder: PropTypes.string,
	autoComplete: PropTypes.string,
	// flag attributes
	autoFocus: PropTypes.string,
	disabled: PropTypes.string,
	readOnly: PropTypes.string,
	required: PropTypes.string,
	// ----- for calculations
	display: PropTypes.string,
	label: PropTypes.string,
	tooltip: PropTypes.string,
	className: PropTypes.string,
	validate: PropTypes.string,
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






FormRadio.propTypes = {
	id: PropTypes.string.isRequired, // not using?
	name: PropTypes.string.isRequired,
	options : PropTypes.array,
	// flag attributes
	autoFocus: PropTypes.string,
	disabled: PropTypes.string,
	readOnly: PropTypes.string,
	required: PropTypes.string,
	// ? selected: PropTypes.string,
	// ----- for calculations
	display: PropTypes.string,
	label: PropTypes.string,
	tooltip: PropTypes.string,
	validate: PropTypes.string,
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






FormRadioOption.propTypes = {
	name: PropTypes.string,
	text: PropTypes.string,
	value: PropTypes.string.isRequired,
	// flag attributes
	checked : PropTypes.string,
	// ----- for calculations
	parent : PropTypes.any,
};
export type FormRadioOptionType = InferProps<typeof FormRadioOption.propTypes>;
function FormRadioOption(props: FormRadioOptionType) {
	const inputProps = setupInputProps(props);
	const isChecked = props.parent.checked === props.value;
	 
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (props.parent.onChange) {
			props.parent.onChange(props.value);
		}
	};
	return (
		<span className={ props.parent.display == "vertical" ? "displayVertical" : ""}>
			<input type="radio" 
				id={`${props.parent.name}-${props.value}`} 
				name={props.parent.name} 
				value={props.value} 
				checked={isChecked}
				onChange={handleChange}
				required={!!props.parent.required} 
				{...inputProps} />
			<label htmlFor={`${props.parent.name}-${props.value}`}>{props.text}</label>
		</span>
	);
}






FormCheckbox.propTypes = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string.isRequired,
	options : PropTypes.array,
	// flag attributes
	autoFocus: PropTypes.string,
	disabled: PropTypes.string,
	readOnly: PropTypes.string,
	// ----- for calculations
	display: PropTypes.string,
	label: PropTypes.string,
	tooltip: PropTypes.string,
	className: PropTypes.string,
	validate: PropTypes.string,
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







FormCheckboxOption.propTypes = {
	text: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	// flag attributes
	selected : PropTypes.string,
	// ----- for calculations
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
		<span className={ props.parent.display == "vertical" ? "displayVertical" : ""}>
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






FormButton.propTypes = {
	type: PropTypes.string,
	id: PropTypes.string.isRequired,
	text: PropTypes.string,
	// ----- for calculations
	className: PropTypes.string,
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








FormDataList.propTypes = {
	id: PropTypes.string.isRequired,
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








FormTagInput.propTypes = {
	id: PropTypes.string.isRequired,
	name: PropTypes.string,
	defaultValue: PropTypes.arrayOf(PropTypes.string),
	value: PropTypes.arrayOf(PropTypes.string),
	placeholder: PropTypes.string,
	autoComplete: PropTypes.string,
	// flag attributes
	disabled: PropTypes.string,
	readOnly: PropTypes.string,
	required: PropTypes.string,
	// ----- for calculations
	display: PropTypes.string,
	label: PropTypes.string,
	tooltip: PropTypes.string,
	className: PropTypes.string,
	validate: PropTypes.string,
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








FormFieldset.propTypes = {
};
export type FormFieldsetType = InferProps<typeof FormFieldset.propTypes>;
export function FormFieldset(props: FormFieldsetType) {
	return (
		<></>
	);
}

// Re-export FontSelector for use in forms
export { FontSelector, CompoundFontSelector };

