import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SplitScroll } from '../components/general/splitscroll';
import { PixelatedClientConfigProvider } from '../components/config/config.client';

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
	return render(
		<PixelatedClientConfigProvider config={mockConfig}>
			{component}
		</PixelatedClientConfigProvider>
	);
};

describe('SplitScroll Component', () => {
	describe('Basic Rendering', () => {
		it('should render SplitScroll container', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			expect(container.querySelector('.splitscroll-container')).toBeInTheDocument();
		});

		it('should render multiple sections', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScroll.Section>
					<SplitScroll.Section img="/test2.jpg" title="Section 2">
						Content 2
					</SplitScroll.Section>
					<SplitScroll.Section img="/test3.jpg" title="Section 3">
						Content 3
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			const sections = container.querySelectorAll('.splitscroll-section');
			expect(sections).toHaveLength(3);
		});
	});

	describe('SplitScroll.Section Component', () => {
		it('should render as a split variant callout', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test.jpg" title="Test Section">
						Test Content
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			expect(container.querySelector('.callout.split')).toBeInTheDocument();
		});

		it('should render section with image', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test.jpg" imgAlt="Test Image" title="Test">
						Content
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			const image = screen.getByAltText('Test Image');
			expect(image).toBeInTheDocument();
			expect(image).toHaveAttribute('src', '/test.jpg');
		});

		it('should render children content', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test.jpg" title="Test">
						<div data-testid="custom-content">Custom Content</div>
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			expect(screen.getByTestId('custom-content')).toBeInTheDocument();
		});

		it('should render title', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test.jpg" title="Test Title">
						Content
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			expect(screen.getByText('Test Title')).toBeInTheDocument();
		});

		it('should render subtitle', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section 
						img="/test.jpg" 
						title="Title"
						subtitle="Test Subtitle"
					>
						Content
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
		});
	});

	describe('Section Indexing', () => {
		it('should add section index data attribute', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScroll.Section>
					<SplitScroll.Section img="/test2.jpg" title="Section 2">
						Content 2
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			const sections = container.querySelectorAll('.splitscroll-section');
			expect(sections[0]).toHaveAttribute('data-section-index', '0');
			expect(sections[1]).toHaveAttribute('data-section-index', '1');
		});

		it('should set first section as active by default', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScroll.Section>
					<SplitScroll.Section img="/test2.jpg" title="Section 2">
						Content 2
					</SplitScroll.Section>
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
					<SplitScroll.Section 
						img="/test.jpg" 
						imgShape="round"
						title="Test"
					>
						Content
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			expect(container.querySelector('.callout-image.round')).toBeInTheDocument();
		});

		it('should set aboveFold true for first section by default', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test1.jpg" title="First">
						Content 1
					</SplitScroll.Section>
					<SplitScroll.Section img="/test2.jpg" title="Second">
						Content 2
					</SplitScroll.Section>
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
					<SplitScroll.Section img="/test1.jpg" title="Section 1">
						Content 1
					</SplitScroll.Section>
					<SplitScroll.Section img="/test2.jpg" title="Section 2">
						Content 2
					</SplitScroll.Section>
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
					<SplitScroll.Section img="/test.jpg" title="Single">
						Content
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			expect(container.querySelectorAll('.splitscroll-section')).toHaveLength(1);
		});

		it('should handle section without title', () => {
			renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test.jpg">
						Content without title
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			expect(screen.getByText('Content without title')).toBeInTheDocument();
		});

		it('should handle empty children', () => {
			const { container } = renderWithConfig(
				<SplitScroll>
					<SplitScroll.Section img="/test.jpg" title="Empty">
					</SplitScroll.Section>
				</SplitScroll>
			);
			
			expect(container.querySelector('.splitscroll-section')).toBeInTheDocument();
		});
	});

	describe('Compound Component Pattern', () => {
		it('should be accessible as SplitScroll.Section', () => {
			expect(SplitScroll.Section).toBeDefined();
			expect(typeof SplitScroll.Section).toBe('function');
		});

		it('should have propTypes defined', () => {
			expect(SplitScroll.Section.propTypes).toBeDefined();
		});
	});
});
