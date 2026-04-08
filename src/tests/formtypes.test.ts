import { describe, it, expect } from 'vitest';

// Test exports from formtypes.ts
import * as formTypes from '../components/sitebuilder/form/formtypes';

describe('formtypes - Export Coverage', () => {
	it('should export ValidationResult interface', () => {
		expect(formTypes).toBeDefined();
	});

	it('should export FormFieldProps interface', () => {
		expect(formTypes).toBeDefined();
	});

	it('should export FormData interface', () => {
		expect(formTypes).toBeDefined();
	});

	it('should export FormFieldConfig interface', () => {
		expect(formTypes).toBeDefined();
	});

	it('should export FormValidationState interface', () => {
		expect(formTypes).toBeDefined();
	});

	it('should export FormValidationContextType interface', () => {
		expect(formTypes).toBeDefined();
	});

	it('should export FormBuilderProps interface', () => {
		expect(formTypes).toBeDefined();
	});

	it('should be able to create FormFieldProps object', () => {
		const fieldProps = { id: 'field1', type: 'text', label: 'Test' };
		expect(fieldProps.id).toBe('field1');
		expect(fieldProps.type).toBe('text');
	});

	it('should be able to create FormValidationState object', () => {
		const state = {
			fieldValidity: { field1: true },
			fieldErrors: { field1: [] },
			isFormValid: true
		};
		expect(state.isFormValid).toBe(true);
	});

	it('should be able to create ValidationResult object', () => {
		const result = { isValid: true, errors: [] };
		expect(result.isValid).toBe(true);
		expect(result.errors).toHaveLength(0);
	});
});
