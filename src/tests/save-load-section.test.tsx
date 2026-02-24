import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { SaveLoadSection } from "../components/sitebuilder/page/components/SaveLoadSection";

// Mock fetch globally
global.fetch = vi.fn();

describe('SaveLoadSection', () => {
	const mockOnLoad = vi.fn();
	const mockPageData = {
		components: [
			{
				component: 'Callout',
				props: { title: 'Test' },
				children: []
			}
		]
	};

	beforeEach(() => {
		vi.clearAllMocks();
		// Reset fetch mock
		(global.fetch as any).mockClear();
	});

	it('should render save/load interface', () => {
		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		expect(screen.getByLabelText('Page Name:')).toBeInTheDocument();
		expect(screen.getByPlaceholderText('my-landing-page')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Save Page/ })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: /Load Page/ })).toBeInTheDocument();
	});

	it('should fetch saved pages on mount', async () => {
		(global.fetch as any).mockResolvedValueOnce({
			json: () => Promise.resolve({ success: true, pages: ['page1', 'page2'] })
		});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith('/api/pagebuilder/list');
		});
	});

	it('should disable save button when page name is empty', async () => {
		const user = userEvent.setup();

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		const saveButton = screen.getByRole('button', { name: /Save Page/ });
		expect(saveButton).toBeDisabled();
	});

	it('should save page successfully', async () => {
		const user = userEvent.setup();

		(global.fetch as any)
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: true, pages: [] })
			})
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: true, message: 'Page saved successfully' })
			});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		const nameInput = screen.getByPlaceholderText('my-landing-page');
		await user.type(nameInput, 'test-page');

		const saveButton = screen.getByRole('button', { name: /Save Page/ });
		await user.click(saveButton);

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith('/api/pagebuilder/save', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: 'test-page', data: mockPageData })
			});
		});

		expect(screen.getByText('✓ Page saved successfully')).toBeInTheDocument();
	});

	it('should show error message on save failure', async () => {
		const user = userEvent.setup();

		(global.fetch as any)
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: true, pages: [] })
			})
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: false, message: 'Save failed' })
			});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		const nameInput = screen.getByPlaceholderText('my-landing-page');
		await user.type(nameInput, 'test-page');

		const saveButton = screen.getByRole('button', { name: /Save Page/ });
		await user.click(saveButton);

		await waitFor(() => {
			expect(screen.getByText('✗ Save failed')).toBeInTheDocument();
		});
	});

	it('should toggle load page list', async () => {
		const user = userEvent.setup();

		(global.fetch as any).mockResolvedValueOnce({
			json: () => Promise.resolve({ success: true, pages: ['page1', 'page2'] })
		});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		const loadButton = screen.getByRole('button', { name: /Load Page/ });
		await user.click(loadButton);

		expect(screen.getByText('page1')).toBeInTheDocument();
		expect(screen.getByText('page2')).toBeInTheDocument();

		await user.click(loadButton);
		expect(screen.queryByText('page1')).not.toBeInTheDocument();
	});

	it('should show "No saved pages" when list is empty', async () => {
		const user = userEvent.setup();

		(global.fetch as any).mockResolvedValueOnce({
			json: () => Promise.resolve({ success: true, pages: [] })
		});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		const loadButton = screen.getByRole('button', { name: /Load Page/ });
		await user.click(loadButton);

		expect(screen.getByText('No saved pages')).toBeInTheDocument();
	});

	it('should load page successfully', async () => {
		const user = userEvent.setup();
		const loadedData = { components: [{ component: 'Callout', props: {}, children: [] }] };

		(global.fetch as any)
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: true, pages: ['test-page'] })
			})
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: true, data: loadedData })
			});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		const loadButton = screen.getByRole('button', { name: /Load Page/ });
		await user.click(loadButton);

		const pageButton = screen.getByText('test-page');
		await user.click(pageButton);

		await waitFor(() => {
			expect(mockOnLoad).toHaveBeenCalledWith(loadedData);
		});

		expect(screen.getByText('✓ Loaded "test-page"')).toBeInTheDocument();
	});

	it('should delete page after confirmation', async () => {
		const user = userEvent.setup();

		// Mock window.confirm
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

		(global.fetch as any)
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: true, pages: ['test-page'] })
			})
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: true, message: 'Page deleted successfully' })
			});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		const loadButton = screen.getByRole('button', { name: /Load Page/ });
		await user.click(loadButton);

		const deleteButton = screen.getByText('🗑️');
		await user.click(deleteButton);

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith('/api/pagebuilder/delete?name=test-page', {
				method: 'DELETE'
			});
		});

		expect(screen.getByText('✓ Page deleted successfully')).toBeInTheDocument();

		confirmSpy.mockRestore();
	});

	it('should not delete page when confirmation is cancelled', async () => {
		const user = userEvent.setup();

		// Mock window.confirm to return false
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

		(global.fetch as any).mockResolvedValueOnce({
			json: () => Promise.resolve({ success: true, pages: ['test-page'] })
		});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		const loadButton = screen.getByRole('button', { name: /Load Page/ });
		await user.click(loadButton);

		const deleteButton = screen.getByText('🗑️');
		await user.click(deleteButton);

		// Should not call delete API
		expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial list fetch

		confirmSpy.mockRestore();
	});

	it('should use custom API endpoint', async () => {
		const customEndpoint = '/custom/api';

		(global.fetch as any).mockResolvedValueOnce({
			json: () => Promise.resolve({ success: true, pages: [] })
		});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
				apiEndpoint={customEndpoint}
			/>
		);

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(`${customEndpoint}/list`);
		});
	});

	it('should disable buttons during loading', async () => {
		const user = userEvent.setup();

		// Mock a slow save operation
		(global.fetch as any)
			.mockResolvedValueOnce({
				json: () => Promise.resolve({ success: true, pages: [] })
			})
			.mockImplementationOnce(() => new Promise(resolve =>
				setTimeout(() => resolve({
					json: () => Promise.resolve({ success: true, message: 'Saved' })
				}), 100)
			));

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		const nameInput = screen.getByPlaceholderText('my-landing-page');
		await user.type(nameInput, 'test-page');

		const saveButton = screen.getByRole('button', { name: /Save Page/ });
		await user.click(saveButton);

		// Button should be disabled during save
		expect(saveButton).toBeDisabled();

		// Wait for save to complete
		await waitFor(() => {
			expect(screen.getByText('✓ Saved')).toBeInTheDocument();
		});

		expect(saveButton).not.toBeDisabled();
	});
});