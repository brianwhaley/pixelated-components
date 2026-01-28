// Shared utility functions for form components
import { generateKey, capitalize, attributeMap } from '../../general/utilities';

const debug = false;

/**
 * Maps input type to form component name
 */
export function mapTypeToComponent(myType: string): string {
	if (debug) console.log("Mapping Type Field to Component");
	let myComponent =
    (["button"].includes(myType)) ? 'FormButton' :
    	(["checkbox"].includes(myType)) ? 'FormCheckbox' :
    		(["datalist"].includes(myType)) ? 'FormDataList' :
    			(["radio"].includes(myType)) ? 'FormRadio' :
    				(["select"].includes(myType)) ? 'FormSelect' :
    					(["textarea"].includes(myType)) ? 'FormTextarea' :
    						"FormInput";
	return myComponent;
}

/**
 * Generates field JSON for form building
 *
 * NOTE: This implementation is currently unused by other modules in-repo and
 * is exported by the package barrel which previously caused a duplicate
 * export collision with `componentGeneration.generateFieldJSON` during
 * Storybook's webpack build. To avoid accidental breakage for external
 * consumers we are making this implementation internal (non-exported)
 * and marking it for removal in a future maintenance sweep.
 *
 * TODO (cleanup): remove this function and any remaining aliases once
 * consumers have migrated — see `docs/roadmap.md` (Refactoring & Cleanup).
 * @deprecated internal-only — slated for removal
 */
function generateFieldJSON(component: string, type: string): any {
	const form: { [key: string]: any } = {};
	form.fields = [];

	// Common fields for all components
	const commonFields = [
		{
			component: 'FormInput',
			props: {
				label: 'ID : ',
				name: 'id',
				id: 'id',
				type: 'text',
				required: true
			}
		},
		{
			component: 'FormInput',
			props: {
				label: 'Label : ',
				name: 'label',
				id: 'label',
				type: 'text'
			}
		}
	];

	// Type-specific fields
	let typeSpecificFields: any[] = [];

	if (component === 'FormSelect') {
		typeSpecificFields = [
			{
				component: 'FormTextarea',
				props: {
					label: 'Options (JSON) : ',
					name: 'options',
					id: 'options',
					rows: 5,
					placeholder: '[{"value": "option1", "text": "Option 1"}, {"value": "option2", "text": "Option 2"}]'
				}
			}
		];
	} else if (component === 'FormRadio' || component === 'FormCheckbox') {
		typeSpecificFields = [
			{
				component: 'FormInput',
				props: {
					label: 'Value : ',
					name: 'value',
					id: 'value',
					type: 'text'
				}
			},
			{
				component: 'FormTextarea',
				props: {
					label: 'Options (JSON) : ',
					name: 'options',
					id: 'options',
					rows: 5,
					placeholder: '[{"value": "option1", "text": "Option 1"}, {"value": "option2", "text": "Option 2"}]'
				}
			}
		];
	} else {
		typeSpecificFields = [
			{
				component: 'FormInput',
				props: {
					label: 'Type : ',
					name: 'type',
					id: 'type',
					type: 'text',
					value: type,
					list: 'inputTypes'
				}
			},
			{
				component: 'FormInput',
				props: {
					label: 'Placeholder : ',
					name: 'placeholder',
					id: 'placeholder',
					type: 'text'
				}
			},
			{
				component: 'FormInput',
				props: {
					label: 'Value : ',
					name: 'value',
					id: 'value',
					type: 'text'
				}
			}
		];
	}

	// Add required field
	const requiredField = {
		component: 'FormCheckbox',
		props: {
			label: 'Required : ',
			name: 'required',
			id: 'required',
			value: 'required'
		}
	};

	// Add validation field
	const validationField = {
		component: 'FormInput',
		props: {
			label: 'Validate : ',
			name: 'validate',
			id: 'validate',
			type: 'text',
			list: 'validationTypes',
			placeholder: 'isValidEmailAddress, isValidUrl, etc.'
		}
	};

	// Combine all fields
	let i = 0;
	[...commonFields, ...typeSpecificFields, requiredField, validationField].forEach(field => {
		form.fields[i] = field;
		i++;
	});

	// Add submit button
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

	return form;
}

/**
 * Generates type selection field for form builder
 */
export function generateTypeField(): any {
	const form: { [key: string]: any } = {};

	const typeField = {
		component: 'FormInput',
		props: {
			label: 'Type : ',
			name: 'type',
			id: 'type',
			type: 'text',
			list: 'inputTypes'
		}
	};
	const addButton = {
		component: 'FormButton',
		props: {
			label: 'Build',
			type: 'submit',
			id: 'build',
			text: '===  Build  ==='
		}
	};
	form.fields = [typeField, addButton];
	return form;
}

/**
 * Converts numeric string props to numbers
 */
export function convertNumericProps(props: any): void {
	const numericProps = ['maxLength', 'minLength', 'rows', 'cols', 'size', 'step'];
	numericProps.forEach(prop => {
		if (
			props[prop] !== undefined &&
      props[prop] !== null &&
      props[prop] !== ''
		) {
			if (typeof props[prop] === 'string') {
				const num = Number(props[prop]);
				if (!isNaN(num)) {
					props[prop] = num;
				}
			}
		}
	});
}
