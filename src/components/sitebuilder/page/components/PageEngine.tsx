
import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { generateKey } from '../../../general/utilities';
import { componentMap, layoutComponents } from '../lib/componentMap';
import './pagebuilder.scss';

/**
 * PageEngine - Renders components with optional inline editing
 * When editMode is true, shows borders, hover effects, and action buttons
 * When editMode is false (default), renders clean components without edit UI
 */

PageEngine.propTypes = {
	pageData: PropTypes.shape({
		components: PropTypes.arrayOf(
			PropTypes.shape({
				component: PropTypes.string.isRequired,
				props: PropTypes.object.isRequired,
				children: PropTypes.array,
			})
		).isRequired,
	}).isRequired,
	editMode: PropTypes.bool,
	selectedPath: PropTypes.string,
	onEditComponent: PropTypes.func,
	onSelectComponent: PropTypes.func,
	onDeleteComponent: PropTypes.func,
	onMoveUp: PropTypes.func,
	onMoveDown: PropTypes.func,
};
export type PageEngineType = InferProps<typeof PageEngine.propTypes>;
export function PageEngine(props: PageEngineType) {
	const { editMode = false, selectedPath, onEditComponent, onSelectComponent, onDeleteComponent, onMoveUp, onMoveDown } = props;
	
	// Recursive function to render components with children
	function renderComponent(componentData: any, index: number, path: string = 'root'): React.JSX.Element {
		const componentName: string = componentData.component;
		const componentProps: any = { ...componentData.props };
		delete componentProps.type;
		
		const componentType = (componentMap as Record<string, React.ElementType>)[componentName];
		const currentPath = `${path}[${index}]`;
		const isLayout = layoutComponents.includes(componentName);
		
		if (!componentType) {
			return <div key={index}>Unknown component: {componentName}</div>;
		}
		
		// If component has children, recursively render them
		let children = null;
		if (componentData.children && componentData.children.length > 0) {
			children = componentData.children.map((child: any, childIndex: number) => 
				renderComponent(child, childIndex, `${currentPath}.children`)
			);
		}
		
		componentProps.key = generateKey();
		
		const element = children 
			? React.createElement(componentType, componentProps, children)
			: React.createElement(componentType, componentProps);
		
		// If not in edit mode, return element directly without wrapper
		if (!editMode) {
			return <React.Fragment key={`fragment-${index}`}>{element}</React.Fragment>;
		}
		
		// Edit mode: Wrap with hover effect and action buttons
		const isSelected = selectedPath === currentPath;
		
		const handleMouseEnter = (currentTarget: HTMLDivElement, event: React.SyntheticEvent<HTMLDivElement>) => {
			if (event.target === event.currentTarget || !currentTarget.querySelector('.pagebuilder-component-wrapper:hover')) {
				document.querySelectorAll('.pagebuilder-component-wrapper.hover-active').forEach(el => {
					el.classList.remove('hover-active');
				});
				currentTarget.classList.add('hover-active');
			}
			event.stopPropagation();
		};

		const handleMouseLeave = (currentTarget: HTMLDivElement, event: React.SyntheticEvent<HTMLDivElement>) => {
			const relatedTarget = ((event as React.MouseEvent<HTMLDivElement>).relatedTarget || (event as React.FocusEvent<HTMLDivElement>).relatedTarget) as HTMLElement | null;
			if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
				currentTarget.classList.remove('hover-active');
			}
		};
		
		return (
			<div 
				key={`wrapper-${index}`} 
				className={`pagebuilder-component-wrapper ${isSelected ? 'selected' : ''}`}
				onMouseOver={(e) => {
					handleMouseEnter(e.currentTarget, e);
				}}
				onMouseOut={(e) => {
					handleMouseLeave(e.currentTarget, e as React.MouseEvent<HTMLDivElement>);
				}}
				onFocus={(e) => {
					handleMouseEnter(e.currentTarget, e);
				}}
				onBlur={(e) => {
					handleMouseLeave(e.currentTarget, e as React.FocusEvent<HTMLDivElement>);
				}}
			>
				{element}
				{/* Floating Action Menu */}
				<div className="pagebuilder-actions">
					<div className="move-buttons">
						<button
							className="move-btn move-up"
							onClick={(e) => {
								e.stopPropagation();
								onMoveUp?.(currentPath);
							}}
							title="Move up"
						>
							▲
						</button>
						<button
							className="move-btn move-down"
							onClick={(e) => {
								e.stopPropagation();
								onMoveDown?.(currentPath);
							}}
							title="Move down"
						>
							▼
						</button>
					</div>
					<button
						className="edit-btn"
						onClick={(e) => {
							e.stopPropagation();
							onEditComponent?.(componentData, currentPath);
						}}
						title="Edit properties"
					>
						✏️
					</button>
					{isLayout && (
						<button
							className="child-btn"
							onClick={(e) => {
								e.stopPropagation();
								onSelectComponent?.(componentData, currentPath);
							}}
							title="Add child component"
						>
							➕
						</button>
					)}
					<button
						className="delete-btn"
						onClick={(e) => {
							e.stopPropagation();
							onDeleteComponent?.(currentPath);
						}}
						title="Delete component"
					>
						🗑️
					</button>
				</div>
			</div>
		);
	}

	const components: React.JSX.Element[] = [];
	const pageComponents = props?.pageData?.components;
	
	if (pageComponents) {
		pageComponents.forEach((component, index) => {
			components.push(renderComponent(component, index));
		});
	}
	
	return <>{components}</>;
}
