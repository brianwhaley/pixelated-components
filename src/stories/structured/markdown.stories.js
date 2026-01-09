import React from 'react';
import { Markdown } from '@/components/general/markdown';
import markdowndata from '@/data/readme.md';
import '@/css/pixelated.global.css';

export default {
	title: 'Structured',
	component: Markdown,
};

export const ReadMeMarkdown = {
	args: {
		markdowndata
	}
};
