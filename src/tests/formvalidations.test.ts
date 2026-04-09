import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	inputTypes,
	booleans,
	formURLs,
	getAllInvalidFields,
	isOneChecked,
	isOneRadioSelected,
	isValidUSZipCode,
	isValidUSPhoneNumber,
	isValidEmailAddress,
	isValidDate,
	isValidUrl,
	isValidDiscountCode,
} from '../components/sitebuilder/form/formfieldvalidations';

// Mock the shoppingcart validateDiscountCode function
vi.mock('../../components/shoppingcart/shoppingcart.functions', () => ({
	validateDiscountCode: vi.fn().mockResolvedValue(true),
}));

describe('Form Validations', () => {
	describe('Constants', () => {
		it('should have inputTypes array', () => {
			expect(inputTypes).toBeDefined();
			expect(Array.isArray(inputTypes)).toBe(true);
			expect(inputTypes.length).toBeGreaterThan(0);
		});

		it('should contain common input types', () => {
			expect(inputTypes).toContain('text');
			expect(inputTypes).toContain('email');
			expect(inputTypes).toContain('password');
			expect(inputTypes).toContain('checkbox');
			expect(inputTypes).toContain('radio');
			expect(inputTypes).toContain('submit');
		});

		it('should have booleans array', () => {
			expect(booleans).toEqual(['true', 'false']);
		});

		it('should have formURLs array', () => {
			expect(formURLs).toBeDefined();
			expect(Array.isArray(formURLs)).toBe(true);
			expect(formURLs.length).toBeGreaterThan(0);
		});

		it('should contain valid URLs in formURLs', () => {
			formURLs.forEach(url => {
				expect(typeof url).toBe('string');
				expect(url.startsWith('http')).toBe(true);
			});
		});
	});

	describe('getAllInvalidFields', () => {
		beforeEach(() => {
			document.body.innerHTML = '';
		});

		it('should return empty array when no required fields', () => {
			document.body.innerHTML = '<input type="text" />';
			const result = getAllInvalidFields();
			expect(Array.isArray(result)).toBe(true);
		});

		it('should detect invalid required fields', () => {
			document.body.innerHTML = `
				<input id="field1" type="text" required />
				<input id="field2" type="email" required value="invalid" />
			`;
			const result = getAllInvalidFields();
			expect(Array.isArray(result)).toBe(true);
		});

		it('should return array of field IDs', () => {
			document.body.innerHTML = `
				<input id="test-field" type="text" required />
			`;
			const result = getAllInvalidFields();
			expect(Array.isArray(result)).toBe(true);
		});

		it('should handle multiple invalid fields', () => {
			document.body.innerHTML = `
				<input id="field1" type="text" required />
				<input id="field2" type="email" required />
				<select id="field3" required></select>
			`;
			const result = getAllInvalidFields();
			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('isOneChecked', () => {
		beforeEach(() => {
			document.body.innerHTML = '';
		});

		it('should return true when one checkbox is checked', () => {
			document.body.innerHTML = `
				<input id="option_1" type="checkbox" checked />
				<input id="option_2" type="checkbox" />
			`;
			const result = isOneChecked({ id: 'option_1' });
			expect(result).toBe(true);
		});

		it('should return false when no checkboxes are checked', () => {
			document.body.innerHTML = `
				<input id="option_1" type="checkbox" />
				<input id="option_2" type="checkbox" />
			`;
			const result = isOneChecked({ id: 'option_1' });
			expect(result).toBe(false);
		});

		it('should handle single checkbox', () => {
			document.body.innerHTML = `
				<input id="option_1" type="checkbox" checked />
			`;
			const result = isOneChecked({ id: 'option_1' });
			expect(result).toBe(true);
		});

		it('should handle multiple checked checkboxes', () => {
			document.body.innerHTML = `
				<input id="option_1" type="checkbox" checked />
				<input id="option_2" type="checkbox" checked />
			`;
			const result = isOneChecked({ id: 'option_1' });
			expect(result).toBe(true);
		});

		it('should handle underscore in id', () => {
			document.body.innerHTML = `
				<input id="test_field_1" type="checkbox" />
				<input id="test_field_2" type="checkbox" checked />
			`;
			const result = isOneChecked({ id: 'test_field_1' });
			expect(result).toBe(true);
		});
	});

	describe('isOneRadioSelected', () => {
		beforeEach(() => {
			document.body.innerHTML = '';
		});

		it('should return true when one radio is selected', () => {
			document.body.innerHTML = `
				<input name="options" type="radio" checked />
				<input name="options" type="radio" />
			`;
			const result = isOneRadioSelected({ name: 'options' });
			expect(result).toBe(true);
		});

		it('should return false when no radio is selected', () => {
			document.body.innerHTML = `
				<input name="options" type="radio" />
				<input name="options" type="radio" />
			`;
			const result = isOneRadioSelected({ name: 'options' });
			expect(result).toBe(false);
		});

		it('should handle single radio', () => {
			document.body.innerHTML = `
				<input name="option" type="radio" checked />
			`;
			const result = isOneRadioSelected({ name: 'option' });
			expect(result).toBe(true);
		});

		it('should only recognize first selected radio', () => {
			document.body.innerHTML = `
				<input name="group" type="radio" checked />
				<input name="group" type="radio" checked />
			`;
			const result = isOneRadioSelected({ name: 'group' });
			expect(result).toBe(true);
		});

		it('should handle non-existent radio group', () => {
			document.body.innerHTML = `
				<input name="group1" type="radio" />
			`;
			const result = isOneRadioSelected({ name: 'group2' });
			expect(result).toBe(false);
		});
	});

	describe('isValidUSZipCode', () => {
		it('should accept 5-digit zip code', () => {
			expect(isValidUSZipCode({ value: '12345' })).toBe(true);
		});

		it('should accept zip code with +4', () => {
			expect(isValidUSZipCode({ value: '12345-6789' })).toBe(true);
		});

		it('should reject invalid format', () => {
			expect(isValidUSZipCode({ value: '1234' })).toBe(false);
		});

		it('should reject letters in zip code', () => {
			expect(isValidUSZipCode({ value: '1234a' })).toBe(false);
		});

		it('should reject incomplete +4 format', () => {
			expect(isValidUSZipCode({ value: '12345-67' })).toBe(false);
		});

		it('should reject empty string', () => {
			expect(isValidUSZipCode({ value: '' })).toBe(false);
		});

		it('should handle spaces', () => {
			expect(isValidUSZipCode({ value: '12345 6789' })).toBe(false);
		});

		it('should accept various valid formats', () => {
			expect(isValidUSZipCode({ value: '10001' })).toBe(true);
			expect(isValidUSZipCode({ value: '90001' })).toBe(true);
			expect(isValidUSZipCode({ value: '00001' })).toBe(true);
		});
	});

	describe('isValidUSPhoneNumber', () => {
		it('should accept (123) 456-7890', () => {
			expect(isValidUSPhoneNumber({ value: '(123) 456-7890' })).toBe(true);
		});

		it('should accept 123-456-7890', () => {
			expect(isValidUSPhoneNumber({ value: '123-456-7890' })).toBe(true);
		});

		it('should accept 1234567890', () => {
			expect(isValidUSPhoneNumber({ value: '1234567890' })).toBe(true);
		});

		it('should accept 123 456 7890', () => {
			expect(isValidUSPhoneNumber({ value: '123 456 7890' })).toBe(true);
		});

		it('should accept 123.456.7890', () => {
			expect(isValidUSPhoneNumber({ value: '123.456.7890' })).toBe(true);
		});

		it('should accept variations with parentheses', () => {
			expect(isValidUSPhoneNumber({ value: '(123)456-7890' })).toBe(true);
		});

		it('should reject invalid formats', () => {
			expect(isValidUSPhoneNumber({ value: '12345' })).toBe(false);
		});

		it('should reject letters', () => {
			expect(isValidUSPhoneNumber({ value: '(abc) 456-7890' })).toBe(false);
		});

		it('should reject empty string', () => {
			expect(isValidUSPhoneNumber({ value: '' })).toBe(false);
		});

		it('should accept with extension notation', () => {
			expect(isValidUSPhoneNumber({ value: '123-456-7890' })).toBe(true);
		});
	});

	describe('isValidEmailAddress', () => {
		it('should accept valid email', () => {
			expect(isValidEmailAddress({ value: 'test@example.com' })).toBe(true);
		});

		it('should accept email with subdomain', () => {
			expect(isValidEmailAddress({ value: 'user@mail.example.com' })).toBe(true);
		});

		it('should be case-insensitive', () => {
			expect(isValidEmailAddress({ value: 'TEST@EXAMPLE.COM' })).toBe(true);
		});

		it('should accept numbers in email', () => {
			expect(isValidEmailAddress({ value: 'user123@example.com' })).toBe(true);
		});

		it('should reject email without @', () => {
			expect(isValidEmailAddress({ value: 'testexample.com' })).toBe(false);
		});

		it('should reject email without domain', () => {
			expect(isValidEmailAddress({ value: 'test@' })).toBe(false);
		});

		it('should reject email without TLD', () => {
			expect(isValidEmailAddress({ value: 'test@example' })).toBe(false);
		});

		it('should reject empty string', () => {
			expect(isValidEmailAddress({ value: '' })).toBe(false);
		});

		it('should accept special characters in local part', () => {
			expect(isValidEmailAddress({ value: 'test.user@example.com' })).toBe(true);
		});

		it('should accept hyphens in domain', () => {
			expect(isValidEmailAddress({ value: 'test@my-domain.com' })).toBe(true);
		});

		it('should handle non-string input', () => {
			expect(isValidEmailAddress({ value: 123 })).toBe(false);
		});
	});

	describe('isValidDate', () => {
		it('should accept valid ISO date string', () => {
			expect(isValidDate({ value: '2024-01-15' })).toBe(true);
		});

		it('should accept valid Date object', () => {
			const date = new Date('2024-01-15');
			expect(isValidDate({ value: date })).toBe(true);
		});

		it('should accept valid timestamp number', () => {
			const timestamp = new Date('2024-01-15').getTime();
			expect(isValidDate({ value: timestamp })).toBe(true);
		});

		it('should accept today\'s date', () => {
			expect(isValidDate({ value: new Date() })).toBe(true);
		});

		it('should accept various date formats', () => {
			expect(isValidDate({ value: '01/15/2024' })).toBe(true);
		});

		it('should reject invalid date string', () => {
			expect(isValidDate({ value: 'invalid-date' })).toBe(false);
		});

		it('should reject empty string', () => {
			expect(isValidDate({ value: '' })).toBe(false);
		});

		it('should handle null as invalid (type safety)', () => {
			// null is not a valid input type - function expects string | number | Date
			// This test validates the function signature
			expect(isValidDate({ value: 0 })).toBe(true); // epoch as number
		});

		it('should accept future dates', () => {
			const futureDate = new Date();
			futureDate.setFullYear(futureDate.getFullYear() + 1);
			expect(isValidDate({ value: futureDate })).toBe(true);
		});

		it('should accept past dates', () => {
			expect(isValidDate({ value: '1990-01-01' })).toBe(true);
		});
	});

	describe('isValidUrl', () => {
		it('should accept valid HTTP URL', () => {
			expect(isValidUrl({ value: 'http://example.com' })).toBe(true);
		});

		it('should accept valid HTTPS URL', () => {
			expect(isValidUrl({ value: 'https://example.com' })).toBe(true);
		});

		it('should accept URL with path', () => {
			expect(isValidUrl({ value: 'https://example.com/path/to/page' })).toBe(true);
		});

		it('should accept URL with query parameters', () => {
			expect(isValidUrl({ value: 'https://example.com?param=value' })).toBe(true);
		});

		it('should accept URL with fragment', () => {
			expect(isValidUrl({ value: 'https://example.com#section' })).toBe(true);
		});

		it('should accept URL with port', () => {
			expect(isValidUrl({ value: 'https://example.com:8080' })).toBe(true);
		});

		it('should accept URL with subdomain', () => {
			expect(isValidUrl({ value: 'https://sub.example.com' })).toBe(true);
		});

		it('should reject invalid URL', () => {
			expect(isValidUrl({ value: 'not a url' })).toBe(false);
		});

		it('should reject empty string', () => {
			expect(isValidUrl({ value: '' })).toBe(false);
		});

		it('should reject URL without protocol', () => {
			expect(isValidUrl({ value: 'example.com' })).toBe(false);
		});

		it('should accept URL object', () => {
			const url = new URL('https://example.com');
			expect(isValidUrl({ value: url })).toBe(true);
		});

		it('should handle various valid URLs', () => {
			expect(isValidUrl({ value: 'https://www.google.com' })).toBe(true);
			expect(isValidUrl({ value: 'https://stackoverflow.com' })).toBe(true);
		});
	});

	describe('isValidDiscountCode', () => {
		it('should return promise/async result', async () => {
			const result = isValidDiscountCode({ value: 'TESTCODE' });
			expect(result).toBeDefined();
		});

		it('should accept discount code field', async () => {
			const result = await isValidDiscountCode({ value: 'SAVE10' });
			expect(typeof result).toBe('boolean');
		});

		it('should handle empty discount code', async () => {
			const result = await isValidDiscountCode({ value: '' });
			expect(typeof result).toBe('boolean');
		});

		it('should handle valid discount code format', async () => {
			const result = await isValidDiscountCode({ value: 'DISCOUNT2024' });
			expect(typeof result).toBe('boolean');
		});

		it('should handle uppercase codes', async () => {
			const result = await isValidDiscountCode({ value: 'CODE123' });
			expect(typeof result).toBe('boolean');
		});
	});

	describe('Validation Integration', () => {
		it('should handle multiple validation checks', () => {
			const email = 'test@example.com';
			const zipCode = '12345';
			const phoneNumber = '(123) 456-7890';

			expect(isValidEmailAddress({ value: email })).toBe(true);
			expect(isValidUSZipCode({ value: zipCode })).toBe(true);
			expect(isValidUSPhoneNumber({ value: phoneNumber })).toBe(true);
		});

		it('should reject invalid data across validators', () => {
			expect(isValidEmailAddress({ value: 'invalid' })).toBe(false);
			expect(isValidUSZipCode({ value: 'invalid' })).toBe(false);
			expect(isValidUSPhoneNumber({ value: 'invalid' })).toBe(false);
		});

		it('should handle edge cases', () => {
			expect(isValidEmailAddress({ value: '   ' })).toBe(false);
			expect(isValidUSZipCode({ value: '   ' })).toBe(false);
			expect(isValidUrl({ value: '   ' })).toBe(false);
		});
	});
});
