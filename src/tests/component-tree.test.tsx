import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { ComponentTree } from "../components/sitebuilder/page/components/ComponentTree";

describe('ComponentTree', () => {
	const mockOnSelectComponent = vi.fn();
	const mockOnEditComponent = vi.fn();
	const mockOnDeleteComponent = vi.fn();
	const mockOnMoveUp = vi.fn();
	const mockOnMoveDown = vi.fn();

	const mockComponents = [
		{
			component: 'Callout',
			props: { title: 'Test Callout' },
			children: []
		},
		{
			component: 'Page Section',
			props: { items: [] },
			children: [
				{
					component: 'Callout',
					props: { title: 'Child Callout' },
					children: []
				}
			]
		}
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should render component tree with correct component names', () => {
		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
			/>
		);

		expect(screen.getByText('Page Section')).toBeInTheDocument();
		expect(screen.getAllByText('Callout')).toHaveLength(2); // Parent and child
	});

	it('should show layout indicator for layout components', () => {
		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
			/>
		);

		// Page Section should have layout indicator - check that the text contains the emoji
		const pageSectionContainer = screen.getByText('Page Section').parentElement;
		expect(pageSectionContainer?.textContent).toContain('📦');
	});

	it('should highlight selected component', () => {
		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
				selectedPath="root[0]"
			/>
		);

		// First component should be selected (green background)
		const calloutElements = screen.getAllByText('Callout');
		const selectedElement = calloutElements[0].parentElement?.parentElement; // Get the styled div
		expect(selectedElement).toHaveStyle({ background: 'rgb(76, 175, 80)' }); // #4CAF50 in rgb
	});

	it('should highlight editing component', () => {
		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
				editPath="root[1]"
			/>
		);

		// Second component should be in edit mode (orange background)
		const pageSectionElement = screen.getByText('Page Section').parentElement?.parentElement;
		expect(pageSectionElement).toHaveStyle({ background: 'rgb(255, 167, 38)' }); // #FFA726 in rgb
	});

	it('should call onEditComponent when edit button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
			/>
		);

		const editButton = screen.getAllByTitle('Edit properties')[0];
		await user.click(editButton);

		expect(mockOnEditComponent).toHaveBeenCalledWith(mockComponents[0], 'root[0]');
	});

	it('should call onDeleteComponent when delete button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
			/>
		);

		const deleteButton = screen.getAllByTitle('Delete component')[0];
		await user.click(deleteButton);

		expect(mockOnDeleteComponent).toHaveBeenCalledWith('root[0]');
	});

	it('should call onMoveUp when up button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
			/>
		);

		const moveUpButton = screen.getAllByTitle('Move up')[0];
		await user.click(moveUpButton);

		expect(mockOnMoveUp).toHaveBeenCalledWith('root[0]');
	});

	it('should call onMoveDown when down button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
			/>
		);

		const moveDownButton = screen.getAllByTitle('Move down')[0];
		await user.click(moveDownButton);

		expect(mockOnMoveDown).toHaveBeenCalledWith('root[0]');
	});

	it('should show child button for layout components', () => {
		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
			/>
		);

		// Accordion (layout component) should have child button
		expect(screen.getByTitle('Add child component')).toBeInTheDocument();
	});

	it('should call onSelectComponent when child button is clicked', async () => {
		const user = userEvent.setup();

		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
			/>
		);

		const childButton = screen.getByTitle('Add child component');
		await user.click(childButton);

		expect(mockOnSelectComponent).toHaveBeenCalledWith(mockComponents[1], 'root[1]');
	});

	it('should render nested children correctly', () => {
		render(
			<ComponentTree
				components={mockComponents}
				onSelectComponent={mockOnSelectComponent}
				onEditComponent={mockOnEditComponent}
				onDeleteComponent={mockOnDeleteComponent}
				onMoveUp={mockOnMoveUp}
				onMoveDown={mockOnMoveDown}
			/>
		);

		// Should show child component indented
		const calloutElements = screen.getAllByText('Callout');
		const childElement = calloutElements[1].parentElement?.parentElement?.parentElement; // Get the indented container
		expect(childElement).toHaveStyle({ marginLeft: '20px' });
	});
});