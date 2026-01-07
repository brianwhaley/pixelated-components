import { PageTitleHeader, PageSectionHeader } from "../../../general/semantic";
import { Callout } from "../../../general/callout";
import { PageSection, PageGridItem, PageFlexItem } from "../../../general/semantic";

/**
 * Component registry and constants
 */

export const componentMap = {
	"Page Title Header": PageTitleHeader,
	"Page Section Header": PageSectionHeader,
	"Callout": Callout,
	"Page Section": PageSection,
	"Grid Item": PageGridItem,
	"Flex Item": PageFlexItem,
};

export const layoutComponents = [
	'Page Section',
	'Grid Item',
	'Flex Item'
];

export const componentTypes = Object.keys(componentMap).toString();

/**
 * Check if a component is a layout component (can have children)
 */
export function isLayoutComponent(componentName: string): boolean {
	return layoutComponents.includes(componentName);
}

/**
 * Get component type from the registry
 */
export function getComponentType(componentName: string) {
	return componentMap[componentName as keyof typeof componentMap];
}
