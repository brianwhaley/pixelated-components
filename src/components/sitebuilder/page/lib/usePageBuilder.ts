
import { useState } from 'react';
import { generateComponentObject } from './componentGeneration';
import type { PageData, EditMode, ComponentData } from './types';

/**
 * usePageBuilder - Custom hook for PageBuilder state management
 * Handles all state and business logic for component management
 */

export function usePageBuilder() {
	const [pageJSON, setPageJSON] = useState<PageData>({ components: [] });
	const [editableComponent, setEditableComponent] = useState({});
	const [selectedPath, setSelectedPath] = useState<string>('');
	const [editMode, setEditMode] = useState<EditMode | null>(null);
	
	/**
	 * Handles adding new components or updating existing ones
	 */
	function handleAddNewComponent(event: Event) {
		const { component: newComponent, parentPath } = generateComponentObject(event);
		
		const components = JSON.parse(JSON.stringify(pageJSON.components));
		
		// Check if we're editing an existing component
		if (editMode) {
			// Update existing component at editMode.path
			const pathParts = editMode.path.split(/[.[\]]/).filter(p => p);
			let current: any = { components };
			
			for (let i = 0; i < pathParts.length - 1; i++) {
				const part = pathParts[i];
				if (part === 'children' || part === 'root') {
					current = current[part === 'root' ? 'components' : part];
				} else {
					current = current[parseInt(part)];
				}
			}
		
			const lastPart = pathParts[pathParts.length - 1];
			const index = parseInt(lastPart);
		
			// Preserve children if it's a layout component
			if (current[index]?.children) {
				newComponent.children = current[index].children;
			}
		
			current[index] = newComponent;
		
			setPageJSON({ components });
			setEditableComponent({});
			setSelectedPath('');
			setEditMode(null);
			return;
		}
	
		if (!parentPath) {
			// Add to root level
			components.push(newComponent);
		} else {
			// Find parent and add to its children
			const pathParts = parentPath.split(/[[\].]/).filter(Boolean);
			let current: any = { components };
		
			for (let i = 0; i < pathParts.length; i++) {
				const part = pathParts[i];
				if (part === 'root') {
					current = current.components;
				} else if (part === 'children') {
					// Next part should be an index
					continue;
				} else {
					const idx = parseInt(part);
					if (!isNaN(idx)) {
						current = current[idx];
					}
				}
			}
		
			if (current && Array.isArray(current.children)) {
				current.children.push(newComponent);
			}
		}
	
		setPageJSON({ components });
		setEditableComponent({});
		setSelectedPath('');
	}
	
	/**
	 * Handles selecting a component for adding children
	 */
	function handleSelectComponent(component: ComponentData, path: string) {
		// Toggle selection - if clicking same component, unselect it
		if (selectedPath === path) {
			setSelectedPath('');
		} else {
			setSelectedPath(path);
		}
		setEditMode(null);
	}
	
	/**
	 * Handles editing an existing component
	 */
	function handleEditComponent(component: ComponentData, path: string) {
		// Load component properties for editing
		setEditMode({ path, component });
		setSelectedPath('');
		// ComponentSelector will generate the form when editMode changes
	}
	
	/**
	 * Clears component selection
	 */
	function clearSelection() {
		setSelectedPath('');
	}
	
	/**
	 * Cancels edit mode
	 */
	function cancelEdit() {
		setEditMode(null);
		setEditableComponent({});
	}
	
	/**
	 * Handles deleting a component by path
	 */
	function handleDeleteComponent(path: string) {
		const components = JSON.parse(JSON.stringify(pageJSON.components));
		const pathParts = path.split(/[.[\]]/).filter(p => p);
		
		// Navigate to parent
		let current: any = { components };
		for (let i = 0; i < pathParts.length - 1; i++) {
			const part = pathParts[i];
			if (part === 'root') {
				current = current.components;
			} else if (part === 'children') {
				continue;
			} else {
				current = current[parseInt(part)];
			}
		}
		
		// Get the index to delete
		const lastPart = pathParts[pathParts.length - 1];
		const index = parseInt(lastPart);
		
		// Delete from array
		if (Array.isArray(current)) {
			current.splice(index, 1);
		} else if (current.children && Array.isArray(current.children)) {
			current.children.splice(index, 1);
		}
		
		setPageJSON({ components });
		
		// Clear edit mode and selection if deleting that component
		if (editMode?.path === path) {
			cancelEdit();
		}
		if (selectedPath === path) {
			clearSelection();
		}
	}
	
	/**
	 * Move component up in the array (swap with previous sibling)
	 */
	function handleMoveUp(path: string) {
		const components = JSON.parse(JSON.stringify(pageJSON.components));
		const pathParts = path.split(/[.[\]]/).filter(p => p);
		let current: any = { components };
		
		// Navigate to parent array
		for (let i = 0; i < pathParts.length - 1; i++) {
			const part = pathParts[i];
			if (part === 'root') {
				current = current.components;
			} else if (part === 'children') {
				continue;
			} else {
				current = current[parseInt(part)];
			}
		}
		
		const lastPart = pathParts[pathParts.length - 1];
		const index = parseInt(lastPart);
		
		// Get the array containing this component
		const array = Array.isArray(current) ? current : current.children;
		
		// Can't move up if already first
		if (index > 0 && array) {
			// Swap with previous
			[array[index - 1], array[index]] = [array[index], array[index - 1]];
			setPageJSON({ components });
		}
	}
	
	/**
	 * Move component down in the array (swap with next sibling)
	 */
	function handleMoveDown(path: string) {
		const components = JSON.parse(JSON.stringify(pageJSON.components));
		const pathParts = path.split(/[.[\]]/).filter(p => p);
		let current: any = { components };
		
		// Navigate to parent array
		for (let i = 0; i < pathParts.length - 1; i++) {
			const part = pathParts[i];
			if (part === 'root') {
				current = current.components;
			} else if (part === 'children') {
				continue;
			} else {
				current = current[parseInt(part)];
			}
		}
		
		const lastPart = pathParts[pathParts.length - 1];
		const index = parseInt(lastPart);
		
		// Get the array containing this component
		const array = Array.isArray(current) ? current : current.children;
		
		// Can't move down if already last
		if (array && index < array.length - 1) {
			// Swap with next
			[array[index], array[index + 1]] = [array[index + 1], array[index]];
			setPageJSON({ components });
		}
	}

	return {
		// State
		pageJSON,
		editableComponent,
		selectedPath,
		editMode,
		
		// Setters
		setPageJSON,
		setEditableComponent,
		setSelectedPath,
		setEditMode,
		
		// Handlers
		handleAddNewComponent,
		handleSelectComponent,
		handleEditComponent,
		clearSelection,
		cancelEdit,
		handleDeleteComponent,
		handleMoveUp,
		handleMoveDown,
	};
}
