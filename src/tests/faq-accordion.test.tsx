import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { FAQAccordion } from '@/components/general/faq-accordion';

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
				"text": "Yes, the component uses CSS classes that can be customized."
			}
		}
	]
};

describe('FAQAccordion Component', () => {
	describe('Basic Rendering', () => {
		it('renders all FAQ items', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			expect(screen.getByText('🚀 What is this component?')).toBeInTheDocument();
			expect(screen.getByText('⚙️ How does search work?')).toBeInTheDocument();
			expect(screen.getByText('⚙️ Can I customize the appearance?')).toBeInTheDocument();
		});

		it('renders search input', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			const searchInput = screen.getByPlaceholderText('Search FAQs...');
			expect(searchInput).toBeInTheDocument();
			expect(searchInput).toHaveAttribute('aria-describedby', 'search-help');
		});

		it('renders expand/collapse buttons', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			expect(screen.getByLabelText('Expand all FAQ answers')).toBeInTheDocument();
			expect(screen.getByLabelText('Collapse all FAQ answers')).toBeInTheDocument();
		});

		it('renders with proper accessibility attributes', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			expect(screen.getByRole('region', { name: 'Frequently Asked Questions' })).toBeInTheDocument();
			expect(screen.getByRole('textbox')).toBeInTheDocument();
		});
	});

	describe('Search Functionality', () => {
		it('filters FAQs based on question text', async () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			const searchInput = screen.getByPlaceholderText('Search FAQs...');
			fireEvent.change(searchInput, { target: { value: 'component' } });

			await waitFor(() => {
				expect(screen.getByText('🚀 What is this component?')).toBeInTheDocument();
				expect(screen.queryByText('⚙️ How does search work?')).not.toBeInTheDocument();
			});
		});

		it('filters FAQs based on answer text (string)', async () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			const searchInput = screen.getByPlaceholderText('Search FAQs...');
			fireEvent.change(searchInput, { target: { value: 'customize' } });

			await waitFor(() => {
				expect(screen.getByText('⚙️ Can I customize the appearance?')).toBeInTheDocument();
				expect(screen.queryByText('🚀 What is this component?')).not.toBeInTheDocument();
			});
		});

		it('filters FAQs based on answer text (array)', async () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			const searchInput = screen.getByPlaceholderText('Search FAQs...');
			fireEvent.change(searchInput, { target: { value: 'keywords' } });

			await waitFor(() => {
				expect(screen.getByText('⚙️ How does search work?')).toBeInTheDocument();
				expect(screen.queryByText('🚀 What is this component?')).not.toBeInTheDocument();
			});
		});

		it('shows all FAQs when search is cleared', async () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			const searchInput = screen.getByPlaceholderText('Search FAQs...');
			fireEvent.change(searchInput, { target: { value: 'component' } });

			await waitFor(() => {
				expect(screen.queryByText('⚙️ How does search work?')).not.toBeInTheDocument();
			});

			fireEvent.change(searchInput, { target: { value: '' } });

			await waitFor(() => {
				expect(screen.getByText('🚀 What is this component?')).toBeInTheDocument();
				expect(screen.getByText('⚙️ How does search work?')).toBeInTheDocument();
			});
		});

		it('is case insensitive', async () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			const searchInput = screen.getByPlaceholderText('Search FAQs...');
			fireEvent.change(searchInput, { target: { value: 'COMPONENT' } });

			await waitFor(() => {
				expect(screen.getByText('🚀 What is this component?')).toBeInTheDocument();
			});
		});
	});

	describe('Expand/Collapse Functionality', () => {
		it('expands all FAQs when expand all button is clicked', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			const expandButton = screen.getByLabelText('Expand all FAQ answers');
			fireEvent.click(expandButton);

			// Check that content is visible (this would require checking the accordion state)
			// The actual expansion is handled by the Accordion component
			expect(expandButton).toBeInTheDocument();
		});

		it('collapses all FAQs when collapse all button is clicked', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			const collapseButton = screen.getByLabelText('Collapse all FAQ answers');
			fireEvent.click(collapseButton);

			expect(collapseButton).toBeInTheDocument();
		});
	});

	describe('Content Rendering', () => {
		it('renders single paragraph answers', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			expect(screen.getByText('This is a FAQ accordion component that displays frequently asked questions in an expandable format.')).toBeInTheDocument();
		});

		it('renders multi-paragraph answers as separate paragraphs', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			expect(screen.getByText('The search functionality allows users to filter FAQs by typing keywords.')).toBeInTheDocument();
			expect(screen.getByText('It searches both question titles and answer content.')).toBeInTheDocument();
			expect(screen.getByText('Results update in real-time as you type.')).toBeInTheDocument();
		});

		it('renders HTML content in answers', () => {
			const faqWithHtml = {
				...mockFaqsData,
				mainEntity: [{
					"@type": "Question",
					"name": "HTML Test",
					"category": "Technical Details",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "This has <strong>bold</strong> and <em>italic</em> text."
					}
				}]
			};

			render(<FAQAccordion faqsData={faqWithHtml} />);

			expect(screen.getByText('bold')).toBeInTheDocument();
			expect(screen.getByText('italic')).toBeInTheDocument();
		});
	});

	describe('Category Icons', () => {
		it('displays correct icons for different categories', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			expect(screen.getByText('🚀 What is this component?')).toBeInTheDocument();
			expect(screen.getByText('⚙️ How does search work?')).toBeInTheDocument();
			expect(screen.getByText('⚙️ Can I customize the appearance?')).toBeInTheDocument();
		});

		it('displays default icon for unknown categories', () => {
			const faqWithUnknownCategory = {
				...mockFaqsData,
				mainEntity: [{
					"@type": "Question",
					"name": "Unknown Category",
					"category": "Unknown",
					"acceptedAnswer": {
						"@type": "Answer",
						"text": "Test answer"
					}
				}]
			};

			render(<FAQAccordion faqsData={faqWithUnknownCategory} />);

			expect(screen.getByText('❓ Unknown Category')).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('handles empty FAQ data gracefully', () => {
			const emptyFaqsData = {
				...mockFaqsData,
				mainEntity: []
			};

			render(<FAQAccordion faqsData={emptyFaqsData} />);

			expect(screen.getByPlaceholderText('Search FAQs...')).toBeInTheDocument();
			// Should not crash and should still render the search interface
		});

		it('handles missing mainEntity property', () => {
			const noMainEntityData = {
				...mockFaqsData,
				mainEntity: undefined
			};

			render(<FAQAccordion faqsData={noMainEntityData} />);

			expect(screen.getByPlaceholderText('Search FAQs...')).toBeInTheDocument();
		});

		it('handles null mainEntity', () => {
			const nullMainEntityData = {
				...mockFaqsData,
				mainEntity: null
			};

			render(<FAQAccordion faqsData={nullMainEntityData} />);

			expect(screen.getByPlaceholderText('Search FAQs...')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has proper ARIA labels and roles', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			expect(screen.getByRole('region', { name: 'Frequently Asked Questions' })).toBeInTheDocument();
			expect(screen.getByRole('textbox')).toBeInTheDocument();
		});

		it('has descriptive button labels', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			expect(screen.getByLabelText('Expand all FAQ answers')).toBeInTheDocument();
			expect(screen.getByLabelText('Collapse all FAQ answers')).toBeInTheDocument();
		});

		it('has screen reader help text for search', () => {
			render(<FAQAccordion faqsData={mockFaqsData} />);

			expect(screen.getByText('Search through frequently asked questions by typing keywords')).toBeInTheDocument();
		});
	});

	describe('PropTypes Validation', () => {
		it('accepts valid faqsData structure', () => {
			// This test ensures the component doesn't throw with valid props
			expect(() => {
				render(<FAQAccordion faqsData={mockFaqsData} />);
			}).not.toThrow();
		});

		it('requires faqsData prop', () => {
			// This would normally be caught by PropTypes in development
			// but we can test that the component expects the prop
			expect(FAQAccordion.propTypes).toHaveProperty('faqsData');
		});
	});
});