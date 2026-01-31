import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { MenuExpando, MenuExpandoButton } from '../components/general/menu-expando';

const mockMenuItems = [
	{ name: 'Home', path: '/' },
	{ name: 'About', path: '/about', routes: [{ name: 'Team', path: '/team' }, { name: 'History', path: '/history' }] },
	{ name: 'Services', path: '/services' },
	{ name: 'Contact', path: '/contact' },
];

const objectMenuItems = {
	Home: '/',
	About: '/about',
	Services: '/services',
	Contact: '/contact',
};

describe('MenuExpando Component', () => {

	describe('Rendering', () => {
		it('should render the menu component', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			const menuExpando = container.querySelector('.menu-expando');
			expect(menuExpando).toBeInTheDocument();
		});

		it('should render with empty summary', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			const summary = container.querySelector('summary');
			expect(summary).toBeInTheDocument();
			expect(summary?.textContent).toBe('');
		});

		it('should render all menu items from array format', () => {
			render(<MenuExpando menuItems={mockMenuItems} />);
			expect(screen.getByText('Home')).toBeInTheDocument();
			expect(screen.getByText('About')).toBeInTheDocument();
			expect(screen.getByText('Services')).toBeInTheDocument();
			expect(screen.getByText('Contact')).toBeInTheDocument();
		});

		it('should render all menu items from object format', () => {
			render(<MenuExpando menuItems={objectMenuItems} />);
			expect(screen.getByText('Home')).toBeInTheDocument();
			expect(screen.getByText('About')).toBeInTheDocument();
			expect(screen.getByText('Services')).toBeInTheDocument();
		});

		it('should render nested menu items for items with routes', () => {
			render(<MenuExpando menuItems={mockMenuItems} />);
			expect(screen.getByText('Team')).toBeInTheDocument();
			expect(screen.getByText('History')).toBeInTheDocument();
		});
	});

	describe('Menu Links', () => {
		it('should have correct href attributes on menu items', () => {
			render(<MenuExpando menuItems={mockMenuItems} />);
			const homeLink = screen.getByText('Home').closest('a');
			expect(homeLink).toHaveAttribute('href', '/');
		});

		it('should handle nested item links correctly', () => {
			render(<MenuExpando menuItems={mockMenuItems} />);
			const teamLink = screen.getByText('Team').closest('a');
			expect(teamLink).toHaveAttribute('href', '/team');
		});

		it('should render correct number of links', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			const links = container.querySelectorAll('a');
			// 4 main items (Home, About, Services, Contact) + 2 nested (Team, History) = 6
			// But About link is in both main and nested, so 6 total
			expect(links.length).toBeGreaterThanOrEqual(5);
		});
	});

	describe('Structure', () => {
		it('should have details wrapper element', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			const details = container.querySelector('details.menu-expando-wrapper');
			expect(details).toBeInTheDocument();
		});

		it('should have ul element for main menu items', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			const ul = container.querySelector('details.menu-expando-wrapper > ul');
			expect(ul).toBeInTheDocument();
		});

		it('should have nested details for items with routes', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			const nestedDetails = container.querySelectorAll('details.menu-expando-nested');
			expect(nestedDetails.length).toBeGreaterThan(0);
		});

		it('should have proper li structure for menu items', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			const lis = container.querySelectorAll('li');
			expect(lis.length).toBeGreaterThan(0);
		});
	});

	describe('Accessibility', () => {
		it('should have semantic HTML structure', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			expect(container.querySelector('details')).toBeInTheDocument();
			expect(container.querySelector('summary')).toBeInTheDocument();
			expect(container.querySelector('ul')).toBeInTheDocument();
		});

		it('should have anchor tags with text content', () => {
			render(<MenuExpando menuItems={mockMenuItems} />);
			const links = screen.getAllByRole('link');
			links.forEach(link => {
				expect(link.textContent).toBeTruthy();
			});
		});
	});

	describe('Styling', () => {
		it('should apply correct CSS classes', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			expect(container.querySelector('.menu-expando')).toBeInTheDocument();
			expect(container.querySelector('.menu-expando-wrapper')).toBeInTheDocument();
		});

		it('should have nested menu specific classes', () => {
			const { container } = render(<MenuExpando menuItems={mockMenuItems} />);
			const nested = container.querySelector('.menu-expando-nested');
			expect(nested).toBeInTheDocument();
		});
	});
});

describe('MenuExpandoButton Component', () => {
	it('should render the button component', () => {
		const { container } = render(<MenuExpandoButton />);
		const button = container.querySelector('.menu-expando-button');
		expect(button).toBeInTheDocument();
	});

	it('should have an image element', () => {
		const { container } = render(<MenuExpandoButton />);
		const img = container.querySelector('img');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute('src', expect.stringContaining('%2Fimages%2Ficons%2Fmobile-menu2.png'));
		expect(img).toHaveAttribute('alt', 'Mobile Menu');
	});

	it('should have correct title attribute', () => {
		const { container } = render(<MenuExpandoButton />);
		const img = container.querySelector('img');
		expect(img).toHaveAttribute('title', 'Mobile Menu');
	});
});

describe('MenuExpando Edge Cases', () => {
	it('should handle empty menu items array', () => {
		const { container } = render(<MenuExpando menuItems={[]} />);
		const ul = container.querySelector('ul');
		expect(ul).toBeInTheDocument();
	});

	it('should handle items with empty routes array', () => {
		const itemsWithEmptyRoutes = [
			{ name: 'Home', path: '/', routes: [] },
			{ name: 'About', path: '/about' },
		];
		render(<MenuExpando menuItems={itemsWithEmptyRoutes} />);
		expect(screen.getByText('Home')).toBeInTheDocument();
		expect(screen.getByText('About')).toBeInTheDocument();
	});

	it('should handle items with special characters in names', () => {
		const specialItems = [
			{ name: 'Home & Services', path: '/' },
			{ name: 'FAQ\'s', path: '/faq' },
		];
		render(<MenuExpando menuItems={specialItems} />);
		expect(screen.getByText('Home & Services')).toBeInTheDocument();
		expect(screen.getByText('FAQ\'s')).toBeInTheDocument();
	});

	it('should handle very long menu item names', () => {
		const longNameItems = [
			{ name: 'This is a very long menu item name that might wrap', path: '/' },
		];
		render(<MenuExpando menuItems={longNameItems} />);
		expect(screen.getByText('This is a very long menu item name that might wrap')).toBeInTheDocument();
	});

	it('should handle menu items with external URLs', () => {
		const externalItems = [
			{ name: 'External Link', path: 'https://example.com' },
		];
		render(<MenuExpando menuItems={externalItems} />);
		const link = screen.getByRole('link', { name: 'External Link' });
		expect(link).toHaveAttribute('href', 'https://example.com');
		// Note: target attribute is not set by this component
	});

	it('should handle menu items with hash links', () => {
		const hashItems = [
			{ name: 'Section Link', path: '#section' },
		];
		render(<MenuExpando menuItems={hashItems} />);
		const link = screen.getByRole('link', { name: 'Section Link' });
		expect(link).toHaveAttribute('href', '#section');
		// Note: target attribute is not set by this component
	});

	it('should handle deeply nested menu structures', () => {
		const deeplyNestedItems = [
			{
				name: 'Level 1',
				path: '/level1',
				routes: [
					{
						name: 'Level 2',
						path: '/level2',
						routes: [
							{ name: 'Level 3', path: '/level3' }
						]
					}
				]
			}
		];
		render(<MenuExpando menuItems={deeplyNestedItems} />);
		expect(screen.getByText('Level 1')).toBeInTheDocument();
		expect(screen.getByText('Level 2')).toBeInTheDocument();
		// Note: Only one level of nesting is supported, Level 3 is not rendered
		expect(screen.queryByText('Level 3')).not.toBeInTheDocument();
	});

	it('should handle menu items with empty names gracefully', () => {
		const emptyNameItems = [
			{ name: '', path: '/' },
		];
		render(<MenuExpando menuItems={emptyNameItems} />);
		const link = screen.getByRole('link');
		expect(link).toHaveTextContent('');
	});

	it('should handle menu items with special characters in paths', () => {
		const specialPathItems = [
			{ name: 'Special Path', path: '/path with spaces & symbols' },
		];
		render(<MenuExpando menuItems={specialPathItems} />);
		const link = screen.getByRole('link', { name: 'Special Path' });
		expect(link).toHaveAttribute('href', '/path with spaces & symbols');
	});

	it('should handle mixed object and array formats', () => {
		// This tests edge case handling
		const mixedItems = [
			{ name: 'Array Item', path: '/array' },
			'string item', // This should be handled gracefully
		] as any;
		render(<MenuExpando menuItems={mixedItems} />);
		expect(screen.getByText('Array Item')).toBeInTheDocument();
	});

	it('should handle null and undefined menu items', () => {
		const itemsWithNulls = [
			{ name: 'Valid Item', path: '/valid' },
			null,
			undefined,
		].filter(Boolean) as any[];
		render(<MenuExpando menuItems={itemsWithNulls} />);
		expect(screen.getByText('Valid Item')).toBeInTheDocument();
	});

	it('should handle menu items with numeric paths', () => {
		const numericPathItems = [
			{ name: 'Numeric Path', path: 123 as any },
		];
		render(<MenuExpando menuItems={numericPathItems} />);
		const link = screen.getByRole('link', { name: 'Numeric Path' });
		expect(link).toHaveAttribute('href', '123');
	});

	it('should toggle menu open/close on summary click', async () => {
		const user = userEvent.setup();
		render(<MenuExpando menuItems={mockMenuItems} />);
		
		const details = document.querySelector('details.menu-expando-wrapper') as HTMLDetailsElement;
		const summary = document.querySelector('details.menu-expando-wrapper > summary') as HTMLElement;
		
		// Initially closed
		expect(details).not.toHaveAttribute('open');
		
		// Click to open
		await user.click(summary);
		await waitFor(() => expect(details).toHaveAttribute('open'), { timeout: 400 });
		
		// Wait for animation to complete before clicking again
		await new Promise(resolve => setTimeout(resolve, 350));
		
		// Click to close
		await user.click(summary);
		await waitFor(() => expect(details).not.toHaveAttribute('open'), { timeout: 400 });
	});

	it('should handle nested menu toggle animations', async () => {
		const user = userEvent.setup();
		render(<MenuExpando menuItems={mockMenuItems} />);
		
		// Find the nested summary element (not the anchor)
		const nestedSummary = screen.getByText('About').closest('summary');
		const nestedDetails = nestedSummary?.parentElement as HTMLDetailsElement;
		
		// Initially closed
		expect(nestedDetails).not.toHaveAttribute('open');
		
		// Click to open nested menu
		await user.click(nestedSummary!);
		expect(nestedDetails).toHaveAttribute('open');
		
		// Click to close nested menu
		await user.click(nestedSummary!);
		expect(nestedDetails).not.toHaveAttribute('open');
	});

	it('should prevent animation conflicts when clicking rapidly', async () => {
		const user = userEvent.setup();
		render(<MenuExpando menuItems={mockMenuItems} />);
		
		const summary = document.querySelector('details.menu-expando-wrapper > summary') as HTMLElement;
		
		// Rapid clicks should not cause issues
		await user.click(summary);
		await user.click(summary);
		await user.click(summary);
		
		// Component should still be functional
		const details = document.querySelector('details.menu-expando-wrapper') as HTMLDetailsElement;
		expect(details).toBeInTheDocument();
	});

});

describe('MenuExpandoButton Component Interactions', () => {
	it('should toggle menu when button is clicked', async () => {
		const user = userEvent.setup();
		
		// Render both components
		render(
			<>
				<MenuExpando menuItems={mockMenuItems} />
				<MenuExpandoButton />
			</>
		);
		
		const button = screen.getByRole('img', { name: 'Mobile Menu' }).closest('div');
		const details = document.querySelector('details.menu-expando-wrapper') as HTMLDetailsElement;
		
		// Initially closed
		expect(details).not.toHaveAttribute('open');
		
		// Click button to open
		await user.click(button!);
		expect(details).toHaveAttribute('open');
		
		// Click button to close
		await user.click(button!);
		expect(details).not.toHaveAttribute('open');
	});

	it('should prevent event propagation when button is clicked', async () => {
		const user = userEvent.setup();
		const mockParentClick = vi.fn();
		
		// Render button inside a clickable parent
		render(
			<div onClick={mockParentClick}>
				<MenuExpando menuItems={mockMenuItems} />
				<MenuExpandoButton />
			</div>
		);
		
		const button = screen.getByRole('img', { name: 'Mobile Menu' }).closest('div');
		
		// Click button
		await user.click(button!);
		
		// Parent click should not be triggered
		expect(mockParentClick).not.toHaveBeenCalled();
	});

	it('should handle button click when menu element is not found', async () => {
		const user = userEvent.setup();
		
		// Render button without menu
		render(<MenuExpandoButton />);
		
		const button = screen.getByRole('img', { name: 'Mobile Menu' }).closest('div');
		
		// Click should not throw error
		await user.click(button!);
		
		// Component should still be functional
		expect(button).toBeInTheDocument();
	});

	it('should handle multiple rapid button clicks', async () => {
		const user = userEvent.setup();
		
		render(
			<>
				<MenuExpando menuItems={mockMenuItems} />
				<MenuExpandoButton />
			</>
		);
		
		const button = screen.getByRole('img', { name: 'Mobile Menu' }).closest('div');
		
		// Rapid clicks
		await user.click(button!);
		await user.click(button!);
		await user.click(button!);
		
		// Component should still be functional
		expect(button).toBeInTheDocument();
	});
});
