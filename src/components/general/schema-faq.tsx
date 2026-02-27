import React from 'react';

interface SchemaFAQProps {
  faqsData: any;
}

// normalizeFaqs turns a JSON-LD FAQPage payload into a form where each
// question has a single `acceptedAnswer.text` string.  Some of our data
// sources (WordPress, CMS exports) allow multiple answer fragments; we
// merge them here so the final JSON remains valid for search engines.
function normalizeFaqs(data: any): any {
	if (!data || typeof data !== 'object') return data;
	const faqs = JSON.parse(JSON.stringify(data));
	if (Array.isArray(faqs.mainEntity)) {
		faqs.mainEntity.forEach((entry: any) => {
			if (entry && entry.acceptedAnswer) {
				const ans = entry.acceptedAnswer;
				if (ans && Array.isArray(ans.text)) {
					ans.text = ans.text.join(' ');
				}
			}
		});
	}
	return faqs;
}

export function SchemaFAQ({ faqsData }: SchemaFAQProps) {
	const normalized = normalizeFaqs(faqsData);
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(normalized),
			}}
		/>
	);
}