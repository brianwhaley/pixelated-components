import React from 'react';
import { FormEngine } from '@/components/sitebuilder/form/formengine';
import data from '@/data/form.json';
import '@/css/pixelated.global.css';

function onSubmit(){
	alert("Hooray!  Submitted!");
}

export default {
	title: 'SiteBuilder/Form',
	component: FormEngine,
};

export const Form_Engine = {
	args: {
		formData: data,
		onSubmitHandler: onSubmit
	}
};
