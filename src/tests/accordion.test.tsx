import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/test-utils';
import { Accordion } from '../components/general/accordion';

describe('Accordion', () => {
  const mockItems = [
    {
      title: 'Question 1',
      content: 'Answer 1'
    },
    {
      title: 'Question 2',
      content: 'Answer 2'
    }
  ];

  it('renders all accordion items', () => {
    render(<Accordion items={mockItems} />);
    
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
  });

  it('renders content as text when string', () => {
    render(<Accordion items={mockItems} />);
    
    expect(screen.getByText('Answer 1')).toBeInTheDocument();
    expect(screen.getByText('Answer 2')).toBeInTheDocument();
  });

  it('renders content as React node when provided', () => {
    const itemsWithNode = [
      {
        title: 'Test',
        content: <div data-testid="custom-content">Custom Content</div>
      }
    ];
    
    render(<Accordion items={itemsWithNode} />);
    
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('renders empty when no items provided', () => {
    const { container } = render(<Accordion items={[]} />);
    
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('renders proper heading structure with h3 elements', () => {
    render(<Accordion items={mockItems} />);
    
    // Should render h3 elements inside summary elements
    const heading1 = screen.getByRole('heading', { level: 3, name: 'Question 1' });
    const heading2 = screen.getByRole('heading', { level: 3, name: 'Question 2' });
    
    expect(heading1).toBeInTheDocument();
    expect(heading2).toBeInTheDocument();
    
    // Verify h3 elements are inside summary elements
    expect(heading1.closest('summary')).toBeInTheDocument();
    expect(heading2.closest('summary')).toBeInTheDocument();
  });

  it('includes proper ARIA attributes for screen reader support', () => {
    render(<Accordion items={mockItems} />);
    
    // Check for aria-labelledby on content regions
    const contentRegions = screen.getAllByRole('region');
    expect(contentRegions).toHaveLength(2);
    
    // Check that content regions have aria-labelledby pointing to headers
    expect(contentRegions[0]).toHaveAttribute('aria-labelledby', 'accordion-header-0');
    expect(contentRegions[1]).toHaveAttribute('aria-labelledby', 'accordion-header-1');
    
    // Check that h3 elements have proper IDs
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveAttribute('id', 'accordion-header-0');
    expect(headings[1]).toHaveAttribute('id', 'accordion-header-1');
  });
});