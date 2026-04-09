
import React, { useEffect, useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
// import { FormEngine } from '../../form/pixelated.form';
import { componentMap /* , componentTypes */ } from '../lib/componentMap';
import { generateFieldJSON } from '../lib/componentGeneration';

/**
 * ComponentSelector - Two-phase component selection
 * Phase 1: Select component type
 * Phase 2: Auto-generate property form based on PropTypes
 */

/**
 * ComponentSelector — Select a component type (or edit an existing one) and generate an editable component schema.
 *
 * @param {function} [props.setEditableComponent] - Callback that receives a generated component JSON schema for editing.
 * @param {string} [props.parentPath] - Optional path where a new child component should be inserted.
 * @param {shape} [props.editMode] - Optional edit mode info { component, props } to pre-populate the selector for editing.
 */
ComponentSelector.propTypes = {
/** Callback to set the editable component schema */
	setEditableComponent: PropTypes.func.isRequired,
	/** Optional parent path where children will be added */
	parentPath: PropTypes.string,
	/** Optional object used to pre-populate the selector when editing an existing component */
	editMode: PropTypes.shape({
		component: PropTypes.string,
		props: PropTypes.object
	}),
};
export type ComponentSelectorType = InferProps<typeof ComponentSelector.propTypes>;
export function ComponentSelector(props: ComponentSelectorType) {
	const { setEditableComponent, parentPath, editMode } = props;
	const [lastEditMode, setLastEditMode] = useState<string>('');
	const [selectedValue, setSelectedValue] = useState<string>('');
	
	// If in edit mode, auto-generate form on mount
	useEffect(() => {
		if (editMode && editMode.component) {
			// Create a stable key to track if this is a new edit mode
			const editKey = `${editMode.component}-${JSON.stringify(editMode.props)}`;
			if (editKey !== lastEditMode) {
				const componentJSON = generateFieldJSON(
					editMode.component, 
					editMode.props, 
					parentPath || undefined
				);
				setEditableComponent(componentJSON);
				setLastEditMode(editKey);
				setSelectedValue(editMode.component);
			}
		} else if (lastEditMode !== '') {
			// Reset when exiting edit mode
			setLastEditMode('');
			setSelectedValue('');
		}
	}, [editMode, lastEditMode, setEditableComponent, parentPath]);

	function handleComponentChange(event: React.ChangeEvent<HTMLSelectElement>) {
		const selectedComponent = event.target.value;
		setSelectedValue(selectedComponent);
		if (selectedComponent) {
			const componentJSON = generateFieldJSON(selectedComponent, undefined, parentPath || undefined);
			setEditableComponent(componentJSON);
		}
	}

	const componentOptions = Object.keys(componentMap).map((name: string) => ({
		value: name,
		text: name
	}));

	return (
		<div>
			{parentPath && (
				<div style={{
					background: '#e3f2fd',
					border: '1px solid #2196F3',
					borderRadius: '4px',
					padding: '0.75rem',
					marginBottom: '1rem',
					color: '#0d47a1'
				}}>
					<strong><span role="img" aria-label="add">➕</span> Adding child component</strong>
					<div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
						Select a component type to add as a child
					</div>
				</div>
			)}
			<label htmlFor="component-type-selector" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
				Component Type:
			</label>
			{  }
			<select 
				id="component-type-selector"
				onChange={handleComponentChange}
				value={selectedValue}
				style={{
					marginBottom: '1rem',
					fontSize: '1rem',
					border: '1px solid #ccc',
					borderRadius: '4px'
				}}
			>
				<option value="" disabled>Select a component...</option>
				{componentOptions.map(option => (
					<option key={option.value} value={option.value}>
						{option.text}
					</option>
				))}
			</select>
		</div>
	);
}
