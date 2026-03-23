import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePageBuilder } from '../components/sitebuilder/page/lib/usePageBuilder';

vi.mock('../components/sitebuilder/page/lib/componentGeneration', () => ({
	generateComponentObject: vi.fn((event: any) => ({
		component: { 
			id: `comp-${Date.now()}`, 
			name: 'TestComponent', 
			type: 'div',
			props: { className: 'test' },
			children: []
		},
		parentPath: null
	}))
}));

describe('usePageBuilder Hook', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Initialization', () => {
		it('should export usePageBuilder as a function', () => {
			expect(typeof usePageBuilder).toBe('function');
		});

		it('should initialize with empty page components array', () => {
			const { result } = renderHook(() => usePageBuilder());
			expect(result.current.pageJSON).toBeDefined();
			expect(result.current.pageJSON.components).toBeDefined();
			expect(Array.isArray(result.current.pageJSON.components)).toBe(true);
			expect(result.current.pageJSON.components.length).toBe(0);
		});

		it('should initialize editable component as empty object', () => {
			const { result } = renderHook(() => usePageBuilder());
			expect(result.current.editableComponent).toBeDefined();
			expect(typeof result.current.editableComponent).toBe('object');
		});

		it('should initialize selected path as empty string', () => {
			const { result } = renderHook(() => usePageBuilder());
			expect(result.current.selectedPath).toBe('');
		});

		it('should initialize edit mode as null', () => {
			const { result } = renderHook(() => usePageBuilder());
			expect(result.current.editMode).toBeNull();
		});
	});

	describe('State Setters', () => {
		it('should update pageJSON via setPageJSON', () => {
			const { result } = renderHook(() => usePageBuilder());
			const newPageData = { components: [{ id: '1', name: 'NewComponent', type: 'div', component: 'div', props: {} }] };
			
			act(() => {
				result.current.setPageJSON(newPageData);
			});
			
			expect(result.current.pageJSON).toEqual(newPageData);
		});

		it('should update editableComponent via setEditableComponent', () => {
			const { result } = renderHook(() => usePageBuilder());
			const newComponent = { id: 'comp1', name: 'EditComponent' };
			
			act(() => {
				result.current.setEditableComponent(newComponent);
			});
			
			expect(result.current.editableComponent).toEqual(newComponent);
		});

		it('should update selectedPath via setSelectedPath', () => {
			const { result } = renderHook(() => usePageBuilder());
			const testPath = 'root[0].children[1]';
			
			act(() => {
				result.current.setSelectedPath(testPath);
			});
			
			expect(result.current.selectedPath).toBe(testPath);
		});

		it('should update editMode via setEditMode', () => {
			const { result } = renderHook(() => usePageBuilder());
			const editModeData = { path: 'root[0]', component: { id: '1' } };
			
			act(() => {
				result.current.setEditMode(editModeData as any);
			});
			
			expect(result.current.editMode).toEqual(editModeData);
		});
	});

	describe('Component Operations', () => {
		it('should handle adding new components', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			act(() => {
				const mockEvent = new Event('test');
				result.current.handleAddNewComponent(mockEvent);
			});
			
			// Component should be added to the root
			expect(result.current.pageJSON.components.length).toBe(1);
		});

		it('should handle selecting a component', () => {
			const { result } = renderHook(() => usePageBuilder());
			const testComponent = { id: 'test', name: 'TestComp', type: 'div' } as any;
			const testPath = 'root[0]';
			
			act(() => {
				result.current.handleSelectComponent(testComponent, testPath);
			});
			
			expect(result.current.selectedPath).toBe(testPath);
		});

		it('should toggle selection when selecting same component', () => {
			const { result } = renderHook(() => usePageBuilder());
			const testComponent = { id: 'test' } as any;
			const testPath = 'root[0]';
			
			// First select
			act(() => {
				result.current.handleSelectComponent(testComponent, testPath);
			});
			expect(result.current.selectedPath).toBe(testPath);
			
			// Select again should deselect
			act(() => {
				result.current.handleSelectComponent(testComponent, testPath);
			});
			expect(result.current.selectedPath).toBe('');
		});

		it('should handle editing a component', () => {
			const { result } = renderHook(() => usePageBuilder());
			const testComponent = { id: 'test' } as any;
			const testPath = 'root[0]';
			
			act(() => {
				result.current.handleEditComponent(testComponent, testPath);
			});
			
			expect(result.current.editMode).toBeDefined();
			expect(result.current.editMode?.path).toBe(testPath);
		});

		it('should clear selection', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			act(() => {
				result.current.setSelectedPath('root[0]');
			});
			expect(result.current.selectedPath).toBe('root[0]');
			
			act(() => {
				result.current.clearSelection();
			});
			expect(result.current.selectedPath).toBe('');
		});

		it('should cancel edit mode', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			act(() => {
				result.current.setEditMode({ path: 'root[0]' } as any);
				result.current.setEditableComponent({ id: 'comp' });
			});
			
			expect(result.current.editMode).toBeDefined();
			expect(Object.keys(result.current.editableComponent).length).toBeGreaterThan(0);
			
			act(() => {
				result.current.cancelEdit();
			});
			
			expect(result.current.editMode).toBeNull();
		});

		it('should handle deleting a component', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			// First add a component
			act(() => {
				const mockEvent = new Event('test');
				result.current.handleAddNewComponent(mockEvent);
			});
			expect(result.current.pageJSON.components.length).toBe(1);
			
			// Then delete it
			act(() => {
				result.current.handleDeleteComponent('root[0]');
			});
			
			expect(result.current.pageJSON.components.length).toBe(0);
		});

		it('should handle moving component up', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			// Add first component
			act(() => {
				result.current.handleAddNewComponent(new Event('test'));
			});
			expect(result.current.pageJSON.components.length).toBe(1);
			
			// Add second component
			act(() => {
				result.current.handleAddNewComponent(new Event('test'));
			});
			expect(result.current.pageJSON.components.length).toBe(2);
			
			const firstPath = result.current.pageJSON.components[0]?.path;
			const secondPath = result.current.pageJSON.components[1]?.path;
			
			// Move second up
			act(() => {
				result.current.handleMoveUp('root[1]');
			});
			
			// Verify move happened (paths should be swapped)
			expect(result.current.pageJSON.components[0]?.path).toBe(secondPath);
			expect(result.current.pageJSON.components[1]?.path).toBe(firstPath);
		});

		it('should not move up if already first', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			act(() => {
				result.current.handleAddNewComponent(new Event('test'));
			});
			
			const originalPath = result.current.pageJSON.components[0]?.path;
			
			// Try to move first component up
			act(() => {
				result.current.handleMoveUp('0');
			});
			
			// Should remain unchanged
			expect(result.current.pageJSON.components[0]?.path).toBe(originalPath);
			expect(result.current.pageJSON.components.length).toBe(1);
		});

		it('should handle moving component down', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			// Add two components
			act(() => {
				result.current.handleAddNewComponent(new Event('test'));
				result.current.handleAddNewComponent(new Event('test'));
			});
			
			const firstPath = result.current.pageJSON.components[0]?.path;
			const secondPath = result.current.pageJSON.components[1]?.path;
			
			// Move first down
			act(() => {
				result.current.handleMoveDown('root[0]');
			});
			
			// Verify move happened (paths should be swapped)
			expect(result.current.pageJSON.components[0]?.path).toBe(secondPath);
			expect(result.current.pageJSON.components[1]?.path).toBe(firstPath);
		});

		it('should not move down if already last', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			act(() => {
				result.current.handleAddNewComponent(new Event('test'));
			});
			expect(result.current.pageJSON.components.length).toBe(1);
			
			act(() => {
				result.current.handleAddNewComponent(new Event('test'));
			});
			expect(result.current.pageJSON.components.length).toBe(2);
			
			const secondPath = result.current.pageJSON.components[1]?.path;
			
			// Try to move last component down
			act(() => {
				result.current.handleMoveDown('root[1]');
			});
			
			// Should remain as last
			expect(result.current.pageJSON.components[1]?.path).toBe(secondPath);
			expect(result.current.pageJSON.components.length).toBe(2);
		});
	});

	describe('State Management', () => {
		it('should return all expected properties', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			expect(result.current).toHaveProperty('pageJSON');
			expect(result.current).toHaveProperty('editableComponent');
			expect(result.current).toHaveProperty('selectedPath');
			expect(result.current).toHaveProperty('editMode');
			expect(result.current).toHaveProperty('setPageJSON');
			expect(result.current).toHaveProperty('setEditableComponent');
			expect(result.current).toHaveProperty('setSelectedPath');
			expect(result.current).toHaveProperty('setEditMode');
			expect(result.current).toHaveProperty('handleAddNewComponent');
			expect(result.current).toHaveProperty('handleSelectComponent');
			expect(result.current).toHaveProperty('handleEditComponent');
			expect(result.current).toHaveProperty('clearSelection');
			expect(result.current).toHaveProperty('cancelEdit');
			expect(result.current).toHaveProperty('handleDeleteComponent');
			expect(result.current).toHaveProperty('handleMoveUp');
			expect(result.current).toHaveProperty('handleMoveDown');
		});

		it('should handle multiple operations in sequence', () => {
			const { result } = renderHook(() => usePageBuilder());
			
			act(() => {
				result.current.handleAddNewComponent(new Event('test'));
			});
			
			act(() => {
				result.current.handleAddNewComponent(new Event('test'));
			});
			
			act(() => {
				result.current.handleAddNewComponent(new Event('test'));
			});
			expect(result.current.pageJSON.components.length).toBe(3);
			
			act(() => {
				// Move around
				result.current.handleMoveUp('root[2]');
				result.current.handleMoveDown('root[1]');
			});
			expect(result.current.pageJSON.components.length).toBe(3);
			
			act(() => {
				// Delete one
				result.current.handleDeleteComponent('root[1]');
			});
			expect(result.current.pageJSON.components.length).toBe(2);
		});
	});
});
