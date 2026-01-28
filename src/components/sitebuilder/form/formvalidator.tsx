"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import * as FVF from './formfieldvalidations';
import { ValidationResult, FormValidationContextType } from './formtypes';

/**
 * Centralized field validation service
 */
export async function validateField(
	fieldProps: any,
	event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
): Promise<ValidationResult> {
	const errors: string[] = [];
	let isValid = true;

	// 1. Field-specific validation (e.g., isValidEmailAddress, isValidUrl, etc.)
	if (fieldProps.validate && typeof fieldProps.validate === "string" && fieldProps.validate in FVF) {
		const fieldValid = (FVF as any)[fieldProps.validate](event.target);
		if (!fieldValid) {
			isValid = false;
			errors.push(`${fieldProps.validate} validation failed`);
		}
	}

	// 2. Parent validation (for grouped/nested fields)
	if (fieldProps.parent?.validate && typeof fieldProps.parent.validate === "string" && fieldProps.parent.validate in FVF) {
		const parentValid = (FVF as any)[fieldProps.parent.validate](event.target);
		if (!parentValid) {
			isValid = false;
			errors.push(`Parent ${fieldProps.parent.validate} validation failed`);
		}
	}

	// 3. HTML5 required validation
	if (fieldProps.required) {
		const requiredValid = event.target.checkValidity();
		if (!requiredValid) {
			isValid = false;
			errors.push('Required field validation failed');
		}
	}

	// 4. Required not empty check
	if (fieldProps.required && !event.target.value) {
		isValid = false;
		errors.push('Field cannot be empty');
	}

	// 5. Custom validation rules can be added here
	// Example: minimum length, maximum length, pattern matching, etc.

	return { isValid, errors };
}

/**
 * Form validation context for managing form-wide validation state
 */
const FormValidationContext = createContext<FormValidationContextType | null>(null);

export function useFormValidation() {
	const context = useContext(FormValidationContext);
	if (!context) {
		throw new Error('useFormValidation must be used within FormValidationProvider');
	}
	return context;
}

/**
 * FormValidationProvider — Context provider for form validation state and helpers (field errors, validity checks).
 *
 * @param {node} [props.children] - Children components that require validation context (usually `FormEngine`).
 */
FormValidationProvider.propTypes = {
/** Child nodes that consume the validation context */
	children: PropTypes.node.isRequired
};
export type FormValidationProviderType = InferProps<typeof FormValidationProvider.propTypes>;
export function FormValidationProvider({ children }: FormValidationProviderType) {
	const [fieldValidity, setFieldValidity] = useState<Record<string, boolean>>({});
	const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

	const validateField = useCallback((fieldId: string, isValid: boolean, errors: string[]) => {
		setFieldValidity(prev => ({ ...prev, [fieldId]: isValid }));
		setFieldErrors(prev => ({ ...prev, [fieldId]: errors }));
	}, []);

	const validateAllFields = useCallback(() => {
		return Object.values(fieldValidity).every(valid => valid === true);
	}, [fieldValidity]);

	const resetValidation = useCallback(() => {
		setFieldValidity({});
		setFieldErrors({});
	}, []);

	const isFormValid = Object.values(fieldValidity).every(valid => valid === true);

	const value: FormValidationContextType = {
		fieldValidity,
		fieldErrors,
		isFormValid,
		validateField,
		validateAllFields,
		resetValidation
	};

	return (
		<FormValidationContext.Provider value={value}>
			{children}
		</FormValidationContext.Provider>
	);
}

/**
 * Cross-field validation functions
 */
export function validatePasswordMatch(formData: any): ValidationResult {
	const password = formData.password?.value;
	const confirm = formData.passwordConfirm?.value;

	if (!password || !confirm) {
		return { isValid: true, errors: [] }; // Not required fields
	}

	const isValid = password === confirm;
	return {
		isValid,
		errors: isValid ? [] : ['Passwords do not match']
	};
}

export function validateAgeRestriction(formData: any): ValidationResult {
	const age = parseInt(formData.age?.value);
	const hasParentalConsent = formData.parentalConsent?.value === 'yes';

	if (isNaN(age) || age >= 13) {
		return { isValid: true, errors: [] };
	}

	const isValid = hasParentalConsent;
	return {
		isValid,
		errors: isValid ? [] : ['Parental consent required for users under 13']
	};
}

/**
 * Form-level validation orchestrator
 */
export function validateFormLevel(formData: any, customValidators: ((data: any) => ValidationResult)[] = []): ValidationResult {
	const allErrors: string[] = [];
	let isValid = true;

	// Run custom cross-field validations
	const defaultValidators = [validatePasswordMatch, validateAgeRestriction];
	const allValidators = [...defaultValidators, ...customValidators];

	for (const validator of allValidators) {
		const result = validator(formData);
		if (!result.isValid) {
			isValid = false;
			allErrors.push(...result.errors);
		}
	}

	return { isValid, errors: allErrors };
}