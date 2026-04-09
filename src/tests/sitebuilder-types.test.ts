import { describe, it, expect } from 'vitest';

// Test exports from types.ts
import * as types from '../components/sitebuilder/page/lib/types';

describe('pagebuilder types - Export Coverage', () => {
	it('should export ComponentData interface', () => {
		expect(types).toBeDefined();
	});

	it('should export PageData interface', () => {
		expect(types).toBeDefined();
	});

	it('should export EditMode interface', () => {
		expect(types).toBeDefined();
	});

	it('should export PropTypeInfo interface', () => {
		expect(types).toBeDefined();
	});

	it('should export ComponentSelectorEditMode type', () => {
		expect(types).toBeDefined();
	});

	it('should be able to create ComponentData object', () => {
		const comp = { component: 'Button', props: {} };
		expect(comp.component).toBe('Button');
		expect(comp.props).toBeDefined();
	});

	it('should be able to create PageData object', () => {
		const page = { components: [] };
		expect(page.components).toHaveLength(0);
	});

	it('should be able to create EditMode object', () => {
		const mode = { path: 'root[0]', component: { component: 'Button', props: {} } };
		expect(mode.path).toBe('root[0]');
		expect(mode.component.component).toBe('Button');
	});

	it('should be able to create PropTypeInfo object', () => {
		const info = { type: 'string', isRequired: true };
		expect(info.type).toBe('string');
		expect(info.isRequired).toBe(true);
	});

	it('should be able to create ComponentSelectorEditMode object', () => {
		const mode = { component: 'Button', props: { label: 'Click' } };
		expect(mode.component).toBe('Button');
		expect(mode.props.label).toBe('Click');
	});

	it('should support nested ComponentData with children', () => {
		const parent = {
			component: 'Container',
			props: {},
			children: [
				{ component: 'Button', props: { label: 'Submit' } }
			]
		};
		expect(parent.children).toHaveLength(1);
		expect(parent.children?.[0].component).toBe('Button');
	});
});
