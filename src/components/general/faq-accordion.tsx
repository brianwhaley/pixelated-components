import React, { useState, useMemo } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { Accordion, AccordionItem } from '../general/accordion';
import './faq-accordion.css';

type CategoryKey = 'Getting Started' | 'Process & Timeline' | 'Technical Details' | 'Content & Management' | 'Support & Maintenance' | 'Ownership & Legal' | 'Services' | '';

const categoryIcons: Record<CategoryKey, string> = {
	'Getting Started': '🚀',
	'Process & Timeline': '⏱️',
	'Technical Details': '⚙️',
	'Content & Management': '📝',
	'Support & Maintenance': '🛠️',
	'Ownership & Legal': '📋',
	'Services': '💼',
	'': ''
};

/**
 * FAQAccordion — list of frequently asked questions rendered as an accordion with search and expand controls.
 *
 * @param {shape} [props.faqsData] - Object containing FAQ data; expected to include a `mainEntity` array of question objects.
 * @param {arrayOf} [props.mainEntity] - Array of FAQ objects each with `name`, `category`, and `acceptedAnswer`.
 * @param {string} [props.name] - Question title text.
 * @param {string} [props.category] - Category/section for the FAQ (used for grouping and icons).
 * @param {shape} [props.acceptedAnswer] - Object with an answer, typically containing `text` as string or array of strings.
 * @param {oneOfType} [props.text] - Answer text or an array of paragraphs.
 */
FAQAccordion.propTypes = {
	/** FAQ data wrapper object; should contain mainEntity array. */
	faqsData: PropTypes.shape({
		/** Array of FAQ objects to render as accordion items. */
		mainEntity: PropTypes.arrayOf(
			PropTypes.shape({
				/** Question text/title. */
				name: PropTypes.string,
				/** Category key for grouping or icons. */
				category: PropTypes.string,
				/** Accepted answer object with text or list of paragraphs. */
				acceptedAnswer: PropTypes.shape({
					text: PropTypes.oneOfType([
						PropTypes.string,
						PropTypes.arrayOf(PropTypes.string)
					]),
				}),
			})
		),
	}).isRequired,
};
export type FAQAccordionType = InferProps<typeof FAQAccordion.propTypes>;
export function FAQAccordion({ faqsData }: FAQAccordionType) {
	const [searchTerm, setSearchTerm] = useState('');
	const [expandedStates, setExpandedStates] = useState<boolean[]>(
		faqsData.mainEntity?.map(() => false) || []
	);

	const filteredFaqs = useMemo(() => {
		if (!faqsData.mainEntity) return [];
		if (!searchTerm) return faqsData.mainEntity;
		return faqsData.mainEntity.filter((faq: any) => {
			const answerText = Array.isArray(faq.acceptedAnswer.text) 
				? faq.acceptedAnswer.text.join(' ') 
				: faq.acceptedAnswer.text;
			return faq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				answerText.toLowerCase().includes(searchTerm.toLowerCase());
		});
	}, [faqsData.mainEntity, searchTerm]);

	const expandAll = () => {
		setExpandedStates(expandedStates.map(() => true));
	};

	const collapseAll = () => {
		setExpandedStates(expandedStates.map(() => false));
	};

	const handleToggle = (index: number, open: boolean) => {
		setExpandedStates(prev => prev.map((state, i) => i === index ? open : state));
	};

	// Transform FAQ data to Accordion format
	const accordionItems: AccordionItem[] = filteredFaqs.map((faq: any, index: number) => {
		const content: React.ReactNode = Array.isArray(faq.acceptedAnswer.text) ? (
			<div>
				{faq.acceptedAnswer.text.map((paragraph: string, pIndex: number) => (
					<p key={pIndex} dangerouslySetInnerHTML={{ __html: paragraph }} />
				))}
			</div>
		) : (
			<div dangerouslySetInnerHTML={{ __html: faq.acceptedAnswer.text }} />
		);
		return {
			/* title: `${categoryIcons[faq.category as CategoryKey] || '❓'} ${faq.name}`, */
			title: `${categoryIcons[faq.category as CategoryKey] || ''} ${faq.name}`,
			content,
			open: expandedStates[index] || undefined
		};
	});

	return (
		<div className="faq-container" role="region" aria-label="Frequently Asked Questions">
			<div className="faq-toolbar">
				<div className="search-box">
					<input
						type="text"
						placeholder="Search FAQs..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="search-input"
						aria-describedby="search-help"
					/>
					<div id="search-help" className="sr-only">Search through frequently asked questions by typing keywords</div>
				</div>
				<div className="expand-buttons">
					<button
						onClick={expandAll}
						className="expand-button expand-all"
						aria-label="Expand all FAQ answers"
						title="Expand all answers"
					>
						+
					</button>
					<button
						onClick={collapseAll}
						className="expand-button collapse-all"
						aria-label="Collapse all FAQ answers"
						title="Collapse all answers"
					>
						−
					</button>
				</div>
			</div>
			<div className="faq-list" aria-live="polite" aria-atomic="false">
				<Accordion items={accordionItems} onToggle={handleToggle} />
			</div>
		</div>
	);
}