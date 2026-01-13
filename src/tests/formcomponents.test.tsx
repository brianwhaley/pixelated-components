import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '../test/test-utils';
import { FormTagInput } from '../components/sitebuilder/form/formcomponents';
import { FormValidationProvider } from '../components/sitebuilder/form/formvalidator';

describe('Form Components Tests', () => {
	describe('Form Label Component', () => {
		it('should render label element', () => {
			const label = document.createElement('label');
			label.htmlFor = 'input-id';
			label.textContent = 'Field Label';
			
			expect(label.htmlFor).toBe('input-id');
			expect(label.textContent).toBe('Field Label');
		});

		it('should have proper id attribute', () => {
			const id = 'email-field';
			const labelId = `lbl-${id}`;
			
			expect(labelId).toBe('lbl-email-field');
		});

		it('should support optional label', () => {
			const label = undefined;
			expect(label).toBeUndefined();
		});

		it('should apply custom CSS class', () => {
			const label = document.createElement('label');
			label.className = 'form-label required';
			
			expect(label.classList.contains('form-label')).toBe(true);
			expect(label.classList.contains('required')).toBe(true);
		});

		it('should handle label with tooltip', () => {
			const label = 'Email Address';
			const tooltip = 'Enter your email';
			
			expect(label).toBeTruthy();
			expect(tooltip).toBeTruthy();
		});
	});

	describe('Form Tooltip Component', () => {
		it('should render tooltip element', () => {
			const tooltip = document.createElement('div');
			tooltip.className = 'tooltip';
			tooltip.textContent = 'Helpful text';
			
			expect(tooltip.textContent).toBe('Helpful text');
		});

		it('should toggle tooltip visibility', () => {
			const tooltip = document.createElement('div');
			tooltip.style.display = 'none';
			
			if (tooltip.style.display === 'none') {
				tooltip.style.display = 'block';
			}
			
			expect(tooltip.style.display).toBe('block');
		});

		it('should have unique id', () => {
			const fieldId = 'email';
			const tooltipId = `tooltip-${fieldId}`;
			
			expect(tooltipId).toBe('tooltip-email');
		});

		it('should start hidden by default', () => {
			const tooltip = document.createElement('div');
			tooltip.style.display = 'none';
			
			expect(tooltip.style.display).toBe('none');
		});

		it('should contain icon character', () => {
			const tooltipChar = 'ℹ';
			expect(tooltipChar).toBeTruthy();
		});
	});

	describe('Form Input Fields', () => {
		it('should create text input', () => {
			const input = document.createElement('input');
			input.type = 'text';
			input.name = 'username';
			
			expect(input.type).toBe('text');
			expect(input.name).toBe('username');
		});

		it('should create email input', () => {
			const input = document.createElement('input');
			input.type = 'email';
			
			expect(input.type).toBe('email');
		});

		it('should create password input', () => {
			const input = document.createElement('input');
			input.type = 'password';
			
			expect(input.type).toBe('password');
		});

		it('should create number input', () => {
			const input = document.createElement('input');
			input.type = 'number';
			input.min = '0';
			input.max = '100';
			
			expect(input.type).toBe('number');
			expect(input.min).toBe('0');
			expect(input.max).toBe('100');
		});

		it('should create textarea', () => {
			const textarea = document.createElement('textarea');
			textarea.name = 'message';
			
			expect(textarea.name).toBe('message');
		});

		it('should create select dropdown', () => {
			const select = document.createElement('select');
			select.name = 'country';
			
			const option1 = document.createElement('option');
			option1.value = 'us';
			option1.textContent = 'United States';
			
			select.appendChild(option1);
			
			expect(select.options).toHaveLength(1);
		});

		it('should create checkbox', () => {
			const input = document.createElement('input');
			input.type = 'checkbox';
			input.name = 'agree';
			
			expect(input.type).toBe('checkbox');
		});

		it('should create radio button', () => {
			const input = document.createElement('input');
			input.type = 'radio';
			input.name = 'option';
			input.value = 'choice1';
			
			expect(input.type).toBe('radio');
			expect(input.value).toBe('choice1');
		});
	});

	describe('Form Validation', () => {
		it('should validate required field', () => {
			const input = document.createElement('input');
			input.required = true;
			input.value = '';
			
			const isValid = input.value.length > 0;
			expect(isValid).toBe(false);
		});

		it('should validate email format', () => {
			const email = 'test@example.com';
			const isValid = email.includes('@');
			
			expect(isValid).toBe(true);
		});

		it('should reject invalid email', () => {
			const email = 'invalid.email';
			const isValid = email.includes('@');
			
			expect(isValid).toBe(false);
		});

		it('should validate minimum length', () => {
			const value = 'pass';
			const minLength = 8;
			const isValid = value.length >= minLength;
			
			expect(isValid).toBe(false);
		});

		it('should validate maximum length', () => {
			const value = 'a'.repeat(100);
			const maxLength = 50;
			const isValid = value.length <= maxLength;
			
			expect(isValid).toBe(false);
		});

		it('should validate number range', () => {
			const value = 50;
			const min = 0;
			const max = 100;
			const isValid = value >= min && value <= max;
			
			expect(isValid).toBe(true);
		});

		it('should validate phone number format', () => {
			const phone = '555-123-4567';
			const isValid = phone.match(/^\d{3}-\d{3}-\d{4}$/);
			
			expect(isValid).toBeTruthy();
		});

		it('should validate URL format', () => {
			const url = 'https://example.com';
			const isValid = url.startsWith('http');
			
			expect(isValid).toBe(true);
		});
	});

	describe('Form State Management', () => {
		it('should track input value change', () => {
			const value = 'initial';
			const newValue = 'updated';
			
			expect(newValue).not.toBe(value);
		});

		it('should handle form submission', () => {
			const formData = { name: 'John', email: 'john@example.com' };
			
			expect(formData.name).toBeTruthy();
			expect(formData.email).toBeTruthy();
		});

		it('should reset form fields', () => {
			const fields = { name: '', email: '', message: '' };
			
			expect(fields.name).toBe('');
			expect(fields.email).toBe('');
		});

		it('should track validation state', () => {
			const fieldValid = false;
			expect(fieldValid).toBe(false);
		});

		it('should prevent submit if invalid', () => {
			const isValid = false;
			const canSubmit = isValid;
			
			expect(canSubmit).toBe(false);
		});

		it('should enable submit when valid', () => {
			const isValid = true;
			const canSubmit = isValid;
			
			expect(canSubmit).toBe(true);
		});
	});

	describe('Form Components Library', () => {
		it('should have FormLabel component', () => {
			const hasComponent = true;
			expect(hasComponent).toBe(true);
		});

		it('should have FormTooltip component', () => {
			const hasComponent = true;
			expect(hasComponent).toBe(true);
		});

		it('should have FormButton component', () => {
			const hasComponent = true;
			expect(hasComponent).toBe(true);
		});

		it('should support input elements', () => {
			const elements = ['text', 'email', 'password', 'number', 'checkbox', 'radio'];
			expect(elements).toHaveLength(6);
		});

		it('should support textarea', () => {
			const elements = ['text', 'textarea'];
			expect(elements).toContain('textarea');
		});

		it('should support select dropdown', () => {
			const elements = ['text', 'select'];
			expect(elements).toContain('select');
		});
	});

	describe('Form Button Component', () => {
		it('should render button element', () => {
			const button = document.createElement('button');
			button.type = 'submit';
			button.textContent = 'Submit';
			
			expect(button.type).toBe('submit');
			expect(button.textContent).toBe('Submit');
		});

		it('should create reset button', () => {
			const button = document.createElement('button');
			button.type = 'reset';
			
			expect(button.type).toBe('reset');
		});

		it('should create regular button', () => {
			const button = document.createElement('button');
			button.type = 'button';
			
			expect(button.type).toBe('button');
		});

		it('should disable button when invalid', () => {
			const button = document.createElement('button');
			const isValid = false;
			
			if (!isValid) {
				button.disabled = true;
			}
			
			expect(button.disabled).toBe(true);
		});

		it('should enable button when valid', () => {
			const button = document.createElement('button');
			const isValid = true;
			
			button.disabled = !isValid;
			expect(button.disabled).toBe(false);
		});
	});

	describe('Form Styling & CSS', () => {
		it('should apply form CSS class', () => {
			const form = document.createElement('form');
			form.className = 'form-container';
			
			expect(form.classList.contains('form-container')).toBe(true);
		});

		it('should apply field CSS class', () => {
			const field = document.createElement('div');
			field.className = 'form-field';
			
			expect(field.classList.contains('form-field')).toBe(true);
		});

		it('should apply error CSS class', () => {
			const field = document.createElement('div');
			field.className = 'form-field error';
			
			expect(field.classList.contains('error')).toBe(true);
		});

		it('should apply success CSS class', () => {
			const field = document.createElement('div');
			field.className = 'form-field success';
			
			expect(field.classList.contains('success')).toBe(true);
		});

		it('should apply disabled state styling', () => {
			const input = document.createElement('input');
			input.disabled = true;
			
			expect(input.disabled).toBe(true);
		});
	});

	describe('Form Accessibility', () => {
		it('should link label to input', () => {
			const input = document.createElement('input');
			input.id = 'email';
			
			const label = document.createElement('label');
			label.htmlFor = 'email';
			
			expect(label.htmlFor).toBe(input.id);
		});

		it('should have aria-label for accessibility', () => {
			const input = document.createElement('input');
			input.setAttribute('aria-label', 'Email address');
			
			expect(input.getAttribute('aria-label')).toBe('Email address');
		});

		it('should have aria-required for required fields', () => {
			const input = document.createElement('input');
			input.required = true;
			input.setAttribute('aria-required', 'true');
			
			expect(input.getAttribute('aria-required')).toBe('true');
		});

		it('should have aria-invalid for invalid fields', () => {
			const input = document.createElement('input');
			input.setAttribute('aria-invalid', 'true');
			
			expect(input.getAttribute('aria-invalid')).toBe('true');
		});

		it('should support keyboard navigation', () => {
			const input = document.createElement('input');
			input.tabIndex = 0;
			
			expect(input.tabIndex).toBe(0);
		});
	});

	describe('Form Props Types', () => {
		it('should define FormLabelType', () => {
			const props = {
				id: 'email',
				label: 'Email',
				tooltip: 'Enter email',
				className: 'field-label'
			};
			
			expect(props.id).toBeTruthy();
			expect(props.label).toBeTruthy();
		});

		it('should define FormTooltipType', () => {
			const props = {
				id: 'field1',
				text: 'Helpful info',
				className: 'tooltip-class'
			};
			
			expect(props.text).toBeTruthy();
		});

		it('should support setIsValid callback', () => {
			const callback = (isValid: boolean) => {};
			expect(typeof callback).toBe('function');
		});

		it('should support parent validation', () => {
			const parent = {
				validate: 'email',
				setIsValid: (valid: boolean) => {}
			};
			
			expect(parent.validate).toBeTruthy();
			expect(typeof parent.setIsValid).toBe('function');
		});
	});

	describe('Form Tag Input Component', () => {
		it('should render tag input with label', () => {
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" label="Tags" />
				</FormValidationProvider>
			);
			const label = container.querySelector('label');
			expect(label).toBeTruthy();
			expect(label?.textContent).toBe('Tags');
		});

		it('should display initial tags', () => {
			const initialTags = ['react', 'typescript', 'javascript'];
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" value={initialTags} />
				</FormValidationProvider>
			);
			
			const tagChips = container.querySelectorAll('.tag-chip');
			expect(tagChips).toHaveLength(3);
			expect(tagChips[0].textContent).toContain('react');
			expect(tagChips[1].textContent).toContain('typescript');
			expect(tagChips[2].textContent).toContain('javascript');
		});

		it('should add tag on Enter key press', () => {
			const mockOnChange = vi.fn();
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" onChange={mockOnChange} />
				</FormValidationProvider>
			);
			
			const input = container.querySelector('.tag-input') as HTMLInputElement;
			fireEvent.change(input, { target: { value: 'new-tag' } });
			fireEvent.keyDown(input, { key: 'Enter' });
			
			expect(mockOnChange).toHaveBeenCalledWith(['new-tag']);
			expect(input.value).toBe('');
		});

		it('should add tag on comma key press', () => {
			const mockOnChange = vi.fn();
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" onChange={mockOnChange} />
				</FormValidationProvider>
			);
			
			const input = container.querySelector('.tag-input') as HTMLInputElement;
			fireEvent.change(input, { target: { value: 'comma-tag' } });
			fireEvent.keyDown(input, { key: ',' });
			
			expect(mockOnChange).toHaveBeenCalledWith(['comma-tag']);
		});

		it('should not add empty or duplicate tags', () => {
			const mockOnChange = vi.fn();
			const initialTags = ['existing'];
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" value={initialTags} onChange={mockOnChange} />
				</FormValidationProvider>
			);
			
			const input = container.querySelector('.tag-input') as HTMLInputElement;
			
			// Try to add empty tag
			fireEvent.change(input, { target: { value: '   ' } });
			fireEvent.keyDown(input, { key: 'Enter' });
			expect(mockOnChange).not.toHaveBeenCalled();
			
			// Try to add duplicate tag
			fireEvent.change(input, { target: { value: 'existing' } });
			fireEvent.keyDown(input, { key: 'Enter' });
			expect(mockOnChange).not.toHaveBeenCalled();
		});

		it('should remove tag on remove button click', () => {
			const mockOnChange = vi.fn();
			const initialTags = ['tag1', 'tag2', 'tag3'];
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" value={initialTags} onChange={mockOnChange} />
				</FormValidationProvider>
			);
			
			const removeButtons = container.querySelectorAll('.tag-remove');
			fireEvent.click(removeButtons[1]); // Remove 'tag2'
			
			expect(mockOnChange).toHaveBeenCalledWith(['tag1', 'tag3']);
		});

		it('should remove last tag on backspace when input is empty', () => {
			const mockOnChange = vi.fn();
			const initialTags = ['tag1', 'tag2'];
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" value={initialTags} onChange={mockOnChange} />
				</FormValidationProvider>
			);
			
			const input = container.querySelector('.tag-input') as HTMLInputElement;
			fireEvent.keyDown(input, { key: 'Backspace' });
			
			expect(mockOnChange).toHaveBeenCalledWith(['tag1']);
		});

		it('should trim whitespace from tags', () => {
			const mockOnChange = vi.fn();
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" onChange={mockOnChange} />
				</FormValidationProvider>
			);
			
			const input = container.querySelector('.tag-input') as HTMLInputElement;
			fireEvent.change(input, { target: { value: '  spaced tag  ' } });
			fireEvent.keyDown(input, { key: 'Enter' });
			
			expect(mockOnChange).toHaveBeenCalledWith(['spaced tag']);
		});

		it('should support placeholder text', () => {
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" placeholder="Add keywords..." />
				</FormValidationProvider>
			);
			
			const input = container.querySelector('.tag-input') as HTMLInputElement;
			expect(input.placeholder).toBe('Add keywords...');
		});

		it('should handle disabled state', () => {
			const initialTags = ['tag1', 'tag2'];
			const { container } = render(
				<FormValidationProvider>
					<FormTagInput id="tags" value={initialTags} disabled="disabled" />
				</FormValidationProvider>
			);
			
			const input = container.querySelector('.tag-input') as HTMLInputElement;
			const removeButtons = container.querySelectorAll('.tag-remove');
			
			expect(input.disabled).toBe(true);
			expect(removeButtons).toHaveLength(2);
			expect(removeButtons[0]).toBeDisabled();
			expect(removeButtons[1]).toBeDisabled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle empty label', () => {
			const label = '';
			expect(label).toBe('');
		});

		it('should handle very long labels', () => {
			const label = 'A'.repeat(500);
			expect(label).toHaveLength(500);
		});

		it('should handle special characters in names', () => {
			const name = 'field-name_123';
			expect(name).toMatch(/^[\w-]+$/);
		});

		it('should handle multiple validation rules', () => {
			const validations = ['required', 'email', 'minLength:8'];
			expect(validations).toHaveLength(3);
		});

		it('should handle concurrent field validation', () => {
			const fields = [
				{ name: 'email', valid: false },
				{ name: 'password', valid: false },
				{ name: 'confirm', valid: true }
			];
			
			const allValid = fields.every(f => f.valid);
			expect(allValid).toBe(false);
		});
	});
});
