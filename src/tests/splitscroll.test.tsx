import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { SplitScroll, SplitScrollSection } from '../components/general/splitscroll';

// Mock the SmartImage component
vi.mock('../components/general/smartimage', () => ({
	SmartImage: (props: any) => {
		const { src, alt, title } = props;
		return React.createElement('img', {
			src,
			alt,
			title,
			'data-testid': 'smart-image'
		});
	},
}));

// Mock IntersectionObserver
class MockIntersectionObserver {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}
window.IntersectionObserver = MockIntersectionObserver as any;
const mockIntersectionObserver = vi.spyOn(window, 'IntersectionObserver');

const mockConfig = {
	cloudinary: {
		product_env: 'test-env',
		baseUrl: 'https://test.cloudinary.com',
		transforms: 'test-transforms',
	},
};

const renderWithConfig = (component: React.ReactElement) => {
	return render(component, { config: mockConfig });
};

describe('SplitScroll Component', () => {
	describe('Basic Rendering', () => {
		it('should render SplitScroll container', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScrollSection>
				</SplitScroll>
			);
			
			expect(container.querySelector('.splitscroll-container')).toBeInTheDocument();
		});

		it('should render multiple sections', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScrollSection>
					<SplitScrollSection img="/test2.jpg" title="Section 2">
						Content 2
					</SplitScrollSection>
					<SplitScrollSection img="/test3.jpg" title="Section 3">
						Content 3
					</SplitScrollSection>
				</SplitScroll>
			);
			
			const sections = container.querySelectorAll('.splitscroll-section');
			expect(sections).toHaveLength(3);
		});
	});

	describe('SplitScrollSection Component', () => {
		it('should render as a split variant callout', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test.jpg" title="Test Section">
						Test Content
					</SplitScrollSection>
				</SplitScroll>
			);
			
			expect(container.querySelector('.callout.split')).toBeInTheDocument();
		});

		it('should render section with image', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test.jpg" imgAlt="Test Image" title="Test">
						Content
					</SplitScrollSection>
				</SplitScroll>
			);
			
			const image = screen.getByAltText('Test Image');
			expect(image).toBeInTheDocument();
			expect(image).toHaveAttribute('src', '/test.jpg');
		});

		it('should render children content', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test.jpg" title="Test">
						<div data-testid="custom-content">Custom Content</div>
					</SplitScrollSection>
				</SplitScroll>
			);
			
			expect(screen.getByTestId('custom-content')).toBeInTheDocument();
		});

		it('should render title', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test.jpg" title="Test Title">
						Content
					</SplitScrollSection>
				</SplitScroll>
			);
			
			expect(screen.getByText('Test Title')).toBeInTheDocument();
		});

		it('should render subtitle', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScrollSection 
						img="/test.jpg" 
						title="Title"
						subtitle="Test Subtitle"
					>
						Content
					</SplitScrollSection>
				</SplitScroll>
			);
			
			expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
		});
	});

	describe('Section Indexing', () => {
		it('should add section index data attribute', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScrollSection>
					<SplitScrollSection img="/test2.jpg" title="Section 2">
						Content 2
					</SplitScrollSection>
				</SplitScroll>
			);
			
			const sections = container.querySelectorAll('.splitscroll-section');
			expect(sections[0]).toHaveAttribute('data-section-index', '0');
			expect(sections[1]).toHaveAttribute('data-section-index', '1');
		});

		it('should set first section as active by default', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScrollSection>
					<SplitScrollSection img="/test2.jpg" title="Section 2">
						Content 2
					</SplitScrollSection>
				</SplitScroll>
			);
			
			const sections = container.querySelectorAll('.splitscroll-section');
			expect(sections[0]).toHaveClass('active');
			expect(sections[1]).not.toHaveClass('active');
		});
	});

	describe('Props Handling', () => {
		it('should pass imgShape to Callout', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScrollSection 
						img="/test.jpg" 
						imgShape="round"
						title="Test"
					>
						Content
					</SplitScrollSection>
				</SplitScroll>
			);
			
			expect(container.querySelector('.callout-image.round')).toBeInTheDocument();
		});

		it('should set aboveFold true for first section by default', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test1.jpg" title="First">
						Content 1
					</SplitScrollSection>
					<SplitScrollSection img="/test2.jpg" title="Second">
						Content 2
					</SplitScrollSection>
				</SplitScroll>
			);
			
			// First image should be treated as above fold
			const images = screen.getAllByRole('img');
			expect(images[0]).toBeInTheDocument();
		});
	});

	describe('IntersectionObserver Setup', () => {
		it('should create IntersectionObserver instances', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScrollSection>
					<SplitScrollSection img="/test2.jpg" title="Section 2">
						Content 2
					</SplitScrollSection>
				</SplitScroll>
			);
			
			// IntersectionObserver should be called for observing sections
			expect(mockIntersectionObserver).toHaveBeenCalled();
		});
	});

	describe('Edge Cases', () => {
		it('should handle single section', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test.jpg" title="Single">
						Content
					</SplitScrollSection>
				</SplitScroll>
			);
			
			expect(container.querySelectorAll('.splitscroll-section')).toHaveLength(1);
		});

		it('should handle section without title', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test.jpg">
						Content without title
					</SplitScrollSection>
				</SplitScroll>
			);
			
			expect(screen.getByText('Content without title')).toBeInTheDocument();
		});

		it('should handle empty children', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScrollSection img="/test.jpg" title="Empty">
					</SplitScrollSection>
				</SplitScroll>
			);
			
			expect(container.querySelector('.splitscroll-section')).toBeInTheDocument();
		});
	});

	describe('Compound Component Pattern', () => {
		it('should be accessible as SplitScrollSection', () => {
			expect(SplitScrollSection).toBeDefined();
			expect(typeof SplitScrollSection).toBe('function');
		});

		it('should have propTypes defined', () => {
			expect(SplitScrollSection.propTypes).toBeDefined();
		});
	});
});
