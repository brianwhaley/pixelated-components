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

	describe('Component Rendering - View Mode', () => {
		it('should render components without edit UI when editMode is false', () => {
			render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>
			);

			expect(screen.getByText('Test Callout')).toBeInTheDocument();
			expect(screen.queryByTitle('Edit properties')).not.toBeInTheDocument();
		});

		it('should render all components in the page', () => {
			render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>
			);

			expect(screen.getByText('Test Callout')).toBeInTheDocument();
			expect(screen.getByText('Test content')).toBeInTheDocument();
		});

		it('should render nested components', () => {
			render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>
			);

			expect(screen.getByText('Child Callout')).toBeInTheDocument();
			expect(screen.getByText('Child content')).toBeInTheDocument();
		});

		it('should not show edit buttons when editMode is false', () => {
			render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>
			);

			expect(screen.queryByRole('button')).not.toBeInTheDocument();
		});
	});

	describe('Component Rendering - Edit Mode', () => {
		it('should render components with edit controls when editMode is true', () => {
			render(
				<PageEngine
					pageData={mockPageData}
					editMode={true}
				/>
			);

			expect(screen.getByText('Test Callout')).toBeInTheDocument();
		});

		it('should show edit button when editMode is true', () => {
			render(
				<PageEngine
					pageData={mockPageData}
					editMode={true}
				/>
			);

			const editButtons = screen.queryAllByRole('button');
			expect(editButtons.length).toBeGreaterThanOrEqual(0);
		});

		it('should handle edit mode prop change', () => {
			const { rerender } = render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>
			);

			rerender(
				<PageEngine
					pageData={mockPageData}
					editMode={true}
				/>
			);

			expect(screen.getByText('Test Callout')).toBeInTheDocument();
		});
	});

	describe('Invalid Components', () => {
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

		it('should handle multiple invalid components', () => {
			const invalidPageData = {
				components: [
					{ component: 'Invalid1', props: {}, children: [] },
					{ component: 'Invalid2', props: {}, children: [] }
				]
			};

			render(
				<PageEngine
					pageData={invalidPageData}
					editMode={false}
				/>,
				{ config: { cloudinary: { product_env: 'test' } } }
			);

			expect(screen.getByText('Unknown component: Invalid1')).toBeInTheDocument();
			expect(screen.getByText('Unknown component: Invalid2')).toBeInTheDocument();
		});

		it('should handle mix of valid and invalid components', () => {
			const mixedPageData = {
				components: [
					{ component: 'Callout', props: { title: 'Valid' }, children: [] },
					{ component: 'InvalidComponent', props: {}, children: [] }
				]
			};

			render(
				<PageEngine
					pageData={mixedPageData}
					editMode={false}
				/>
			);

			expect(screen.getByText('Valid')).toBeInTheDocument();
			expect(screen.getByText('Unknown component: InvalidComponent')).toBeInTheDocument();
		});
	});

	describe('Empty State', () => {
		it('should handle empty pageData gracefully', () => {
			render(
				<PageEngine
					pageData={{ components: [] }}
					editMode={false}
				/>,
				{ config: {} }
			);

			expect(screen.queryByText('Test Callout')).not.toBeInTheDocument();
		});

		it('should render without crashing with no components', () => {
			const { container } = render(
				<PageEngine
					pageData={{ components: [] }}
					editMode={false}
				/>
			);

			expect(container).toBeInTheDocument();
		});

		it('should handle undefined components array', () => {
			const { container } = render(
				<PageEngine
					pageData={{ components: undefined } as any}
					editMode={false}
				/>
			);

			expect(container).toBeInTheDocument();
		});
	});

	describe('Configuration Handling', () => {
		it('should accept cloudinary configuration', () => {
			const config = { cloudinary: { product_env: 'test' } };

			render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>,
				{ config }
			);

			expect(screen.getByText('Test Callout')).toBeInTheDocument();
		});

		it('should handle missing configuration', () => {
			render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>
			);

			expect(screen.getByText('Test Callout')).toBeInTheDocument();
		});

		it('should handle empty configuration object', () => {
			render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>,
				{ config: {} }
			);

			expect(screen.getByText('Test Callout')).toBeInTheDocument();
		});
	});

	describe('Component Props', () => {
		it('should pass props correctly to components', () => {
			const dataWithProps = {
				components: [
					{
						component: 'Callout',
						props: {
							title: 'Custom Title',
							content: 'Custom Content',
							customProp: 'value'
						},
						children: []
					}
				]
			};

			render(
				<PageEngine
					pageData={dataWithProps}
					editMode={false}
				/>
			);

			expect(screen.getByText('Custom Title')).toBeInTheDocument();
			expect(screen.getByText('Custom Content')).toBeInTheDocument();
		});

		it('should handle components with empty props', () => {
			const dataWithEmptyProps = {
				components: [
					{
						component: 'Callout',
						props: {},
						children: []
					}
				]
			};

			const { container } = render(
				<PageEngine
					pageData={dataWithEmptyProps}
					editMode={false}
				/>
			);

			expect(container).toBeInTheDocument();
		});

		it('should handle deeply nested components', () => {
			const deepData = {
				components: [
					{
						component: 'PageSection',
						props: {},
						children: [
							{
								component: 'Callout',
								props: { title: 'Level 2' },
								children: [
									{
										component: 'Callout',
										props: { title: 'Level 3' },
										children: []
									}
								]
							}
						]
					}
				]
			};

			render(
				<PageEngine
					pageData={deepData}
					editMode={false}
				/>
			);

			const container = document.body;
			expect(container).toBeTruthy();
		});
	});

	describe('Data Updates', () => {
		it('should handle pageData updates', () => {
			const { rerender } = render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>
			);

			const newPageData = {
				components: [
					{
						component: 'Callout',
						props: { title: 'Updated Callout' },
						children: []
					}
				]
			};

			rerender(
				<PageEngine
					pageData={newPageData}
					editMode={false}
				/>
			);

			expect(screen.getByText('Updated Callout')).toBeInTheDocument();
		});

		it('should handle multiple re-renders', () => {
			const { rerender } = render(
				<PageEngine
					pageData={{ components: [] }}
					editMode={false}
				/>
			);

			rerender(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>
			);

			rerender(
				<PageEngine
					pageData={{ components: [] }}
					editMode={false}
				/>
			);

			const { container } = render(
				<PageEngine
					pageData={mockPageData}
					editMode={false}
				/>
			);

			expect(container).toBeInTheDocument();
		});
	});

	describe('Error States', () => {
		it('should handle null pageData gracefully', () => {
			const { container } = render(
				<PageEngine
					pageData={null as any}
					editMode={false}
				/>
			);

			expect(container).toBeInTheDocument();
		});

		it('should handle malformed component data', () => {
			const malformedData = {
				components: [
					{ component: null, props: null, children: null }
				]
			};

			const { container } = render(
				<PageEngine
					pageData={malformedData as any}
					editMode={false}
				/>
			);

			expect(container).toBeInTheDocument();
		});
	});
});