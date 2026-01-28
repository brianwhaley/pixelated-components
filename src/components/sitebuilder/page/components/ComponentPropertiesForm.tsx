
import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
// import { PageSectionHeader } from '../../general/pixelated.headers';
import { FormEngine } from '../../form/formengine';

/**
 * ComponentPropertiesForm - Displays the component properties form
 * Shows FormEngine when component is selected, placeholder otherwise
 */

/**
 * ComponentPropertiesForm — Display and edit the selected component's properties using FormEngine.
 *
 * @param {object} [props.editableComponent] - JSON schema for the currently selected component (contains `fields`).
 * @param {function} [props.onSubmit] - Callback invoked when the edited component is saved; receives the component schema.
 */
ComponentPropertiesForm.propTypes = {
/** JSON schema for the currently selected component */
	editableComponent: PropTypes.object,
	/** Callback invoked when component properties are submitted */
	onSubmit: PropTypes.func.isRequired,
};
export type ComponentPropertiesFormType = InferProps<typeof ComponentPropertiesForm.propTypes>;
export function ComponentPropertiesForm({ editableComponent, onSubmit }: ComponentPropertiesFormType) {
	return (
		<>
			{ /* <PageSectionHeader title="Component Properties" /> */ }
			{editableComponent && (editableComponent as any).fields ? (
				<FormEngine 
					name="field_props" 
					id="field_props"
					onSubmitHandler={onSubmit}
					formData={editableComponent as any} 
				/>
			) : (
				<p style={{ color: '#666', fontStyle: 'italic', padding: '1rem' }}>
					Select a component type above to configure its properties.
				</p>
			)}
		</>
	);
}
