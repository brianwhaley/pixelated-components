
/**
 * Shared TypeScript types for the PageBuilder
 */

export interface ComponentData {
	component: string;
	props: Record<string, any>;
	children?: ComponentData[];
	path?: string;
}

export interface PageData {
	components: ComponentData[];
}

export interface EditMode {
	path: string;
	component: ComponentData;
}

export interface PropTypeInfo {
	type: string;
	options?: string[] | Record<string, any>;
	isRequired?: boolean;
	elementType?: any;
}

export type ComponentSelectorEditMode = {
	component: string;
	props: Record<string, any>;
};
