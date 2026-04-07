import { describe, it, expect } from 'vitest';
import { mapTypeToComponent, generateTypeField, convertNumericProps } from '../components/sitebuilder/form/formengineutilities';

describe('Form Engine Utilities', () => {
	describe('mapTypeToComponent', () => {
		it('should map button type to FormButton', () => {
			expect(mapTypeToComponent('button')).toBe('FormButton');
		});

		it('should map checkbox type to FormCheckbox', () => {
			expect(mapTypeToComponent('checkbox')).toBe('FormCheckbox');
		});

		it('should map datalist type to FormDataList', () => {
			expect(mapTypeToComponent('datalist')).toBe('FormDataList');
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

		it('should default to FormInput for unknown types', () => {
			expect(mapTypeToComponent('text')).toBe('FormInput');
			expect(mapTypeToComponent('email')).toBe('FormInput');
			expect(mapTypeToComponent('number')).toBe('FormInput');
			expect(mapTypeToComponent('password')).toBe('FormInput');
			expect(mapTypeToComponent('unknown')).toBe('FormInput');
		});

		it('should throw error for empty or null type', () => {
			expect(() => mapTypeToComponent('')).toThrow('Field type is required');
		});

		it('should throw error for null type', () => {
			expect(() => mapTypeToComponent(null as any)).toThrow('Field type is required');
		});

		it('should throw error for undefined type', () => {
			expect(() => mapTypeToComponent(undefined as any)).toThrow('Field type is required');
		});

		it('should be case-sensitive', () => {
			expect(mapTypeToComponent('Button')).toBe('FormInput');
			expect(mapTypeToComponent('CHECKBOX')).toBe('FormInput');
		});
	});

	describe('generateTypeField', () => {
		it('should return form object with fields array', () => {
			const result = generateTypeField();
			expect(result).toBeDefined();
			expect(result.fields).toBeDefined();
			expect(Array.isArray(result.fields)).toBe(true);
		});

		it('should have exactly 2 fields', () => {
			const result = generateTypeField();
			expect(result.fields.length).toBe(2);
		});

		it('should have type field as first field', () => {
			const result = generateTypeField();
			const typeField = result.fields[0];
			expect(typeField.component).toBe('FormInput');
			expect(typeField.props.name).toBe('type');
			expect(typeField.props.id).toBe('type');
			expect(typeField.props.type).toBe('text');
		});

		it('should have build button as second field', () => {
			const result = generateTypeField();
			const button = result.fields[1];
			expect(button.component).toBe('FormButton');
			expect(button.props.label).toBe('Build');
			expect(button.props.type).toBe('submit');
		});

		it('should have type field with datalist attribute', () => {
			const result = generateTypeField();
			const typeField = result.fields[0];
			expect(typeField.props.list).toBe('inputTypes');
		});

		it('should generate consistent structure on repeated calls', () => {
			const result1 = generateTypeField();
			const result2 = generateTypeField();
			expect(JSON.stringify(result1)).toEqual(JSON.stringify(result2));
		});
	});

	describe('convertNumericProps', () => {
		it('should convert maxLength string to number', () => {
			const props = { maxLength: '100' };
			convertNumericProps(props);
			expect(props.maxLength).toBe(100);
			expect(typeof props.maxLength).toBe('number');
		});

		it('should convert minLength string to number', () => {
			const props = { minLength: '5' };
			convertNumericProps(props);
			expect(props.minLength).toBe(5);
		});

		it('should convert rows string to number', () => {
			const props = { rows: '10' };
			convertNumericProps(props);
			expect(props.rows).toBe(10);
		});

		it('should convert cols string to number', () => {
			const props = { cols: '50' };
			convertNumericProps(props);
			expect(props.cols).toBe(50);
		});

		it('should convert size string to number', () => {
			const props = { size: '20' };
			convertNumericProps(props);
			expect(props.size).toBe(20);
		});

		it('should convert step string to number', () => {
			const props = { step: '0.5' };
			convertNumericProps(props);
			expect(props.step).toBe(0.5);
		});

		it('should convert multiple numeric props at once', () => {
			const props = {
				maxLength: '100',
				minLength: '5',
				rows: '10',
				cols: '50',
				size: '20',
				step: '0.5'
			};
			convertNumericProps(props);
			expect(props.maxLength).toBe(100);
			expect(props.minLength).toBe(5);
			expect(props.rows).toBe(10);
			expect(props.cols).toBe(50);
			expect(props.size).toBe(20);
			expect(props.step).toBe(0.5);
		});

		it('should skip null values', () => {
			const props = { maxLength: null };
			convertNumericProps(props);
			expect(props.maxLength).toBeNull();
		});

		it('should skip undefined values', () => {
			const props = { maxLength: undefined };
			convertNumericProps(props);
			expect(props.maxLength).toBeUndefined();
		});

		it('should skip empty string values', () => {
			const props = { maxLength: '' };
			convertNumericProps(props);
			expect(props.maxLength).toBe('');
		});

		it('should not convert non-numeric strings', () => {
			const props = { maxLength: 'invalid' };
			convertNumericProps(props);
			expect(props.maxLength).toBe('invalid');
		});

		it('should not convert already numeric properties', () => {
			const props = { maxLength: 100, minLength: 5 };
			convertNumericProps(props);
			expect(props.maxLength).toBe(100);
			expect(props.minLength).toBe(5);
		});

		it('should handle negative numbers', () => {
			const props = { step: '-1' };
			convertNumericProps(props);
			expect(props.step).toBe(-1);
		});

		it('should handle decimal numbers', () => {
			const props = { step: '0.25' };
			convertNumericProps(props);
			expect(props.step).toBe(0.25);
		});

		it('should ignore non-numeric property names', () => {
			const props = { maxLength: '100', otherProp: '999', customValue: '50' };
			convertNumericProps(props);
			expect(props.maxLength).toBe(100);
			expect(props.otherProp).toBe('999');
			expect(props.customValue).toBe('50');
		});

		it('should handle empty object', () => {
			const props = {};
			convertNumericProps(props);
			expect(Object.keys(props).length).toBe(0);
		});

		it('should handle object with only custom properties', () => {
			const props = { customProp: '123', anotherProp: '456' };
			const original = JSON.stringify(props);
			convertNumericProps(props);
			expect(JSON.stringify(props)).toBe(original);
		});

		it('should handle zero as valid numeric value', () => {
			const props = { maxLength: '0', minLength: '0', size: '0' };
			convertNumericProps(props);
			expect(props.maxLength).toBe(0);
			expect(props.minLength).toBe(0);
			expect(props.size).toBe(0);
		});

		it('should handle large numbers', () => {
			const props = { maxLength: '9999999' };
			convertNumericProps(props);
			expect(props.maxLength).toBe(9999999);
		});

		it('should handle whitespace in numeric strings', () => {
			const props = { maxLength: ' 100 ' };
			convertNumericProps(props);
			expect(props.maxLength).toBe(100);
		});
	});
});
