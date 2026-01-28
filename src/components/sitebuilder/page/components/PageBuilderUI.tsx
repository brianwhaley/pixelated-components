"use client";

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { PageSectionHeader } from '../../../general/semantic';
import { usePageBuilder } from '../lib/usePageBuilder';
import { ComponentSelector } from '../components/ComponentSelector';
import { ComponentPropertiesForm } from '../components/ComponentPropertiesForm';
import { PageEngine } from '../components/PageEngine';
import { SaveLoadSection } from '../components/SaveLoadSection';
import "../../../../css/pixelated.global.css";
import './pagebuilder.scss';


/**
 * PageBuilderUI - Main orchestrator component
 * Composes all sub-components and manages layout with inline editing
 */

/**
 * PageBuilderUI — Main page builder orchestration UI. Composes selection, properties editing, preview, and save/load.
 *
 * @param {string} [props.apiEndpoint] - API endpoint base used for saving and loading page JSON.
 */
PageBuilderUI.propTypes = {
/** API endpoint base for save/load operations (e.g., '/api/pagebuilder') */
	apiEndpoint: PropTypes.string,
};
export type PageBuilderUIType = InferProps<typeof PageBuilderUI.propTypes>;
export function PageBuilderUI({ apiEndpoint = '/api/pagebuilder' }: PageBuilderUIType) {
	const {
		pageJSON,
		setPageJSON,
		editableComponent,
		selectedPath,
		editMode,
		setEditableComponent,
		setSelectedPath,
		setEditMode,
		handleAddNewComponent,
		handleSelectComponent,
		handleEditComponent,
		cancelEdit,
		handleDeleteComponent,
		handleMoveUp,
		handleMoveDown,
	} = usePageBuilder();

	const [selectorKey, setSelectorKey] = React.useState(0);

	// Handle loading a saved page
	function handleLoadPage(data: any) {
		setPageJSON(data);
		setEditableComponent({});
		setSelectedPath('');
		setEditMode(null);
		setSelectorKey(prev => prev + 1);
	}

	// Wrap handleAddNewComponent to reset selector after adding
	function handleAddWithReset(component: any) {
		handleAddNewComponent(component);
		setSelectorKey(prev => prev + 1);
		setEditableComponent({});
	}

	return (
		<div className="row-2col" 
			style={{ gridTemplateColumns: "1fr 3fr", alignItems: "start" }}>
			{/* Left Column: Component Selection and Properties */}
			<div className="gridItem">
				<PageSectionHeader title="Component Editor" />
				<SaveLoadSection 
					pageData={pageJSON}
					onLoad={handleLoadPage}
					apiEndpoint={apiEndpoint}
				/>
				<ComponentSelector 
					key={selectorKey}
					setEditableComponent={setEditableComponent}
					parentPath={selectedPath || undefined}
					editMode={editMode ? { 
						component: editMode.component.component, 
						props: editMode.component.props 
					} : undefined}
				/>
				<br />
				<ComponentPropertiesForm 
					editableComponent={editableComponent}
					onSubmit={handleAddWithReset}
				/>
				
				{/* Action Buttons */}
				{editMode && (
					<div>
						<button 
							onClick={cancelEdit}
							type="button"
							className="button"
							style={{
								background: '#FFA726',
								color: 'white',
								transition: 'all 0.2s ease',
							}}
							onMouseEnter={(e) => e.currentTarget.style.background = '#FB8C00'}
							onMouseLeave={(e) => e.currentTarget.style.background = '#FFA726'}
						>
							Cancel Edit
						</button>
					</div>
				)}
			</div>

			{/* Right Column (Full Width): Live Preview with Inline Editing */}
			<div className="gridItem">
				<PageSectionHeader title="Page Preview" />
				<section id="preview-section">
					<div className="section-container">
						{pageJSON.components.length > 0 ? (
							<PageEngine 
								pageData={pageJSON}
								editMode={true}
								selectedPath={selectedPath}
								onEditComponent={handleEditComponent}
								onSelectComponent={handleSelectComponent}
								onDeleteComponent={handleDeleteComponent}
								onMoveUp={handleMoveUp}
								onMoveDown={handleMoveDown}
							/>
						) : (
							<p style={{ color: '#666', fontStyle: 'italic', padding: '2rem', textAlign: 'center' }}>
								No components yet. Start by selecting a component above and adding it to your page.
							</p>
						)}

						{/* Collapsible Page JSON */}
						<details style={{ marginTop: '1rem' }}>
							<summary style={{ cursor: 'pointer', userSelect: 'none' }}>
								<strong>Page JSON</strong>
							</summary>
							<pre style={{ 
								maxHeight: '400px', 
								overflow: 'auto',
								fontSize: '0.875rem',
								background: '#f5f5f5',
								padding: '1rem',
								borderRadius: '4px',
							}}>
								{JSON.stringify(pageJSON, null, 2)}
							</pre>
						</details>

					</div>
				</section>
			</div>
		</div>
	);
}
