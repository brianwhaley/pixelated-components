import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { PageEngine } from "../components/sitebuilder/page/components/PageEngine";

describe('PageEngine', () => {
	const mockOnEditComponent = vi.fn();
	const mockOnSelectComponent = vi.fn();
	const mockOnDeleteComponent = vi.fn();
	const mockOnMoveUp = vi.fn();
	const mockOnMoveDown = vi.fn();

	const mockPageData = {
		components: [
			{
				component: 'Callout',
				props: {
					title: 'Test Callout',
					content: 'Test content'
				},
				children: []
			},
			{
				component: 'Page Section',
				props: {
					items: []
				},
				children: [
					{
						component: 'Callout',
						props: {
							title: 'Child Callout',
							content: 'Child content'
						},
						children: []
					}
				]
			}
		]
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render components without edit UI when editMode is false', () => {
		render(
			<PageEngine
				pageData={mockPageData}
				editMode={false}
			/>
		);

		// Should render the components but no edit buttons
		expect(screen.getByText('Test Callout')).toBeInTheDocument();
		expect(screen.queryByTitle('Edit properties')).not.toBeInTheDocument();
	});

	it('should render unknown component message for invalid components', () => {
		const invalidPageData = {
			components: [
				{
					component: 'InvalidComponent',
					props: {},
					children: []
				}
			]
		};

		render(
			<PageEngine
				pageData={invalidPageData}
				editMode={false}
			/>,
			{ config: { cloudinary: { product_env: 'test' } } }
		);

		expect(screen.getByText('Unknown component: InvalidComponent')).toBeInTheDocument();
	});

	it('should handle empty pageData gracefully', () => {
		render(
			<PageEngine
				pageData={{ components: [] }}
				editMode={false}
			/>,
			{ config: {} }
		);

		// Should render nothing but not crash
		expect(screen.queryByText('Test Callout')).not.toBeInTheDocument();
	});
});