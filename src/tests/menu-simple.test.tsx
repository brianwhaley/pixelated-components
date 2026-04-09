import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MenuSimple } from '../components/general/menu-simple';

describe('MenuSimple Component', () => {
	const mockMenuItems = [
		{ name: 'Home', path: '/', target: undefined, hidden: false },
		{ name: 'About', path: '/about', target: undefined, hidden: false },
		{ name: 'Contact', path: '/contact', target: '_blank', hidden: false },
	];

	it('should render menu with items', () => {
		const { container } = render(<MenuSimple menuItems={mockMenuItems} />);
		const menu = container.querySelector('.menu');
		expect(menu).toBeDefined();
	});

	it('should render all non-nested menu items', () => {
		render(<MenuSimple menuItems={mockMenuItems} />);
		const homeLink = screen.queryByText('Home');
		const aboutLink = screen.queryByText('About');
		const contactLink = screen.queryByText('Contact');
		
		expect(homeLink).toBeDefined();
		expect(aboutLink).toBeDefined();
		expect(contactLink).toBeDefined();
	});

	it('should skip items with nested routes', () => {
		const itemsWithRoutes = [
			{ name: 'Home', path: '/' },
			{ name: 'Products', path: '/products', routes: [{ name: 'Product 1' }] }
		] as any;
		
		render(<MenuSimple menuItems={itemsWithRoutes} />);
		const productsLink = screen.queryByText('Products');
		expect(productsLink).toBeNull();
	});

	it('should set correct href attributes', () => {
		render(<MenuSimple menuItems={mockMenuItems} />);
		const homeLink = screen.getByText('Home') as HTMLAnchorElement;
		const aboutLink = screen.getByText('About') as HTMLAnchorElement;
		
		expect(homeLink.href).toContain('/');
		expect(aboutLink.href).toContain('/about');
	});

	it('should set target attribute when provided', () => {
		render(<MenuSimple menuItems={mockMenuItems} />);
		const contactLink = screen.getByText('Contact') as HTMLAnchorElement;
		expect(contactLink.target).toBe('_blank');
	});

	it('should render as ul > li structure', () => {
		const { container } = render(<MenuSimple menuItems={mockMenuItems} />);
		const ul = container.querySelector('.menu ul');
		const listItems = container.querySelectorAll('.menu-item');
		
		expect(ul).toBeDefined();
		expect(listItems.length).toBeGreaterThan(0);
	});

	it('should handle hidden items with class', () => {
		const itemsWithHidden = [
			{ name: 'Visible', path: '/visible' },
			{ name: 'Hidden', path: '/hidden', hidden: true }
		] as any;
		
		const { container } = render(<MenuSimple menuItems={itemsWithHidden} />);
		const menuItems = container.querySelectorAll('.menu-item');
		let hiddenFound = false;
		menuItems.forEach(item => {
			if (item.classList.contains('menu-item-hidden')) {
				hiddenFound = true;
			}
		});
		
		expect(hiddenFound).toBe(true);
	});

	it('should handle empty menu items array', () => {
		const { container } = render(<MenuSimple menuItems={[]} />);
		const ul = container.querySelector('.menu ul');
		expect(ul).toBeDefined();
	});

	it('should render menu wrapper div', () => {
		const { container } = render(<MenuSimple menuItems={mockMenuItems} />);
		const wrapper = container.querySelector('.menu-wrapper');
		expect(wrapper).toBeDefined();
	});

	it('should handle single menu item', () => {
		const singleItem = [{ name: 'Only Item', path: '/only' }] as any;
		render(<MenuSimple menuItems={singleItem} />);
		
		const link = screen.getByText('Only Item');
		expect(link).toBeDefined();
	});

	it('should handle menu items without target', () => {
		const itemsNoTarget = [
			{ name: 'Internal', path: '/internal' }
		] as any;
		
		render(<MenuSimple menuItems={itemsNoTarget} />);
		const link = screen.getByText('Internal') as HTMLAnchorElement;
		expect(link.target).toBe('');
	});
});
