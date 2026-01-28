
import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { layoutComponents } from '../lib/componentMap';

/**
 * ComponentTree - Displays hierarchical tree of components
 * Shows Edit and Child buttons for each component
 */

/**
 * ComponentTree — Render a hierarchical tree of page components with edit, move, and delete controls.
 *
 * @param {array} [props.components] - Array of component objects that form the page tree.
 * @param {function} [props.onSelectComponent] - Callback when a component is selected for adding children.
 * @param {function} [props.onEditComponent] - Callback when the edit action is triggered for a component.
 * @param {function} [props.onDeleteComponent] - Callback to remove a component from the tree.
 * @param {function} [props.onMoveUp] - Move the component up within its parent's children array.
 * @param {function} [props.onMoveDown] - Move the component down within its parent's children array.
 * @param {string} [props.selectedPath] - Currently selected component path string.
 * @param {string} [props.editPath] - Path of the component currently in edit mode.
 */
ComponentTree.propTypes = {
/** Components forming the tree */
	components: PropTypes.array.isRequired,
	/** Select callback for child insertion */
	onSelectComponent: PropTypes.func.isRequired,
	/** Edit callback for component properties */
	onEditComponent: PropTypes.func.isRequired,
	/** Delete callback */
	onDeleteComponent: PropTypes.func.isRequired,
	/** Move-up callback */
	onMoveUp: PropTypes.func.isRequired,
	/** Move-down callback */
	onMoveDown: PropTypes.func.isRequired,
	/** Currently selected component path */
	selectedPath: PropTypes.string,
	/** Component path currently being edited */
	editPath: PropTypes.string,
};
export type ComponentTreeType = InferProps<typeof ComponentTree.propTypes>;
export function ComponentTree({ 
	components, 
	onSelectComponent, 
	onEditComponent, 
	onDeleteComponent,
	onMoveUp,
	onMoveDown,
	selectedPath, 
	editPath 
}: ComponentTreeType) {
	function renderTreeNode(component: any, index: number, path: string) {
		const isLayout = layoutComponents.includes(component.component);
		const currentPath = `${path}[${index}]`;
		const isSelected = currentPath === selectedPath;
		const isEditing = currentPath === editPath;
		const hasChildren = component.children && component.children.length > 0;
		
		return (
			<div key={currentPath} style={{ marginLeft: path === 'root' ? 0 : '20px' }}>
				<div 
					style={{
						padding: '0.5rem',
						margin: '0.25rem 0',
						background: isEditing ? '#FFA726' : isSelected ? '#4CAF50' : isLayout ? '#e3f2fd' : '#f5f5f5',
						color: isEditing || isSelected ? 'white' : 'black',
						borderRadius: '4px',
						border: isLayout ? '2px solid #2196F3' : '1px solid #ddd',
						display: 'flex',
						alignItems: 'center',
						gap: '0.5rem',
					}}
				>
					<div style={{ flex: 1 }}>
						<strong>{component.component}</strong>
						{hasChildren && ` (${component.children.length} children)`}
						{isLayout && ' 📦'}
					</div>
					<div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onMoveUp(currentPath);
								}}
								style={{
									padding: '2px 6px',
									background: '#757575',
									color: 'white',
									border: 'none',
									borderRadius: '2px',
									cursor: 'pointer',
									fontSize: '0.65rem',
									lineHeight: '1',
								}}
								title="Move up"
							>
								▲
							</button>
							<button
								onClick={(e) => {
									e.stopPropagation();
									onMoveDown(currentPath);
								}}
								style={{
									padding: '2px 6px',
									background: '#757575',
									color: 'white',
									border: 'none',
									borderRadius: '2px',
									cursor: 'pointer',
									fontSize: '0.65rem',
									lineHeight: '1',
								}}
								title="Move down"
							>
								▼
							</button>
						</div>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onEditComponent(component, currentPath);
							}}
							style={{
								padding: '0.25rem 0.5rem',
								background: '#2196F3',
								color: 'white',
								border: 'none',
								borderRadius: '3px',
								cursor: 'pointer',
								fontSize: '0.75rem',
							}}
							title="Edit properties"
						>
							✏️ Edit
						</button>
						{isLayout && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									onSelectComponent(component, currentPath);
								}}
								style={{
									padding: '0.25rem 0.5rem',
									background: '#4CAF50',
									color: 'white',
									border: 'none',
									borderRadius: '3px',
									cursor: 'pointer',
									fontSize: '0.75rem',
								}}
								title="Add child component"
							>
								➕ Child
							</button>
						)}
						<button
							onClick={(e) => {
								e.stopPropagation();
								onDeleteComponent(currentPath);
							}}
							style={{
								padding: '0.25rem 0.5rem',
								background: '#f44336',
								color: 'white',
								border: 'none',
								borderRadius: '3px',
								cursor: 'pointer',
								fontSize: '0.75rem',
							}}
							title="Delete component"
						>
							🗑️ Delete
						</button>
					</div>
				</div>
				
				{hasChildren && (
					<div>
						{component.children.map((child: any, childIndex: number) => 
							renderTreeNode(child, childIndex, `${currentPath}.children`)
						)}
					</div>
				)}
			</div>
		);
	}
	
	return (
		<div>
			{components.map((component, index) => 
				renderTreeNode(component, index, 'root')
			)}
		</div>
	);
}
