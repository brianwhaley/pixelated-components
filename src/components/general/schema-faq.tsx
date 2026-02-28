'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';

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

/**
 * SchemaFAQ — Inject a JSON-LD <script> tag containing an FAQPage schema object.
 *
 * @param {object} [props.faqsData] - Structured JSON-LD object representing an FAQ page (FAQPage schema).
 */
SchemaFAQ.propTypes = {
	/** Structured FAQPage JSON-LD object */
	faqsData: PropTypes.object.isRequired,
};
export type SchemaFAQType = InferProps<typeof SchemaFAQ.propTypes>;
export function SchemaFAQ({ faqsData }: SchemaFAQType) {
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