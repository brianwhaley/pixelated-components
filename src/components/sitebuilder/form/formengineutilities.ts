// Shared utility functions for form components
import { generateKey, capitalize, attributeMap } from '../../foundation/utilities';

const debug = false;


/**
 * Maps input type to form component name
 */
export function mapTypeToComponent(myType: string): string {
	if (!myType) {
		throw new Error('Field type is required');
	}
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
