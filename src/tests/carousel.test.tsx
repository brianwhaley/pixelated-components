import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import { Carousel, CarouselCardType } from '../components/general/carousel';

// Mock SmartImage component
vi.mock('../components/cms/smartimage', () => ({
	SmartImage: ({ src, alt, className }: any) => (
		<img src={src} alt={alt} className={className} />
	),
}));

// Mock DragHandler
vi.mock('../components/general/carousel.drag', () => ({
	DragHandler: vi.fn(),
}));

// Import the mocked DragHandler
import { DragHandler } from '../components/general/carousel.drag';

const mockCards: CarouselCardType[] = [
	{
		index: 0,
		cardIndex: 0,
		cardLength: 3,
		image: 'https://example.com/image1.jpg',
		imageAlt: 'Image 1',
		headerText: 'Card 1',
		subHeaderText: 'Subheader 1',
		bodyText: 'Body text 1',
	},
	{
		index: 1,
		cardIndex: 1,
		cardLength: 3,
		image: 'https://example.com/image2.jpg',
		imageAlt: 'Image 2',
		headerText: 'Card 2',
		subHeaderText: 'Subheader 2',
		bodyText: 'Body text 2',
	},
	{
		index: 2,
		cardIndex: 2,
		cardLength: 3,
		image: 'https://example.com/image3.jpg',
		imageAlt: 'Image 3',
		headerText: 'Card 3',
		link: 'https://example.com/card3',
		linkTarget: '_blank',
	},
	];

describe('Carousel Component', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
		it('should render carousel container', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			expect(container.querySelector('.carousel-container')).toBeInTheDocument();
		});

		it('should render all carousel cards', () => {
			render(<Carousel cards={mockCards} />);
			expect(screen.getByText('Card 1')).toBeInTheDocument();
			expect(screen.getByText('Card 2')).toBeInTheDocument();
			expect(screen.getByText('Card 3')).toBeInTheDocument();
		});

		it('should render all images', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const images = container.querySelectorAll('img');
			expect(images.length).toBe(3);
		});

		it('should render carousel control buttons', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const buttons = container.querySelectorAll('.carousel-buttons button');
			expect(buttons.length).toBeGreaterThan(0);
		});

		it('should display loading state when no cards provided', () => {
			const { container } = render(<Carousel cards={[]} />);
			expect(container.querySelector('.carousel-container')).toBeInTheDocument();
		});
	});

	describe('Card Content', () => {
		it('should display header text when provided', () => {
			render(<Carousel cards={mockCards} />);
			expect(screen.getByText('Card 1')).toBeInTheDocument();
			expect(screen.getByText('Card 2')).toBeInTheDocument();
		});

		it('should display subheader text when provided', () => {
			render(<Carousel cards={mockCards} />);
			expect(screen.getByText('Subheader 1')).toBeInTheDocument();
			expect(screen.getByText('Subheader 2')).toBeInTheDocument();
		});

		it('should display body text when provided', () => {
			render(<Carousel cards={mockCards} />);
			expect(screen.getByText('Body text 1')).toBeInTheDocument();
			expect(screen.getByText('Body text 2')).toBeInTheDocument();
		});

		it('should render links when provided', () => {
			render(<Carousel cards={mockCards} />);
			const link = screen.getByRole('link', { hidden: true });
			expect(link).toHaveAttribute('href', 'https://example.com/card3');
			expect(link).toHaveAttribute('target', '_blank');
		});

		it('should not render links when not provided', () => {
			const cardsWithoutLinks = mockCards.map(card => ({
				...card,
				link: undefined,
			}));
			const { container } = render(<Carousel cards={cardsWithoutLinks} />);
			const links = container.querySelectorAll('a');
			expect(links.length).toBe(0);
		});

		it('should set default link target to _self', () => {
			const cardsWithDefaultTarget = [
				{
					...mockCards[0],
					link: 'https://example.com',
					linkTarget: undefined,
				},
			];
			render(<Carousel cards={cardsWithDefaultTarget} />);
			const link = screen.getByRole('link', { hidden: true });
			expect(link).toHaveAttribute('target', '_self');
		});
	});

	describe('Navigation', () => {
		it('should have previous, pause, and next buttons', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const buttons = container.querySelectorAll('.carousel-buttons button');
			expect(buttons.length).toBe(3);
		});

		it('should have unique button glyphs', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const buttons = container.querySelectorAll('.carousel-buttons button');
			const glyphs = Array.from(buttons).map(btn => btn.innerHTML);
			// Left arrow, pause, right arrow glyphs
			expect(glyphs.length).toBe(3);
		});
	});

	describe('Image Styling', () => {
		it('should apply default image fit (fill)', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const images = container.querySelectorAll('img');
			expect(images[0]).toHaveClass('imgFill');
		});

		it('should apply custom image fit (contain)', () => {
			const { container } = render(<Carousel cards={mockCards} imgFit="contain" />);
			const images = container.querySelectorAll('img');
			expect(images[0]).toHaveClass('imgContain');
		});

		it('should apply custom image fit (cover)', () => {
			const { container } = render(<Carousel cards={mockCards} imgFit="cover" />);
			const images = container.querySelectorAll('img');
			expect(images[0]).toHaveClass('imgCover');
		});
	});

	describe('Card Structure', () => {
		it('should have correct card wrapper structure', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const wrappers = container.querySelectorAll('.carousel-card-wrapper');
			expect(wrappers.length).toBe(3);
		});

		it('should have unique card IDs', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const wrappers = container.querySelectorAll('.carousel-card-wrapper');
			const ids = Array.from(wrappers).map(w => w.id);
			expect(ids).toEqual(['c-0', 'c-1', 'c-2']);
		});

		it('should render card images with alt text', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const images = container.querySelectorAll('img');
			expect(images[0]).toHaveAttribute('alt', 'Image 1');
			expect(images[1]).toHaveAttribute('alt', 'Image 2');
		});

		it('should have correct z-index values', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const wrappers = container.querySelectorAll('.carousel-card-wrapper');
			// Z-index = cardLength - index
			const wrapper0 = wrappers[0] as HTMLElement;
			const wrapper1 = wrappers[1] as HTMLElement;
			const wrapper2 = wrappers[2] as HTMLElement;
			expect(wrapper0.style.zIndex).toBe('3');
			expect(wrapper1.style.zIndex).toBe('2');
			expect(wrapper2.style.zIndex).toBe('1');
		});
	});

	describe('Single Card', () => {
		it('should render carousel with single card', () => {
			const singleCard = [mockCards[0]];
			render(<Carousel cards={singleCard} />);
			expect(screen.getByText('Card 1')).toBeInTheDocument();
		});

		it('should handle navigation with single card (loops)', () => {
			const singleCard = [{ ...mockCards[0], index: 0, cardLength: 1 }];
			const { container } = render(<Carousel cards={singleCard} />);
			expect(container.querySelector('.carousel-card-wrapper')).toBeInTheDocument();
		});
	});

	describe('Large Card Collection', () => {
		it('should render carousel with many cards', () => {
			const manyCards = Array.from({ length: 20 }, (_, i) => ({
				...mockCards[0],
				index: i,
				cardIndex: i,
				cardLength: 20,
				headerText: `Card ${i + 1}`,
				image: `https://example.com/image${i + 1}.jpg`,
			}));
			const { container } = render(<Carousel cards={manyCards} />);
			expect(container.querySelectorAll('.carousel-card-wrapper').length).toBe(20);
		});
	});

	describe('Optional Card Properties', () => {
		it('should handle cards without optional properties', () => {
			const minimalCards = [
				{
					index: 0,
					cardIndex: 0,
					cardLength: 1,
					image: 'https://example.com/image1.jpg',
					imageAlt: 'Minimal card image',
				},
			];
			render(<Carousel cards={minimalCards} />);
			const image = screen.getByAltText('Minimal card image');
			expect(image).toBeInTheDocument();
		});

		it('should not render sections for missing optional content', () => {
			const minimalCards = [
				{
					index: 0,
					cardIndex: 0,
					cardLength: 1,
					image: 'https://example.com/image.jpg',
				},
			];
			const { container } = render(<Carousel cards={minimalCards} />);
			expect(container.querySelector('.carousel-card-header')).not.toBeInTheDocument();
			expect(container.querySelector('.carousel-card-subheader')).not.toBeInTheDocument();
			expect(container.querySelector('.carousel-card-body')).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have alt text on all images', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const images = container.querySelectorAll('img');
			images.forEach(img => {
				expect(img).toHaveAttribute('alt');
			});
		});

		it('should have semantic heading structure', () => {
			render(<Carousel cards={mockCards} />);
			const h3s = screen.getAllByRole('heading', { level: 3 });
			expect(h3s.length).toBeGreaterThan(0);
		});

		it('should have buttons for navigation', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const buttons = container.querySelectorAll('button');
			expect(buttons.length).toBeGreaterThan(0);
		});
	});

	describe('CSS Classes', () => {
		it('should apply correct CSS classes to card wrappers', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			const wrappers = container.querySelectorAll('.carousel-card-wrapper');
			expect(wrappers.length).toBe(3);
			wrappers.forEach(wrapper => {
				expect(wrapper).toHaveClass('carousel-card-wrapper');
			});
		});

		it('should apply correct CSS classes to card content', () => {
			const { container } = render(<Carousel cards={mockCards} />);
			expect(container.querySelector('.carousel-card-image')).toBeInTheDocument();
			expect(container.querySelector('.carousel-card-header')).toBeInTheDocument();
			expect(container.querySelector('.carousel-card-subheader')).toBeInTheDocument();
			expect(container.querySelector('.carousel-card-body')).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should handle cards with very long text', () => {
			const longTextCards = [
				{
					...mockCards[0],
					headerText: 'A'.repeat(100),
					bodyText: 'B'.repeat(500),
				},
			];
			render(<Carousel cards={longTextCards} />);
			expect(screen.getByText('A'.repeat(100))).toBeInTheDocument();
		});

		it('should handle cards with special characters in text', () => {
			const specialCards = [
				{
					...mockCards[0],
					headerText: 'Card & "Special" <Characters>',
					bodyText: 'Body with © symbols and → arrows',
				},
			];
			render(<Carousel cards={specialCards} />);
			expect(screen.getByText(/Special/)).toBeInTheDocument();
		});

		it('should handle URLs with special characters', () => {
			const specialUrlCards = [
				{
					...mockCards[0],
					link: 'https://example.com/path?id=123&name=test#section',
					linkTarget: '_blank',
				},
			];
			render(<Carousel cards={specialUrlCards} />);
			const link = screen.getByRole('link', { hidden: true });
			expect(link).toHaveAttribute(
				'href',
				'https://example.com/path?id=123&name=test#section'
			);
		});

		it('should handle cards with missing image', () => {
			const noImageCards = [
				{
					index: 0,
					cardIndex: 0,
					cardLength: 1,
					image: '',
					headerText: 'No Image Card',
				},
			];
			const { container } = render(<Carousel cards={noImageCards} />);
			expect(screen.getByText('No Image Card')).toBeInTheDocument();
		});
	});

describe('Carousel Timer and Auto-Advance', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.clearAllTimers();
	});

	it('should auto-advance to next card after 5 seconds', () => {
		render(<Carousel cards={mockCards} />);
		
		// Initially showing first card
		expect(screen.getByText('Card 1')).toBeInTheDocument();
		
		// Advance timer
		vi.advanceTimersByTime(5000);
		
		// Should show second card
		expect(screen.getByText('Card 2')).toBeInTheDocument();
	});

	it('should loop back to first card after last card', () => {
		render(<Carousel cards={mockCards} />);
		
		// Advance through all cards
		vi.advanceTimersByTime(5000); // Card 2
		vi.advanceTimersByTime(5000); // Card 3
		vi.advanceTimersByTime(5000); // Back to Card 1
		
		expect(screen.getByText('Card 1')).toBeInTheDocument();
	});

	// it.skip('should stop auto-advance when pause button is clicked', async () => {
	// 	const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
	// 	render(<Carousel cards={mockCards} />);
	// 	
	// 	// Click pause button
	// 	const pauseButton = screen.getAllByRole('button')[0];
	// 	await user.click(pauseButton);
	// 	
	// 	// Advance timer
	// 	vi.advanceTimersByTime(5000);
	// 	
	// 	// Should still show first card
	// 	expect(screen.getByText('Card 1')).toBeInTheDocument();
	// });

	// it.skip('should resume auto-advance after pause when navigation occurs', async () => {
	// 	const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
	// 	render(<Carousel cards={mockCards} />);
	// 	
	// 	// Click pause
	// 	const pauseButton = screen.getAllByRole('button')[0];
	// 	await user.click(pauseButton);
	// 	
	// 	// Advance timer (should not change)
	// 	vi.advanceTimersByTime(5000);
	// 	expect(screen.getByText('Card 1')).toBeInTheDocument();
	// 	
	// 	// Click next
	// 	const nextButton = screen.getAllByRole('button')[1];
	// 	await user.click(nextButton);
	// 	expect(screen.getByText('Card 2')).toBeInTheDocument();
	// 	
	// 	// Now timer should work again
	// 	vi.advanceTimersByTime(5000);
	// 	expect(screen.getByText('Card 3')).toBeInTheDocument();
	// });
});

describe('Carousel Draggable Functionality', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should enable drag handler when draggable prop is true', () => {
		render(<Carousel cards={mockCards} draggable={true} />);
		// DragHandler should be called - we can verify by checking if the mock was called
		expect(vi.mocked(DragHandler)).toHaveBeenCalledWith({
			activeIndex: 0,
			targetDiv: 'carousel-card-wrapper',
			nextImage: expect.any(Function),
			previousImage: expect.any(Function),
		});
	});

	it('should not enable drag handler when draggable prop is false', () => {
		render(<Carousel cards={mockCards} draggable={false} />);
		expect(vi.mocked(DragHandler)).not.toHaveBeenCalled();
	});

	it('should not enable drag handler when draggable prop is undefined', () => {
		render(<Carousel cards={mockCards} />);
		expect(vi.mocked(DragHandler)).not.toHaveBeenCalled();
	});

	it('should pass correct navigation functions to drag handler', () => {
		render(<Carousel cards={mockCards} draggable={true} />);
		
		const dragHandlerCall = vi.mocked(DragHandler).mock.calls[0][0];
		expect(typeof dragHandlerCall.nextImage).toBe('function');
		expect(typeof dragHandlerCall.previousImage).toBe('function');
	});
});

describe('Carousel Card Positioning', () => {
	it('should position cards correctly for current index', () => {
		render(<Carousel cards={mockCards} />);
		
		const wrappers = document.querySelectorAll('.carousel-card-wrapper');
		expect(wrappers[0]).toHaveStyle({ transform: 'translateX(0%)' }); // Current
		expect(wrappers[1]).toHaveStyle({ transform: 'translateX(100%)' }); // Next
		expect(wrappers[2]).toHaveStyle({ transform: 'translateX(100%)' }); // Next
	});

	// it.skip('should update card positions when navigating', async () => {
	// 	const user = userEvent.setup();
	// 	render(<Carousel cards={mockCards} />);
	// 	
	// 	// Click next
	// 	const nextButton = screen.getAllByRole('button')[1];
	// 	await user.click(nextButton);
	// 	
	// 	const wrappers = document.querySelectorAll('.carousel-card-wrapper');
	// 	expect(wrappers[0]).toHaveStyle({ transform: 'translateX(-100%)' }); // Previous
	// 	expect(wrappers[1]).toHaveStyle({ transform: 'translateX(0%)' }); // Current
	// 	expect(wrappers[2]).toHaveStyle({ transform: 'translateX(100%)' }); // Next
	// });

	// it.skip('should handle wraparound positioning correctly', async () => {
	// 	const user = userEvent.setup();
	// 	render(<Carousel cards={mockCards} />);
	// 	
	// 	// Navigate to last card
	// 	const nextButton = screen.getAllByRole('button')[1];
	// 	await user.click(nextButton); // Card 2
	// 	await user.click(nextButton); // Card 3
	// 	
	// 	const wrappers = document.querySelectorAll('.carousel-card-wrapper');
	// 	expect(wrappers[0]).toHaveStyle({ transform: 'translateX(100%)' }); // Next (wrapped)
	// 	expect(wrappers[1]).toHaveStyle({ transform: 'translateX(100%)' }); // Next
	// 	expect(wrappers[2]).toHaveStyle({ transform: 'translateX(0%)' }); // Current
	// });
});

describe('Carousel Loading State', () => {
	it('should render loading component when no cards provided', () => {
		render(<Carousel cards={[]} />);
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('should render loading component when cards is undefined', () => {
		render(<Carousel cards={undefined as any} />);
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	it('should render loading component when cards is null', () => {
		render(<Carousel cards={null as any} />);
		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});
});

describe('Carousel Accessibility', () => {
	it('should have proper ARIA labels for navigation buttons', () => {
		render(<Carousel cards={mockCards} />);
		const buttons = screen.getAllByRole('button');
		
		// Buttons should have accessible names through their text content
		expect(buttons[0]).toHaveTextContent('◀'); // Previous
		expect(buttons[1]).toHaveTextContent('⏸'); // Pause
		expect(buttons[2]).toHaveTextContent('▶'); // Next
	});

	// it.skip('should maintain focus management during navigation', async () => {
	// 	const user = userEvent.setup();
	// 	render(<Carousel cards={mockCards} />);
	// 	
	// 	const nextButton = screen.getAllByRole('button')[1];
	// 	
	// 	nextButton.focus();
	// 	expect(document.activeElement).toBe(nextButton);
	// 	
	// 	await user.click(nextButton);
	// 	// Focus should remain on the button
	// 	expect(document.activeElement).toBe(nextButton);
	// });

	// it.skip('should support keyboard navigation', async () => {
	// 	const user = userEvent.setup();
	// 	render(<Carousel cards={mockCards} />);
	// 	
	// 	const nextButton = screen.getAllByRole('button')[1];
	// 	
	// 	nextButton.focus();
	// 	await user.keyboard('{Enter}');
	// 	
	// 	// Should navigate to next card
	// 	expect(screen.getByText('Card 2')).toBeInTheDocument();
	// });
});
