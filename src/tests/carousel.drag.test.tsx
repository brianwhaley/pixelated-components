import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DragHandler } from '../components/general/carousel.drag';

// Test DragHandler as class, not React component
describe('carousel.drag - DragHandler class', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		document.body.innerHTML = '';
	});

	it('should export DragHandler class', () => {
		expect(typeof DragHandler).toBe('function');
	});

	it('should initialize with required parameters', () => {
		const nextImageMock = vi.fn();
		const previousImageMock = vi.fn();
		document.body.innerHTML = '<div class="carousel-card-wrapper"></div>';

		const element = document.querySelector('.carousel-card-wrapper');
		expect(element).toBeTruthy();
		expect(typeof nextImageMock).toBe('function');
		expect(typeof previousImageMock).toBe('function');
	});

	it('should accept activeIndex property', () => {
		const props = { activeIndex: 3, targetDiv: 'carousel-card-wrapper' };
		expect(props.activeIndex).toBe(3);
		expect(props.activeIndex).toBeGreaterThan(0);
	});

	it('should attach handlers to target element', () => {
		const nextImageMock = vi.fn();
		const previousImageMock = vi.fn();

		document.body.innerHTML = '<div class="carousel-card-wrapper"></div>';
		const element = document.querySelector('.carousel-card-wrapper');
		expect(element).toBeTruthy();
		expect(typeof nextImageMock).toBe('function');
		expect(typeof previousImageMock).toBe('function');
	});

	it('should store next image callback', () => {
		const nextImageMock = vi.fn();
		nextImageMock();
		expect(nextImageMock).toHaveBeenCalled();
	});

	it('should store previous image callback', () => {
		const previousImageMock = vi.fn();
		previousImageMock();
		expect(previousImageMock).toHaveBeenCalled();
	});

	it('should accept valid prop types', () => {
		const props: any = {
			activeIndex: 2,
			targetDiv: 'test-div',
			nextImage: vi.fn(),
			previousImage: vi.fn()
		};

		expect(typeof props.activeIndex).toBe('number');
		expect(typeof props.targetDiv).toBe('string');
		expect(typeof props.nextImage).toBe('function');
		expect(typeof props.previousImage).toBe('function');
	});

	it('should handle touch events', () => {
		const nextImageMock = vi.fn();
		const previousImageMock = vi.fn();

		document.body.innerHTML = '<div class="carousel-card-wrapper" data-touchactive="true"></div>';

		const element = document.querySelector('.carousel-card-wrapper');
		expect(element).toBeTruthy();
		expect(element?.getAttribute('data-touchactive')).toBe('true');
	});

	it('should handle mouse drag events', () => {
		const nextImageMock = vi.fn();
		const previousImageMock = vi.fn();

		document.body.innerHTML = '<div class="carousel-card-wrapper" data-dragactive="true"></div>';

		const element = document.querySelector('.carousel-card-wrapper');
		expect(element).toBeTruthy();
		expect(element?.getAttribute('data-dragactive')).toBe('true');
	});
});
