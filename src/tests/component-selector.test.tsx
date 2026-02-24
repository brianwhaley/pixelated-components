import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { ComponentSelector } from "../components/sitebuilder/page/components/ComponentSelector";

describe('ComponentSelector', () => {
	const mockSetEditableComponent = vi.fn();

	beforeEach(() => {
		mockSetEditableComponent.mockClear();
	});

	it('should render component type selector', () => {
		render(
			<ComponentSelector
				setEditableComponent={mockSetEditableComponent}
			/>
		);

		expect(screen.getByLabelText('Component Type:')).toBeInTheDocument();
		expect(screen.getByRole('combobox')).toBeInTheDocument();
		expect(screen.getByText('Select a component...')).toBeInTheDocument();
	});

	it('should show child component banner when parentPath is provided', () => {
		render(
			<ComponentSelector
				setEditableComponent={mockSetEditableComponent}
				parentPath="root[0]"
			/>
		);

		expect(
			screen.getByText(content => content.includes('Adding child component'))
		).toBeInTheDocument();
		expect(screen.getByText('Select a component type to add as a child')).toBeInTheDocument();
	});

	it('should call setEditableComponent when component is selected', async () => {
		const user = userEvent.setup();

		render(
			<ComponentSelector
				setEditableComponent={mockSetEditableComponent}
			/>
		);

		const select = screen.getByRole('combobox');
		await user.selectOptions(select, 'Callout'); // Assuming Callout is in componentMap

		expect(mockSetEditableComponent).toHaveBeenCalled();
	});

	it('should handle editMode prop correctly', () => {
		const editMode = {
			component: 'Callout',
			props: { title: 'Test' }
		};

		render(
			<ComponentSelector
				setEditableComponent={mockSetEditableComponent}
				editMode={editMode}
			/>
		);

		expect(mockSetEditableComponent).toHaveBeenCalled();
	});

	it('should reset when editMode changes from defined to null', () => {
		const { rerender } = render(
			<ComponentSelector
				setEditableComponent={mockSetEditableComponent}
				editMode={{ component: 'Callout', props: {} }}
			/>
		);

		// Should have called setEditableComponent initially
		expect(mockSetEditableComponent).toHaveBeenCalledTimes(1);

		// Reset mock and rerender with null editMode
		mockSetEditableComponent.mockClear();
		rerender(
			<ComponentSelector
				setEditableComponent={mockSetEditableComponent}
				editMode={null}
			/>
		);

		// Should not call again since we're resetting
		expect(mockSetEditableComponent).not.toHaveBeenCalled();
	});
});