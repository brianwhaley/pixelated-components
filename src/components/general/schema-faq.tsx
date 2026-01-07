import React from 'react';

interface SchemaFAQProps {
  faqsData: any;
}

export function SchemaFAQ({ faqsData }: SchemaFAQProps) {
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(faqsData),
			}}
		/>
	);
}