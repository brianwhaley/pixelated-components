import { describe, it, expect } from 'vitest';
import { 
	componentMap, 
	layoutComponents, 
	componentTypes, 
	isLayoutComponent, 
	getComponentType 
} from '../components/sitebuilder/page/lib/componentMap';

describe('componentMap', () => {
	it('should contain all expected components', () => {
		expect(componentMap).toBeDefined();
		expect(typeof componentMap).toBe('object');
		expect(Object.keys(componentMap).length).toBeGreaterThan(0);
	});

	it('should have Page Title Header component', () => {
		expect(componentMap['Page Title Header']).toBeDefined();
	});

	it('should have Page Section Header component', () => {
		expect(componentMap['Page Section Header']).toBeDefined();
	});

	it('should have Callout component', () => {
		expect(componentMap['Callout']).toBeDefined();
	});

	it('should have Page Section component', () => {
		expect(componentMap['Page Section']).toBeDefined();
	});

	it('should have Grid Item component', () => {
		expect(componentMap['Grid Item']).toBeDefined();
	});

	it('should have Flex Item component', () => {
		expect(componentMap['Flex Item']).toBeDefined();
	});

	it('should have exactly 6 components', () => {
		expect(Object.keys(componentMap).length).toBe(6);
	});
});

describe('layoutComponents', () => {
	it('should be an array', () => {
		expect(Array.isArray(layoutComponents)).toBe(true);
	});

	it('should contain Page Section', () => {
		expect(layoutComponents).toContain('Page Section');
	});

	it('should contain Grid Item', () => {
		expect(layoutComponents).toContain('Grid Item');
	});

	it('should contain Flex Item', () => {
		expect(layoutComponents).toContain('Flex Item');
	});

	it('should have exactly 3 layout components', () => {
		expect(layoutComponents.length).toBe(3);
	});

	it('should not contain Page Title Header', () => {
		expect(layoutComponents).not.toContain('Page Title Header');
	});

	it('should not contain Page Section Header', () => {
		expect(layoutComponents).not.toContain('Page Section Header');
	});

	it('should not contain Callout', () => {
		expect(layoutComponents).not.toContain('Callout');
	});
});

describe('componentTypes', () => {
	it('should be a string', () => {
		expect(typeof componentTypes).toBe('string');
	});

	it('should contain all component names', () => {
		expect(componentTypes).toContain('Page Title Header');
		expect(componentTypes).toContain('Page Section Header');
		expect(componentTypes).toContain('Callout');
		expect(componentTypes).toContain('Page Section');
		expect(componentTypes).toContain('Grid Item');
		expect(componentTypes).toContain('Flex Item');
	});

	it('should be comma-separated', () => {
		const parts = componentTypes.split(',');
		expect(parts.length).toBe(6);
	});
});

describe('isLayoutComponent', () => {
	it('should return true for Page Section', () => {
		expect(isLayoutComponent('Page Section')).toBe(true);
	});

	it('should return true for Grid Item', () => {
		expect(isLayoutComponent('Grid Item')).toBe(true);
	});

	it('should return true for Flex Item', () => {
		expect(isLayoutComponent('Flex Item')).toBe(true);
	});

	it('should return false for Page Title Header', () => {
		expect(isLayoutComponent('Page Title Header')).toBe(false);
	});

	it('should return false for Page Section Header', () => {
		expect(isLayoutComponent('Page Section Header')).toBe(false);
	});

	it('should return false for Callout', () => {
		expect(isLayoutComponent('Callout')).toBe(false);
	});

	it('should return false for unknown component', () => {
		expect(isLayoutComponent('Unknown Component')).toBe(false);
	});

	it('should return false for empty string', () => {
		expect(isLayoutComponent('')).toBe(false);
	});

	it('should be case-sensitive', () => {
		expect(isLayoutComponent('page section')).toBe(false);
		expect(isLayoutComponent('PAGE SECTION')).toBe(false);
	});
});

describe('getComponentType', () => {
	it('should return component for Page Title Header', () => {
		const component = getComponentType('Page Title Header');
		expect(component).toBeDefined();
		expect(component).toBe(componentMap['Page Title Header']);
	});

	it('should return component for Page Section Header', () => {
		const component = getComponentType('Page Section Header');
		expect(component).toBeDefined();
		expect(component).toBe(componentMap['Page Section Header']);
	});

	it('should return component for Callout', () => {
		const component = getComponentType('Callout');
		expect(component).toBeDefined();
		expect(component).toBe(componentMap['Callout']);
	});

	it('should return component for Page Section', () => {
		const component = getComponentType('Page Section');
		expect(component).toBeDefined();
		expect(component).toBe(componentMap['Page Section']);
	});

	it('should return component for Grid Item', () => {
		const component = getComponentType('Grid Item');
		expect(component).toBeDefined();
		expect(component).toBe(componentMap['Grid Item']);
	});

	it('should return component for Flex Item', () => {
		const component = getComponentType('Flex Item');
		expect(component).toBeDefined();
		expect(component).toBe(componentMap['Flex Item']);
	});

	it('should return undefined for unknown component', () => {
		const component = getComponentType('Unknown Component');
		expect(component).toBeUndefined();
	});

	it('should return undefined for empty string', () => {
		const component = getComponentType('');
		expect(component).toBeUndefined();
	});

	it('should be case-sensitive', () => {
		const component = getComponentType('page section');
		expect(component).toBeUndefined();
	});

	it('should return actual React component objects', () => {
		const component = getComponentType('Page Title Header');
		expect(component).not.toBeNull();
		expect(['function', 'object']).toContain(typeof component);
	});
});

describe('componentMap consistency', () => {
	it('should have all layout components defined in componentMap', () => {
		layoutComponents.forEach(layoutComponent => {
			expect(componentMap[layoutComponent as keyof typeof componentMap]).toBeDefined();
		});
	});

	it('should have all components from componentMap keys in layoutComponents or be non-layout', () => {
		Object.keys(componentMap).forEach(componentName => {
			const isLayout = isLayoutComponent(componentName);
			if (isLayout) {
				expect(layoutComponents).toContain(componentName);
			}
		});
	});

	it('should allow retrieving any component from componentMap', () => {
		Object.keys(componentMap).forEach(componentName => {
			const component = getComponentType(componentName);
			expect(component).toBeDefined();
		});
	});
});
