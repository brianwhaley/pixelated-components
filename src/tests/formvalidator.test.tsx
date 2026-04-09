import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import {
	validateField,
	useFormValidation,
	FormValidationProvider,
	validatePasswordMatch,
	validateAgeRestriction
} from '../components/sitebuilder/form/formvalidator';

describe('Form Validation', () => {
	describe('validateField', () => {
		it('should validate required fields', async () => {
			const fieldProps = { required: true };
			const event = {
				target: {
					checkValidity: () => true,
					value: 'test'
				}
			} as any;

			const result = await validateField(fieldProps, event);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should fail validation for empty required fields', async () => {
			const fieldProps = { required: true };
			const event = {
				target: {
					checkValidity: () => false,
					value: ''
				}
			} as any;

			const result = await validateField(fieldProps, event);
			expect(result.isValid).toBe(false);
		});

		it('should return ValidationResult object', async () => {
			const fieldProps = { required: false };
			const event = {
				target: {
					checkValidity: () => true,
					value: 'test'
				}
			} as any;

			const result = await validateField(fieldProps, event);
			expect(result).toHaveProperty('isValid');
			expect(result).toHaveProperty('errors');
		});

		it('should handle missing event gracefully', async () => {
			const fieldProps = { required: true };
			const event = { target: { checkValidity: () => true } } as any;

			const result = await validateField(fieldProps, event);
			expect(result).toBeDefined();
		});
	});

	describe('validatePasswordMatch', () => {
		it('should validate matching passwords', () => {
			const formData = {
				password: { value: 'Secret123!' },
				passwordConfirm: { value: 'Secret123!' }
			};

			const result = validatePasswordMatch(formData);
			expect(result.isValid).toBe(true);
			expect(result.errors).toHaveLength(0);
		});

		it('should fail for non-matching passwords', () => {
			const formData = {
				password: { value: 'Secret123!' },
				passwordConfirm: { value: 'DifferentPass' }
			};

			const result = validatePasswordMatch(formData);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Passwords do not match');
		});

		it('should handle missing password field', () => {
			const formData = { passwordConfirm: { value: 'test' } };

			const result = validatePasswordMatch(formData);
			expect(result.isValid).toBe(true);
		});

		it('should handle empty strings', () => {
			const formData = {
				password: { value: '' },
				passwordConfirm: { value: '' }
			};

			const result = validatePasswordMatch(formData);
			expect(result.isValid).toBe(true);
		});
	});

	describe('validateAgeRestriction', () => {
		it('should allow users 13 and older', () => {
			const formData = { age: { value: '18' } };

			const result = validateAgeRestriction(formData);
			expect(result.isValid).toBe(true);
		});

		it('should require parental consent for users under 13', () => {
			const formData = {
				age: { value: '10' },
				parentalConsent: { value: 'no' }
			};

			const result = validateAgeRestriction(formData);
			expect(result.isValid).toBe(false);
			expect(result.errors).toContain('Parental consent required for users under 13');
		});

		it('should allow users under 13 with parental consent', () => {
			const formData = {
				age: { value: '10' },
				parentalConsent: { value: 'yes' }
			};

			const result = validateAgeRestriction(formData);
			expect(result.isValid).toBe(true);
		});

		it('should handle edge case age 13', () => {
			const formData = { age: { value: '13' } };

			const result = validateAgeRestriction(formData);
			expect(result.isValid).toBe(true);
		});
	});

	describe('useFormValidation hook', () => {
		function TestComponent() {
			const context = useFormValidation();
			const { fieldValidity, isFormValid } = context;

			return (
				<div>
					<div data-testid="form-valid">{isFormValid ? 'valid' : 'invalid'}</div>
					<div data-testid="field-validity">{JSON.stringify(fieldValidity)}</div>
				</div>
			);
		}

		it('should throw error when used outside context', () => {
			expect(() => {
				render(<TestComponent />);
			}).toThrow('useFormValidation must be used within FormValidationProvider');
		});

		it('should provide context within provider', () => {
			const { getByTestId } = render(
				<FormValidationProvider>
					<TestComponent />
				</FormValidationProvider>
			);

			expect(getByTestId('form-valid')).toBeInTheDocument();
		});
	});

	describe('FormValidationProvider', () => {
		it('should render children', () => {
			const { getByText } = render(
				<FormValidationProvider>
					<div>Test Content</div>
				</FormValidationProvider>
			);

			expect(getByText('Test Content')).toBeInTheDocument();
		});

		it('should provide validation context to children', () => {
			function TestChild() {
				const context = useFormValidation();
				return <div>{context ? 'context-provided' : 'no-context'}</div>;
			}

			const { getByText } = render(
				<FormValidationProvider>
					<TestChild />
				</FormValidationProvider>
			);

			expect(getByText('context-provided')).toBeInTheDocument();
		});

		it('should support multiple children', () => {
			const { getByText } = render(
				<FormValidationProvider>
					<div>Child 1</div>
					<div>Child 2</div>
				</FormValidationProvider>
			);

			expect(getByText('Child 1')).toBeInTheDocument();
			expect(getByText('Child 2')).toBeInTheDocument();
		});
	});
});
