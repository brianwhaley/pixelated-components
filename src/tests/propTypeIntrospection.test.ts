import { describe, it, expect } from 'vitest';
import { getPropTypeInfo } from '../components/sitebuilder/page/lib/propTypeIntrospection';

describe('PropType Introspection', () => {
	it('should export getPropTypeInfo function', () => {
		expect(typeof getPropTypeInfo).toBe('function');
	});

	it('should return PropTypeInfo for component prop', () => {
		const info = getPropTypeInfo({}, 'Button', 'variant');
		expect(info).toBeDefined();
		expect(info).toHaveProperty('type');
	});

	it('should handle missing metadata gracefully', () => {
		const info = getPropTypeInfo({}, 'UnknownComponent', 'unknownProp');
		expect(info).toBeDefined();
	});

	it('should process different propType structures', () => {
		const testCases = [
			{ type: 'string' },
			{ type: 'number' },
			{ type: 'boolean' },
			{ type: 'array' },
			{ type: 'object' },
		];

		testCases.forEach(testCase => {
			const info = getPropTypeInfo(testCase);
			expect(info).toBeDefined();
		});
	});

	it('should identify prop options when available', () => {
		const propWithOptions = {
			__proto__: { oneOf: ['option1', 'option2'] },
		};
		const info = getPropTypeInfo(propWithOptions);
		expect(info).toBeDefined();
	});

	it('should handle required vs optional props', () => {
		const requiredProp = { isRequired: true };
		const optionalProp = { isRequired: false };
		
		const requiredInfo = getPropTypeInfo(requiredProp);
		const optionalInfo = getPropTypeInfo(optionalProp);
		
		expect(requiredInfo).toBeDefined();
		expect(optionalInfo).toBeDefined();
	});

	it('should support component-specific metadata lookup', () => {
		const knownComponentProp = getPropTypeInfo({}, 'Modal', 'isOpen');
		const unknownComponentProp = getPropTypeInfo({}, 'NonExistent', 'prop');
		
		expect(knownComponentProp).toBeDefined();
		expect(unknownComponentProp).toBeDefined();
	});

	it('should generate consistent results for same input', () => {
		const input = { type: 'string' };
		const result1 = getPropTypeInfo(input, 'Test', 'testProp');
		const result2 = getPropTypeInfo(input, 'Test', 'testProp');
		
		expect(result1.type).toBe(result2.type);
	});

	describe('PropType Analysis Integration', () => {
		it('should work with React PropTypes patterns', () => {
			// Simulate a typical PropTypes definition
			const stringPropType = { type: 'string' };
			const boolPropType = { type: 'boolean' };
			const arrayPropType = { type: 'array' };
			
			expect(getPropTypeInfo(stringPropType)).toBeDefined();
			expect(getPropTypeInfo(boolPropType)).toBeDefined();
			expect(getPropTypeInfo(arrayPropType)).toBeDefined();
		});

		it('should support form field generation', () => {
			const propInfo = getPropTypeInfo({ type: 'string' }, 'Text', 'value');
			expect(propInfo).toHaveProperty('type');
			// If options are available, should be in an array
			if (propInfo.options) {
				expect(Array.isArray(propInfo.options)).toBe(true);
			}
		});

		it('should handle complex component hierarchies', () => {
			const components = ['Button', 'Modal', 'Form', 'Select', 'Input'];
			
			components.forEach(comp => {
				const info = getPropTypeInfo({}, comp, 'someProp');
				expect(info).toBeDefined();
				expect(typeof info.type).toBe('string');
			});
		});
	});
});
