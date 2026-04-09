
import type { PropTypeInfo } from './types';
import type { FormFieldConfig } from '../../form/formtypes';
import { componentMetadata } from './componentMetadata';

/**
 * PropTypes Introspection Utilities
 * Analyzes PropTypes to generate appropriate form fields
 * 
 * Strategy:
 * 1. Components define const arrays for enum values (e.g., CALLOUT_STYLES)
 * 2. These arrays are used in PropTypes: PropTypes.oneOf([...CALLOUT_STYLES])
 * 3. InferProps generates TypeScript types from PropTypes
 * 4. componentMetadata imports the same const arrays for form generation
 * 
 * This ensures single source of truth:
 * - const array → PropTypes → InferProps → TypeScript types
 * - const array → componentMetadata → form fields
 */

/**
 * Analyzes PropTypes to determine the appropriate form field type
 */
export function getPropTypeInfo(propType: any, componentName?: string, propName?: string): PropTypeInfo {
	// Check our metadata (which imports const arrays from component files)
	if (componentName && propName && componentMetadata[componentName]?.[propName]) {
		const metadata = componentMetadata[componentName][propName];
		return {
			type: metadata.type,
			options: metadata.options as string[],
			isRequired: metadata.required || false,
		};
	}
	if (!propType) return { type: 'text', isRequired: false };

	// PropTypes logic is inverted:
	// - Optional: PropTypes.string (HAS .isRequired property pointing to the required version)
	// - Required: PropTypes.string.isRequired (NO .isRequired property - it IS the required version)
	const isRequired = !('isRequired' in propType);
	
	// Handle both optional and required PropTypes
	// Optional: PropTypes.oneOf([...]) - has .isRequired property
	// Required: PropTypes.oneOf([...]).isRequired - is the actual validator
	let basePropType = propType;
	
	// If this is an optional PropType, it might have an isRequired property that points to the validator
	// We need to check the current propType first, not the isRequired version
	
	// PropTypes don't include metadata at runtime, so oneOf detection won't work
	// We rely on componentMetadata instead (checked above)

	// Check for shape (object with defined props)
	if (basePropType._propType === 'shape' || (basePropType.type && basePropType.type._propType === 'shape')) {
		return { 
			type: 'object',
			options: basePropType.shapeTypes || basePropType.type?.shapeTypes || {},
			isRequired 
		};
	}

	// Check for arrayOf
	if (basePropType._propType === 'arrayOf' || (basePropType.type && basePropType.type._propType === 'arrayOf')) {
		return { 
			type: 'array',
			elementType: basePropType.elementType || basePropType.type?.elementType,
			isRequired 
		};
	}

	// Check the name property for basic types
	const typeName = basePropType.name || basePropType.type?.name || '';
	
	switch (typeName) {
	case 'number':
		return { type: 'number', isRequired };
	case 'bool':
		return { type: 'checkbox', isRequired };
	case 'func':
		return { type: 'function', isRequired };
	case 'node':
	case 'element':
		return { type: 'children', isRequired };
	case 'object':
		return { type: 'json', isRequired };
	case 'string':
	default:
		return { type: 'text', isRequired };
	}
}

/**
 * Generates appropriate form field configuration based on PropType
 */
export function generateFormFieldFromPropType(
	propName: string, 
	propType: any,
	value?: any,
	componentName?: string
): FormFieldConfig {
	const propInfo = getPropTypeInfo(propType, componentName, propName);
	const baseProps: any = {
		label: propName + ':',
		name: propName,
		id: propName,
	};
	
	// Only add required attribute when field is actually required
	// Don't pass required prop at all for optional fields (HTML treats ANY value as required)
	if (propInfo.isRequired) {
		baseProps.required = 'required';
	}
	
	// Only add defaultValue if a value is provided
	if (value !== undefined && value !== null && value !== '') {
		baseProps.defaultValue = value;
	}

	switch (propInfo.type) {
	case 'select':
		return {
			component: 'FormSelect',
			props: {
				...baseProps,
				options: [
					{ value: '', text: '-- Select --' },
					...(propInfo.options || []).map((opt: any) => ({
						value: opt,
						text: opt
					}))
				],
			}
		};

	case 'number':
		return {
			component: 'FormInput',
			props: {
				...baseProps,
				type: 'number',
			}
		};

	case 'checkbox':
		return {
			component: 'FormInput',
			props: {
				...baseProps,
				type: 'checkbox',
			}
		};

	case 'json':
	case 'object':
		return {
			component: 'FormInput',
			props: {
				...baseProps,
				type: 'text',
				placeholder: 'JSON object: {"key": "value"}',
			}
		};

	case 'array':
		return {
			component: 'FormInput',
			props: {
				...baseProps,
				type: 'text',
				placeholder: 'Comma-separated values',
			}
		};

	case 'children':
		return {
			component: 'FormInput',
			props: {
				...baseProps,
				type: 'text',
				placeholder: 'Add child components separately',
				disabled: true,
			}
		};

	case 'function':
		return {
			component: 'FormInput',
			props: {
				...baseProps,
				type: 'text',
				placeholder: 'Function (not editable in builder)',
				disabled: true,
			}
		};

	case 'text':
	default:
		return {
			component: 'FormInput',
			props: {
				...baseProps,
				type: 'text',
			}
		};
	}
}
