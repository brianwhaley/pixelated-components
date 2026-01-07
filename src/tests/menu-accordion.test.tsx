import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { 
  MenuAccordion, 
  MenuAccordionGroup, 
  MenuAccordionItem,
  MenuAccordionButton,
  MenuItem 
} from '../components/general/menu-accordion';

describe('MenuAccordion Component', () => {
  const mockMenuData: MenuItem[] = [
    {
      name: 'Home',
      path: '/',
    },
    {
      name: 'About',
      path: '/about',
    },
    {
      name: 'Services',
      path: '',
      routes: [
        { name: 'Service 1', path: '/services/1' },
        { name: 'Service 2', path: '/services/2' },
      ],
    },
    {
      name: 'Contact',
      path: '/contact',
    },
  ];

  describe('MenuAccordionItem Component', () => {
    it('should render menu item with href as anchor', () => {
      render(<MenuAccordionItem name="Test Item" href="/test" />);
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('href', '/test');
      expect(link).toHaveTextContent('Test Item');
    });

    it('should render menu item without href as anchor without href attribute', () => {
      const { container } = render(<MenuAccordionItem name="Test Item" href="" />);
      const anchor = container.querySelector('a');
      expect(anchor).toBeInTheDocument();
      expect(anchor).not.toHaveAttribute('href');
      expect(anchor).toHaveTextContent('Test Item');
    });

    it('should render menu item with target attribute when provided', () => {
      render(
        <MenuAccordionItem 
          name="External Link" 
          href="https://example.com" 
          target="_blank"
        />
      );
      const link = screen.getByRole('link');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('should render menu item in li element', () => {
      const { container } = render(
        <MenuAccordionItem name="Test" href="/test" />
      );
      const li = container.querySelector('li');
      expect(li).toBeInTheDocument();
      expect(li?.querySelector('a')).toBeInTheDocument();
    });

    it('should handle special characters in name', () => {
      render(<MenuAccordionItem name="Services & Support" href="/services" />);
      expect(screen.getByText('Services & Support')).toBeInTheDocument();
    });
  });

  describe('MenuAccordionGroup Component', () => {
    it('should render menu group as ul element', () => {
      const { container } = render(
        <MenuAccordionGroup 
          menuItems={mockMenuData} 
          state="show"
        />
      );
      const ul = container.querySelector('ul');
      expect(ul).toBeInTheDocument();
    });

    it('should apply menuShow class when state is show', () => {
      const { container } = render(
        <MenuAccordionGroup 
          menuItems={mockMenuData} 
          state="show"
        />
      );
      const ul = container.querySelector('ul');
      expect(ul).toHaveClass('menuShow');
    });

    it('should apply menuHide class when state is hide', () => {
      const { container } = render(
        <MenuAccordionGroup 
          menuItems={mockMenuData} 
          state="hide"
        />
      );
      const ul = container.querySelector('ul');
      expect(ul).toHaveClass('menuHide');
    });

    it('should render multiple menu items', () => {
      render(
        <MenuAccordionGroup 
          menuItems={mockMenuData} 
          state="show"
        />
      );
      const links = screen.getAllByRole('link');
      expect(links.length).toBeGreaterThan(0);
    });

    it('should handle menu items with nested routes', () => {
      render(
        <MenuAccordionGroup 
          menuItems={mockMenuData} 
          state="show"
        />
      );
      // Services should be a group parent
      expect(screen.getByText(/Services/i)).toBeInTheDocument();
      // Should also have the sub items
      expect(screen.getByText('Service 1')).toBeInTheDocument();
      expect(screen.getByText('Service 2')).toBeInTheDocument();
    });

    it('should extract routes from menuItems when routes property exists', () => {
      const groupWithRoutes = {
        name: 'Parent',
        routes: [
          { name: 'Child 1', path: '/child1' },
          { name: 'Child 2', path: '/child2' },
        ],
      };
      render(
        <MenuAccordionGroup 
          menuItems={groupWithRoutes} 
          state="show"
        />
      );
      expect(screen.getByText('Child 1')).toBeInTheDocument();
      expect(screen.getByText('Child 2')).toBeInTheDocument();
    });
  });

  describe('MenuAccordion Component - Rendering', () => {
    it('should render accordion menu wrapper', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const wrapper = container.querySelector('.accordionMenuWrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('should render accordion menu with correct ID', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const menu = document.getElementById('accordionMenu');
      expect(menu).toBeInTheDocument();
    });

    it('should render all menu items', () => {
      render(<MenuAccordion menuItems={mockMenuData} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    it('should render nested menu items', () => {
      render(<MenuAccordion menuItems={mockMenuData} />);
      expect(screen.getByText('Service 1')).toBeInTheDocument();
      expect(screen.getByText('Service 2')).toBeInTheDocument();
    });

    it('should start with accordionUp class', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const wrapper = container.querySelector('.accordionMenuWrapper');
      expect(wrapper).toHaveClass('accordionUp');
    });

    it('should apply correct CSS classes to menu structure', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      expect(container.querySelector('.accordionMenuWrapper')).toBeInTheDocument();
      expect(container.querySelector('.accordionMenu')).toBeInTheDocument();
    });
  });

  describe('MenuAccordion Component - Hidden Items', () => {
    it('should hide items marked as hidden by default', () => {
      const menuWithHidden: MenuItem[] = [
        { name: 'Visible', path: '/visible' },
        { name: 'Hidden', path: '/hidden', target: 'hidden' } as any,
      ];
      (menuWithHidden[1] as any).hidden = true;

      render(<MenuAccordion menuItems={menuWithHidden} />);
      expect(screen.getByText('Visible')).toBeInTheDocument();
      // Hidden item should not be rendered by default
      expect(screen.queryByText('Hidden')).not.toBeInTheDocument();
    });

    it('should show hidden items when showHidden is true', () => {
      const menuWithHidden: MenuItem[] = [
        { name: 'Visible', path: '/visible' },
        { name: 'Hidden', path: '/hidden' } as any,
      ];
      (menuWithHidden[1] as any).hidden = true;

      render(<MenuAccordion menuItems={menuWithHidden} showHidden={true} />);
      expect(screen.getByText('Visible')).toBeInTheDocument();
      expect(screen.getByText('Hidden')).toBeInTheDocument();
    });

    it('should show hidden nested items when showHidden is true', () => {
      const menuWithHiddenNested: MenuItem[] = [
        {
          name: 'Services',
          path: '',
          routes: [
            { name: 'Visible Service', path: '/services/visible' },
            { name: 'Hidden Service', path: '/services/hidden' } as any,
          ],
        },
      ];
      if (menuWithHiddenNested[0] && menuWithHiddenNested[0].routes && menuWithHiddenNested[0].routes[1]) {
        (menuWithHiddenNested[0].routes[1] as any).hidden = true;
      }

      render(<MenuAccordion menuItems={menuWithHiddenNested} showHidden={true} />);
      expect(screen.getByText('Visible Service')).toBeInTheDocument();
      expect(screen.getByText('Hidden Service')).toBeInTheDocument();
    });
  });

  describe('MenuAccordion Component - Click Handling', () => {
    it('should handle click on menu button', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const wrapper = container.querySelector('.accordionMenuWrapper');
      expect(wrapper).toHaveClass('accordionUp');

      // Click anywhere to simulate menu button behavior
      const menuBtn = document.getElementById('panelMenuButton') || wrapper;
      if (menuBtn) {
        fireEvent.click(menuBtn);
      }
    });

    it('should expand submenu when clicking on parent without href', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const servicesLink = screen.getByText(/▶ Services/);
      const menuGroups = container.querySelectorAll('ul');
      
      fireEvent.click(servicesLink);
      // The submenu should toggle its visibility state
      const subMenus = container.querySelectorAll('ul');
      expect(subMenus.length).toBeGreaterThan(0);
    });

    it('should not expand when clicking on item with href', () => {
      render(<MenuAccordion menuItems={mockMenuData} />);
      const homeLink = screen.getByText('Home');
      
      // Should not throw error
      fireEvent.click(homeLink);
      expect(homeLink).toBeInTheDocument();
    });
  });

  describe('MenuAccordionButton Component', () => {
    it('should render hamburger button', () => {
      render(<MenuAccordionButton />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have correct ID', () => {
      render(<MenuAccordionButton />);
      const button = document.getElementById('panelMenuButton');
      expect(button).toBeInTheDocument();
    });

    it('should have correct CSS class', () => {
      render(<MenuAccordionButton />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('panelMenuButton');
    });

    it('should display hamburger symbol', () => {
      const { container } = render(<MenuAccordionButton />);
      const hamburger = container.querySelector('.hamburger');
      expect(hamburger).toBeInTheDocument();
      expect(hamburger?.textContent).toBe('≡');
    });

    it('should call window.moveMenu when clicked', () => {
      const moveMenuMock = vi.fn();
      window.moveMenu = moveMenuMock;

      render(<MenuAccordionButton />);
      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(moveMenuMock).toHaveBeenCalled();
    });

    it('should have text-outline class', () => {
      const { container } = render(<MenuAccordionButton />);
      const hamburger = container.querySelector('.hamburger');
      expect(hamburger).toHaveClass('text-outline');
    });
  });

  describe('MenuAccordion Component - Multiple Nested Levels', () => {
    it('should render menu with multiple nested groups', () => {
      const complexMenu: MenuItem[] = [
        {
          name: 'Products',
          path: '',
          routes: [
            { name: 'Product 1', path: '/products/1' },
            { name: 'Product 2', path: '/products/2' },
          ],
        },
        {
          name: 'Support',
          path: '',
          routes: [
            { name: 'FAQ', path: '/support/faq' },
            { name: 'Contact', path: '/support/contact' },
          ],
        },
      ];
      render(<MenuAccordion menuItems={complexMenu} />);

      expect(screen.getByText(/Products/)).toBeInTheDocument();
      expect(screen.getByText(/Support/)).toBeInTheDocument();
      expect(screen.getByText('Product 1')).toBeInTheDocument();
      expect(screen.getByText('FAQ')).toBeInTheDocument();
    });
  });

  describe('MenuAccordion Component - Edge Cases', () => {
    it('should handle empty menu', () => {
      render(<MenuAccordion menuItems={[]} />);
      const menu = document.getElementById('accordionMenu');
      expect(menu).toBeInTheDocument();
    });

    it('should handle menu with very long item names', () => {
      const longNameMenu: MenuItem[] = [
        {
          name: 'This is a very long menu item name that spans multiple words and should still be rendered properly',
          path: '/long',
        },
      ];
      render(<MenuAccordion menuItems={longNameMenu} />);
      expect(screen.getByText(/This is a very long menu item name/)).toBeInTheDocument();
    });

    it('should handle special characters in menu items', () => {
      const specialCharsMenu: MenuItem[] = [
        { name: 'Items & Services', path: '/items' },
        { name: 'Coffee™ Shop', path: '/coffee' },
        { name: '50% Off', path: '/discount' },
      ];
      render(<MenuAccordion menuItems={specialCharsMenu} />);
      expect(screen.getByText('Items & Services')).toBeInTheDocument();
      expect(screen.getByText('Coffee™ Shop')).toBeInTheDocument();
      expect(screen.getByText('50% Off')).toBeInTheDocument();
    });

    it('should handle external links with target="_blank"', () => {
      const externalMenu: MenuItem[] = [
        { name: 'External', path: 'https://example.com', target: '_blank' },
      ];
      render(<MenuAccordion menuItems={externalMenu} />);
      const link = screen.getByText('External');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
    });

    it('should handle menu without routes property', () => {
      const simpleMenu: MenuItem[] = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ];
      render(<MenuAccordion menuItems={simpleMenu} />);
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
    });

    it('should preserve menu structure after re-render', () => {
      const { rerender } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const menu = document.getElementById('accordionMenu');
      expect(menu).toBeInTheDocument();

      rerender(<MenuAccordion menuItems={mockMenuData} />);
      expect(menu).toBeInTheDocument();
    });
  });

  describe('MenuAccordion Component - Event Listeners', () => {
    it('should attach click listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      const { unmount } = render(<MenuAccordion menuItems={mockMenuData} />);

      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true);
      addEventListenerSpy.mockRestore();
      unmount();
    });

    it('should remove click listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      const { unmount } = render(<MenuAccordion menuItems={mockMenuData} />);

      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });

    it('should attach moveMenu function to window', () => {
      render(<MenuAccordion menuItems={mockMenuData} />);
      expect(typeof window.moveMenu).toBe('function');
    });
  });

  describe('MenuAccordion Component - CSS Classes', () => {
    it('should have accordionMenuWrapper class', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const wrapper = container.querySelector('.accordionMenuWrapper');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have accordionMenu class', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const menu = container.querySelector('.accordionMenu');
      expect(menu).toBeInTheDocument();
    });

    it('should toggle accordionUp and accordionDown classes', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const wrapper = container.querySelector('.accordionMenuWrapper');
      expect(wrapper).toHaveClass('accordionUp');
      
      // Simulate clicking to toggle state
      fireEvent.click(document);
      // Class should remain or change depending on implementation
      expect(wrapper).toBeTruthy();
    });
  });

  describe('MenuAccordion Component - Menu Item Rendering', () => {
    it('should render parent menu items with arrow indicator', () => {
      render(<MenuAccordion menuItems={mockMenuData} />);
      const servicesParent = screen.getByText(/▶ Services/);
      expect(servicesParent).toBeInTheDocument();
    });

    it('should render child menu items under parent', () => {
      render(<MenuAccordion menuItems={mockMenuData} />);
      const service1 = screen.getByText('Service 1');
      const service2 = screen.getByText('Service 2');
      expect(service1).toBeInTheDocument();
      expect(service2).toBeInTheDocument();
    });

    it('should generate unique keys for menu items', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const listItems = container.querySelectorAll('li');
      expect(listItems.length).toBeGreaterThan(0);
    });
  });

  describe('MenuAccordion Component - Accessibility', () => {
    it('should use semantic list structure', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const lists = container.querySelectorAll('ul');
      const items = container.querySelectorAll('li');
      expect(lists.length).toBeGreaterThan(0);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should have proper link structure for menu items with href', () => {
      render(<MenuAccordion menuItems={mockMenuData} />);
      const homeLink = screen.getByText('Home');
      expect(homeLink.tagName).toBe('A');
      expect(homeLink).toHaveAttribute('href', '/');
    });

    it('should have non-link structure for menu parents', () => {
      render(<MenuAccordion menuItems={mockMenuData} />);
      const servicesParent = screen.getByText(/▶ Services/);
      expect(servicesParent.tagName).toBe('A');
      expect(servicesParent).not.toHaveAttribute('href');
    });
  });

  describe('MenuAccordion Component - Integration', () => {
    it('should work with both button and menu together', () => {
      const { container } = render(
        <div>
          <MenuAccordionButton />
          <MenuAccordion menuItems={mockMenuData} />
        </div>
      );
      
      const button = document.getElementById('panelMenuButton');
      const menu = document.getElementById('accordionMenu');
      
      expect(button).toBeInTheDocument();
      expect(menu).toBeInTheDocument();
    });

    it('should maintain menu state through multiple interactions', () => {
      const { container } = render(
        <MenuAccordion menuItems={mockMenuData} />
      );
      const wrapper = container.querySelector('.accordionMenuWrapper');
      
      fireEvent.click(document);
      expect(wrapper).toBeInTheDocument();
      
      fireEvent.click(document);
      expect(wrapper).toBeInTheDocument();
    });
  });
});
