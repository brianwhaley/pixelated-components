import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { SaveLoadSection } from "../components/sitebuilder/page/components/SaveLoadSection";
import { buildUrl } from '../components/foundation/urlbuilder';

// Mock smartFetch
vi.mock('../components/foundation/smartfetch', () => ({
	smartFetch: vi.fn()
}));

const { smartFetch } = await import('../components/foundation/smartfetch');

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
		vi.mocked(smartFetch).mockResolvedValueOnce({ success: true, pages: ['page1', 'page2'] });

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
			/>
		);

		await waitFor(() => {
			expect(smartFetch).toHaveBeenCalledWith('/api/pagebuilder/list');
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

		vi.mocked(smartFetch)
			.mockResolvedValueOnce({ success: true, pages: [] })
			.mockResolvedValueOnce({ success: true, message: 'Page saved successfully' });

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
			expect(smartFetch).toHaveBeenCalledWith('/api/pagebuilder/save', {
				requestInit: {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name: 'test-page', data: mockPageData })
				}
			});
		});

		expect(screen.getByText('✓ Page saved successfully')).toBeInTheDocument();
	});

	it('should show error message on save failure', async () => {
		const user = userEvent.setup();

		vi.mocked(smartFetch)
			.mockResolvedValueOnce({ success: true, pages: [] })
			.mockResolvedValueOnce({ success: false, message: 'Save failed' });

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

		vi.mocked(smartFetch).mockResolvedValueOnce({ success: true, pages: ['page1', 'page2'] });

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

		vi.mocked(smartFetch).mockResolvedValueOnce({ success: true, pages: [] });

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

		vi.mocked(smartFetch)
			.mockResolvedValueOnce({ success: true, pages: ['test-page'] })
			.mockResolvedValueOnce({ success: true, data: loadedData });

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

		vi.mocked(smartFetch)
			.mockResolvedValueOnce({ success: true, pages: ['test-page'] })
			.mockResolvedValueOnce({ success: true, message: 'Page deleted successfully' });

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
			expect(smartFetch).toHaveBeenCalledWith('/api/pagebuilder/delete?name=test-page', {
				requestInit: {
					method: 'DELETE'
				}
			});
		});

		expect(screen.getByText('✓ Page deleted successfully')).toBeInTheDocument();

		confirmSpy.mockRestore();
	});

	it('should not delete page when confirmation is cancelled', async () => {
		const user = userEvent.setup();

		// Mock window.confirm to return false
		const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

		vi.mocked(smartFetch).mockResolvedValueOnce({ success: true, pages: ['test-page'] });

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
		expect(smartFetch).toHaveBeenCalledTimes(1); // Only the initial list fetch

		confirmSpy.mockRestore();
	});

	it('should use custom API endpoint', async () => {
		const customEndpoint = '/custom/api';

		vi.mocked(smartFetch).mockResolvedValueOnce({
			success: true,
			pages: []
		});

		render(
			<SaveLoadSection
				pageData={mockPageData}
				onLoad={mockOnLoad}
				apiEndpoint={customEndpoint}
			/>
		);

		await waitFor(() => {
			expect(smartFetch).toHaveBeenCalledWith(`${customEndpoint}/list`);
		});
	});

	it('should disable buttons during loading', async () => {
		const user = userEvent.setup();

		// Mock a slow save operation
		vi.mocked(smartFetch)
			.mockResolvedValueOnce({ success: true, pages: [] })
			.mockImplementationOnce(() => new Promise(resolve =>
				setTimeout(() => resolve({ success: true, message: 'Saved' }), 100)
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

	describe('buildUrl URL Construction', () => {
		describe('Load page URL building', () => {
			it('should construct load URL with pathSegments and params (Section 1)', () => {
				const apiEndpoint = '/api/pagebuilder';
				const pageName = 'my-landing-page';

				const loadUrl = buildUrl({
					baseUrl: apiEndpoint,
					pathSegments: ['load'],
					params: { name: pageName }
				});

				expect(loadUrl).toBe('/api/pagebuilder/load?name=my-landing-page');
			});

			it('should properly encode page name with special characters', () => {
				const apiEndpoint = '/api/pagebuilder';
				const pageName = 'my page & stuff';

				const loadUrl = buildUrl({
					baseUrl: apiEndpoint,
					pathSegments: ['load'],
					params: { name: pageName }
				});

				expect(loadUrl).toContain('load');
				expect(loadUrl).toContain('name=');
				expect(loadUrl).not.toContain('&'); // & should be encoded
			});

			it('should handle different API endpoints', () => {
				const endpoints = ['/api/pagebuilder', '/custom/pages', 'https://api.example.com/pages'];
				
				endpoints.forEach(endpoint => {
					const loadUrl = buildUrl({
						baseUrl: endpoint,
						pathSegments: ['load'],
						params: { name: 'test' }
					});

					expect(loadUrl).toContain(endpoint);
					expect(loadUrl).toContain('load');
					expect(loadUrl).toContain('name=test');
				});
			});
		});

		describe('Delete page URL building', () => {
			it('should construct delete URL with pathSegments and params (Section 2)', () => {
				const apiEndpoint = '/api/pagebuilder';
				const pageName = 'test-page';

				const deleteUrl = buildUrl({
					baseUrl: apiEndpoint,
					pathSegments: ['delete'],
					params: { name: pageName }
				});

				expect(deleteUrl).toBe('/api/pagebuilder/delete?name=test-page');
			});

			it('should match load URL structure except path segment', () => {
				const apiEndpoint = '/api/pagebuilder';
				const pageName = 'my-page';

				const loadUrl = buildUrl({
					baseUrl: apiEndpoint,
					pathSegments: ['load'],
					params: { name: pageName }
				});

				const deleteUrl = buildUrl({
					baseUrl: apiEndpoint,
					pathSegments: ['delete'],
					params: { name: pageName }
				});

				// Both should use same base and params, just different path segment
				expect(loadUrl).toContain(apiEndpoint);
				expect(deleteUrl).toContain(apiEndpoint);
				expect(loadUrl).toContain(`name=${pageName}`);
				expect(deleteUrl).toContain(`name=${pageName}`);
				expect(loadUrl).toContain('load');
				expect(deleteUrl).toContain('delete');
			});
		});

		describe('List pages URL building', () => {
			it('should construct list URL correctly', () => {
				const apiEndpoint = '/api/pagebuilder';

				const listUrl = buildUrl({
					baseUrl: apiEndpoint,
					pathSegments: ['list']
				});

				expect(listUrl).toBe('/api/pagebuilder/list');
			});
		});
	});
});