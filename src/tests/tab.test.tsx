import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { Tab } from '../components/general/tab';

describe('Tab Component', () => {
  const mockTabs = [
    { id: 'tab1', label: 'Tab 1', content: <div>Content 1</div> },
    { id: 'tab2', label: 'Tab 2', content: <div>Content 2</div> },
    { id: 'tab3', label: 'Tab 3', content: <div>Content 3</div> },
  ];

  const mockOnTabChange = vi.fn();

  beforeEach(() => {
    mockOnTabChange.mockClear();
  });

  describe('Tab Basic Rendering', () => {
    it('should render Tab component with default orientation', () => {
      const { container } = render(<Tab tabs={mockTabs} />);
      expect(container.querySelector('.tab-container')).toBeInTheDocument();
      expect(container.querySelector('.tab-top')).toBeInTheDocument();
    });

    it('should render all tab headers', () => {
      render(<Tab tabs={mockTabs} />);
      expect(screen.getByText('Tab 1')).toBeInTheDocument();
      expect(screen.getByText('Tab 2')).toBeInTheDocument();
      expect(screen.getByText('Tab 3')).toBeInTheDocument();
    });

    it('should render first tab content by default', () => {
      render(<Tab tabs={mockTabs} />);
      expect(screen.getByText('Content 1')).toBeInTheDocument();
    });

    it('should render with specified default active tab', () => {
      render(<Tab tabs={mockTabs} defaultActiveTab="tab2" />);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
    });
  });

  describe('Tab Orientations', () => {
    it('should apply top orientation class', () => {
      const { container } = render(<Tab tabs={mockTabs} orientation="top" />);
      expect(container.querySelector('.tab-top')).toBeInTheDocument();
    });

    it('should apply bottom orientation class', () => {
      const { container } = render(<Tab tabs={mockTabs} orientation="bottom" />);
      expect(container.querySelector('.tab-bottom')).toBeInTheDocument();
    });

    it('should apply left orientation class', () => {
      const { container } = render(<Tab tabs={mockTabs} orientation="left" />);
      expect(container.querySelector('.tab-left')).toBeInTheDocument();
    });

    it('should apply right orientation class', () => {
      const { container } = render(<Tab tabs={mockTabs} orientation="right" />);
      expect(container.querySelector('.tab-right')).toBeInTheDocument();
    });
  });

  describe('Tab Interactions', () => {
    it('should switch content when tab is clicked', () => {
      render(<Tab tabs={mockTabs} />);
      const tab2Button = screen.getByText('Tab 2');
      fireEvent.click(tab2Button);
      expect(screen.getByText('Content 2')).toBeInTheDocument();
      expect(screen.queryByText('Content 1')).not.toBeInTheDocument();
    });

    it('should call onTabChange when tab is clicked', () => {
      render(<Tab tabs={mockTabs} onTabChange={mockOnTabChange} />);
      const tab2Button = screen.getByText('Tab 2');
      fireEvent.click(tab2Button);
      expect(mockOnTabChange).toHaveBeenCalledWith('tab2');
    });

    it('should maintain active state', () => {
      render(<Tab tabs={mockTabs} />);
      const tab1Button = screen.getByText('Tab 1');
      const tab2Button = screen.getByText('Tab 2');
      
      expect(tab1Button).toHaveClass('active');
      
      fireEvent.click(tab2Button);
      expect(tab2Button).toHaveClass('active');
      expect(tab1Button).not.toHaveClass('active');
    });
  });
});