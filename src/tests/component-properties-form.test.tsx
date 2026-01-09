import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { ComponentPropertiesForm } from "../components/sitebuilder/page/components/ComponentPropertiesForm";

describe('ComponentPropertiesForm', () => {
	it('should render placeholder text when no editableComponent is provided', () => {
		render(
			<ComponentPropertiesForm
				editableComponent={undefined}
				onSubmit={() => {}}
			/>
		);

		expect(screen.getByText('Select a component type above to configure its properties.')).toBeInTheDocument();
	});

	it('should render placeholder text when editableComponent has no fields', () => {
		render(
			<ComponentPropertiesForm
				editableComponent={{ component: 'TestComponent' }}
				onSubmit={() => {}}
			/>
		);

		expect(screen.getByText('Select a component type above to configure its properties.')).toBeInTheDocument();
	});

	it('should render FormEngine when editableComponent has fields', () => {
		const mockComponent = {
			component: 'TestComponent',
			fields: [
				{
					component: 'FormInput',
					name: 'title',
					label: 'Title',
					props: {
						type: 'text',
						placeholder: 'Enter title'
					}
				}
			]
		};

		render(
			<ComponentPropertiesForm
				editableComponent={mockComponent}
				onSubmit={() => {}}
			/>
		);

		// FormEngine should be rendered (we can check for form elements)
		expect(screen.getByRole('form')).toBeInTheDocument();
	});

	it('should call onSubmit when form is submitted', async () => {
		const mockOnSubmit = vi.fn();
		const mockComponent = {
			component: 'TestComponent',
			fields: [
				{
					component: 'FormInput',
					name: 'title',
					label: 'Title',
					props: {
						type: 'text',
						placeholder: 'Enter title'
					}
				},
				{
					component: 'FormButton',
					name: 'submit',
					props: {
						type: 'submit',
						text: 'Save'
					}
				}
			]
		};

		const user = userEvent.setup();
		render(
			<ComponentPropertiesForm
				editableComponent={mockComponent}
				onSubmit={mockOnSubmit}
			/>
		);

		// Find and click the submit button
		const submitButton = screen.getByRole('button', { name: /save/i });
		await user.click(submitButton);

		expect(mockOnSubmit).toHaveBeenCalled();
	});
});