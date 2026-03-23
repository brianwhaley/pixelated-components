import { describe, it, expect } from 'vitest';
import {
	mapTypeToComponent,
	generateTypeField,
	convertNumericProps
} from '../components/sitebuilder/form/formutils';

describe('Form Utilities', () => {
	describe('mapTypeToComponent', () => {
		it('should map button type to FormButton', () => {
			expect(mapTypeToComponent('button')).toBe('FormButton');
		});

		it('should map checkbox type to FormCheckbox', () => {
			expect(mapTypeToComponent('checkbox')).toBe('FormCheckbox');
		});

		it('should map radio type to FormRadio', () => {
			expect(mapTypeToComponent('radio')).toBe('FormRadio');
		});

		it('should map select type to FormSelect', () => {
			expect(mapTypeToComponent('select')).toBe('FormSelect');
		});

		it('should map textarea type to FormTextarea', () => {
			expect(mapTypeToComponent('textarea')).toBe('FormTextarea');
		});

		it('should map datalist type to FormDataList', () => {
			expect(mapTypeToComponent('datalist')).toBe('FormDataList');
		});

		it('should default unknown types to FormInput', () => {
			expect(mapTypeToComponent('text')).toBe('FormInput');
			expect(mapTypeToComponent('email')).toBe('FormInput');
			expect(mapTypeToComponent('unknown')).toBe('FormInput');
		});

		it('should handle null/undefined with error', () => {
			expect(() => mapTypeToComponent(null as any)).toThrow();
			expect(() => mapTypeToComponent(undefined as any)).toThrow();
		});
	});

	describe('generateTypeField', () => {
		it('should generate a field object with component and props', () => {
			const field = generateTypeField();
			expect(field).toBeDefined();
			expect(field.fields).toBeDefined();
			expect(Array.isArray(field.fields)).toBe(true);
		});

		it('should include type input field', () => {
			const field = generateTypeField();
			expect(field.fields).toHaveLength(2);
			expect(field.fields[0].component).toBe('FormInput');
			expect(field.fields[0].props.name).toBe('type');
		});

		it('should include submit button', () => {
			const field = generateTypeField();
			expect(field.fields[1].component).toBe('FormButton');
			expect(field.fields[1].props.label).toContain('Build');
		});

		it('should return consistent output across calls', () => {
			const field1 = generateTypeField();
			const field2 = generateTypeField();
			expect(field1.fields).toEqual(field2.fields);
		});
	});

	describe('convertNumericProps', () => {
		it('should convert specific string properties to numbers', () => {
			const props = {
				maxLength: '100',
				minLength: '5',
				rows: '10'
			};
			convertNumericProps(props);

			expect(props.maxLength).toBe(100);
			expect(props.minLength).toBe(5);
			expect(props.rows).toBe(10);
		});

		it('should convert numeric string values', () => {
			const props = { size: '20', step: '0.5' };
			convertNumericProps(props);

			expect(props.size).toBe(20);
			expect(props.step).toBe(0.5);
		});

		it('should handle cols property', () => {
			const props = { cols: '50' };
			convertNumericProps(props);
			expect(props.cols).toBe(50);
		});

		it('should ignore non-numeric properties in conversion list', () => {
			const props = { name: 'field123', type: 'text' };
			convertNumericProps(props);
			expect(props.name).toBe('field123');
			expect(props.type).toBe('text');
		});

		it('should ignore undefined values', () => {
			const props = { maxLength: undefined, minLength: '5' };
			convertNumericProps(props);
			expect(props.maxLength).toBeUndefined();
			expect(props.minLength).toBe(5);
		});

		it('should ignore null values', () => {
			const props = { maxLength: null, size: '10' };
			convertNumericProps(props);
			expect(props.maxLength).toBeNull();
			expect(props.size).toBe(10);
		});

		it('should ignore empty strings', () => {
			const props = { rows: '', maxLength: '100' };
			convertNumericProps(props);
			expect(props.rows).toBe('');
			expect(props.maxLength).toBe(100);
		});

		it('should handle float values', () => {
			const props = { step: '0.25' };
			convertNumericProps(props);
			expect(props.step).toBe(0.25);
		});

		it('should skip non-target properties', () => {
			const props = {
				maxLength: '100',
				customProp: '999',
				rows: '5'
			};
			convertNumericProps(props);
			expect(props.maxLength).toBe(100);
			expect(props.customProp).toBe('999');
			expect(props.rows).toBe(5);
		});

		it('should handle already numeric values', () => {
			const props = { size: 10, rows: '5' };
			convertNumericProps(props);
			expect(props.size).toBe(10);
			expect(props.rows).toBe(5);
		});

		it('should handle invalid numeric strings', () => {
			const props = { rows: 'abc', maxLength: '50' };
			convertNumericProps(props);
			expect(props.rows).toBe('abc');
			expect(props.maxLength).toBe(50);
		});

		it('should mutate object in place', () => {
			const props = { maxLength: '100' };
			const result = convertNumericProps(props);
			expect(result).toBeUndefined();
			expect(props.maxLength).toBe(100);
		});
	});
});
