import React from 'react';
import { FAQAccordion } from '@/components/seo/faq-accordion';

const mockFaqsData = {
	"@context": "https://schema.org",
	"@type": "FAQPage",
	"name": "Test FAQs",
	"description": "Frequently asked questions for testing",
	"mainEntity": [
		{
			"@type": "Question",
			"name": "What is this component?",
			"category": "Getting Started",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "This is a FAQ accordion component that displays frequently asked questions in an expandable format."
			}
		},
		{
			"@type": "Question",
			"name": "How does search work?",
			"category": "Technical Details",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": [
					"The search functionality allows users to filter FAQs by typing keywords.",
					"It searches both question titles and answer content.",
					"Results update in real-time as you type."
				]
			}
		},
		{
			"@type": "Question",
			"name": "Can I customize the appearance?",
			"category": "Technical Details",
			"acceptedAnswer": {
				"@type": "Answer",
				"text": "Yes, the component uses CSS classes that can be customized. The accordion supports custom styling through the faq-accordion.css file."
			}
		}
	]
};

export default {
	title: 'SEO',
	component: FAQAccordion,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component: 'An interactive FAQ accordion component with search functionality, category icons, and accessibility features. Use the controls below to experiment with different configurations.'
			}
		}
	},
	argTypes: {
		faqsData: {
			description: 'FAQ data following schema.org FAQPage structure',
			control: { type: 'object' }
		}
	}
};

export const FAQ_Playground = {
	args: {
		faqsData: mockFaqsData
	},
	parameters: {
		controls: {
			expanded: true
		},
		docs: {
			description: {
				story: 'Interactive playground to test different FAQ configurations. Modify the faqsData object in the controls below to see how the component responds to different data structures, categories, and content formats.'
			}
		}
	}
};