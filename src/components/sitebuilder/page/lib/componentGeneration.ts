
import type { ComponentData } from './types';
import type { FormData, FormFieldConfig } from '../../form/formtypes';
import { componentMap } from './componentMap';
import { generateFormFieldFromPropType } from './propTypeIntrospection';

/**
 * Component Generation Logic
 * Handles form data extraction and component object creation
 */

/**
 * Extracts component data from form submission event
 */
export function generateComponentObject(event: Event): { 
	component: ComponentData; 
	parentPath: string | undefined;
} {
	const props: Record<string, any> = {};
	const target = event.target as HTMLFormElement;
	
	for (const prop in target) {
		const thisProp = (target as any)[prop];
		if (thisProp && thisProp.value && (thisProp.value !== Object(thisProp.value))) { 
			let value = thisProp.value;
			
			// Try to parse JSON objects
			if (thisProp.name !== 'type' && value.startsWith('{')) {
				try {
					value = JSON.parse(value);
				} catch ( err ) {
					console.log('Invalid JSON for prop:', err, thisProp.name, value);
					// Keep as string if not valid JSON
				}
			}
			
			// Convert number strings to numbers
			if (thisProp.type === 'number') {
				value = parseFloat(value) || value;
			}
			
			// Convert checkbox values to boolean
			if (thisProp.type === 'checkbox') {
				value = thisProp.checked;
			}
			
			props[thisProp.name] = value;
		}
	}
	
	const parentPath = props.__parentPath;
	delete props.__parentPath;
	
	const newComponent: ComponentData = {
		component: props.type,
		props: props,
		children: [] // Initialize children array for layout components
	};
	
	// Add path for tracking nested structure
	newComponent.path = parentPath 
		? `${parentPath}.children[${Date.now()}]` 
		: `root[${Date.now()}]`;
	
	return { component: newComponent, parentPath };
}

/**
 * Generates form field configuration for a component
 */
export function generateFieldJSON(
	component: string, 
	existingProps?: any,
	parentPath?: string
): FormData {
	const form: FormData = { fields: [] };
	
	// ADD COMPONENT TYPE FIELD (disabled in phase 2)
	form.fields.push({
		component: 'FormInput',
		props: {
			label: 'Type:',
			name: 'type',
			id: 'type',
			type: 'text',
			disabled: true,
			value: component
		}
	});

	// ADD PARENT PATH (hidden field for nested components)
	if (parentPath) {
		form.fields.push({
			component: 'FormInput',
			props: {
				name: '__parentPath',
				id: '__parentPath',
				type: 'hidden',
				value: parentPath
			}
		});
	}

	// INTROSPECT PROPTYPES TO GENERATE APPROPRIATE FIELDS
	const componentPropTypes = componentMap[component as keyof typeof componentMap].propTypes;
	
	if (componentPropTypes) {
		for (const prop in componentPropTypes) {
			// Skip children as we'll handle that separately for layout components
			if (prop === 'children') continue;
			
			const propType = componentPropTypes[prop as keyof typeof componentPropTypes];
			const existingValue = existingProps ? existingProps[prop] : undefined;
			const field = generateFormFieldFromPropType(prop, propType, existingValue, component);
			form.fields.push(field as FormFieldConfig);
		}
	}

	// ADD SUBMIT BUTTON
	const buttonText = existingProps ? 'Update ' + component : 'Add ' + component;
	form.fields.push({
		component: 'FormButton',
		props: {
			label: buttonText,
			type: 'submit',
			id: buttonText,
			text: buttonText
		}
	});

	return form;
}
