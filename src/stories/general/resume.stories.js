import React from 'react';
import { Resume } from '@/components/general/resume';
import ResumeData from '@/data/resume.json';
import ReferencesData from '@/data/references.json';
import '@/css/pixelated.global.css';

ResumeData.items[0].properties.references = ReferencesData.items[0].properties.references;

export default {
	title: 'General',
	component: Resume,
};

export const Resume_BTW = {
	args: {
		data: { items: ResumeData.items }
	}
};

