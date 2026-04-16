import { describe, it, expect, vi } from 'vitest';
import { generateComponentObject, generateFieldJSON } from '../components/sitebuilder/page/lib/componentGeneration';

describe('componentGeneration', () => {
	it('should create a component object with parsed JSON, numbers, and checkbox values', () => {
		const form = document.createElement('form');

		const typeInput = document.createElement('input');
		typeInput.type = 'text';
		typeInput.name = 'type';
		typeInput.value = 'Callout';

		const jsonInput = document.createElement('input');
		jsonInput.type = 'text';
		jsonInput.name = 'content';
		jsonInput.value = '{"text":"Hello"}';

		const numberInput = document.createElement('input');
		numberInput.type = 'number';
		numberInput.name = 'quantity';
		numberInput.value = '10';

		const checkboxInput = document.createElement('input');
		checkboxInput.type = 'checkbox';
		checkboxInput.name = 'active';
		checkboxInput.checked = true;

		const parentPathInput = document.createElement('input');
		parentPathInput.type = 'hidden';
		parentPathInput.name = '__parentPath';
		parentPathInput.value = 'root[0]';

		form.append(typeInput, jsonInput, numberInput, checkboxInput, parentPathInput);
	
		const { component, parentPath } = generateComponentObject({ target: form } as unknown as Event);

		expect(parentPath).toBe('root[0]');
		expect(component.component).toBe('Callout');
		expect(component.props.content).toEqual({ text: 'Hello' });
		expect(component.props.quantity).toBe(10);
		expect(component.props.active).toBe(true);
		expect(component.path).toContain('root[');
	});

	it('should preserve invalid JSON strings instead of throwing', () => {
		const form = document.createElement('form');

		const typeInput = document.createElement('input');
		typeInput.type = 'text';
		typeInput.name = 'type';
		typeInput.value = 'Callout';

		const badJsonInput = document.createElement('input');
		badJsonInput.type = 'text';
		badJsonInput.name = 'content';
		badJsonInput.value = '{invalid-json}';

		form.append(typeInput, badJsonInput);

		const { component } = generateComponentObject({ target: form } as unknown as Event);
		expect(component.props.content).toBe('{invalid-json}');
	});

	it('should generate field JSON with a parentPath and update button text', () => {
		const result = generateFieldJSON('Callout', { title: 'Test title' }, 'root[0]');

		expect(result.fields[0].props.value).toBe('Callout');
		expect(result.fields.some((field) => field.props.name === '__parentPath')).toBe(true);
		expect(result.fields[result.fields.length - 1].props.text).toBe('Update Callout');
	});

	it('should generate add button text when no existing props are provided', () => {
		const result = generateFieldJSON('Callout');
		expect(result.fields[result.fields.length - 1].props.text).toBe('Add Callout');
	});
});
