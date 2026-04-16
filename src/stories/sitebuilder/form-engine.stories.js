import React from 'react';
import { FormEngine } from '@/components/sitebuilder/form/formengine';
import data from '@/data/form.json';
import '@/css/pixelated.global.css';

/**
 * FormEngine with JSON-driven submission behavior
 * 
 * The form data includes a `properties` section that defines:
 * - name, id: Form identity
 * - toggleLoading, openModal, resetForm: Behavior flags
 * 
 * FormEngine automatically wraps itself in FormSubmitWrapper,
 * handling all submission lifecycle internally.
 */
function FormEngineWithJSONPropertiesStory() {
	return (
		<FormEngine 
			formData={data}
		/>
	);
}

export default {
	title: 'SiteBuilder/Form Engine',
	component: FormEngine,
};

export const FormEngineWithJSONProperties = {
	render: FormEngineWithJSONPropertiesStory,
};

