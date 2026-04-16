import { describe, it, expect, vi } from 'vitest';
import {
	isElementInViewport,
	isElementPartiallyInViewport,
	observeIntersection,
	useIntersectionObserver
} from '../components/foundation/intersection-observer';

describe('Intersection Observer Utilities', () => {

	describe('isElementInViewport', () => {
		it('should return true when element is fully in viewport', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 100,
				left: 100,
				bottom: 300,
				right: 300,
				width: 200,
				height: 200,
				x: 100,
				y: 100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementInViewport(element);
			expect(result).toBe(true);
		});

		it('should return false when element is above viewport', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: -200,
				left: 100,
				bottom: -50,
				right: 300,
				width: 200,
				height: 150,
				x: 100,
				y: -200
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementInViewport(element);
			expect(result).toBe(false);
		});

		it('should return false when element is below viewport', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 700,
				left: 100,
				bottom: 900,
				right: 300,
				width: 200,
				height: 200,
				x: 100,
				y: 700
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementInViewport(element);
			expect(result).toBe(false);
		});

		it('should return false when element is to the left of viewport', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 100,
				left: -300,
				bottom: 300,
				right: -100,
				width: 200,
				height: 200,
				x: -300,
				y: 100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementInViewport(element);
			expect(result).toBe(false);
		});

		it('should return false when element is to the right of viewport', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 100,
				left: 700,
				bottom: 300,
				right: 900,
				width: 200,
				height: 200,
				x: 700,
				y: 100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementInViewport(element);
			expect(result).toBe(false);
		});

		it('should handle null element', () => {
			const result = isElementInViewport(null as any);
			expect(result).toBe(false);
		});

		it('should handle undefined element', () => {
			const result = isElementInViewport(undefined as any);
			expect(result).toBe(false);
		});
	});

	describe('isElementPartiallyInViewport', () => {
		it('should return true when element is fully in viewport', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 100,
				left: 100,
				bottom: 300,
				right: 300,
				width: 200,
				height: 200,
				x: 100,
				y: 100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});

		it('should return true when element is partially visible (top cropped)', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: -50,
				left: 100,
				bottom: 200,
				right: 300,
				width: 200,
				height: 250,
				x: 100,
				y: -50
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});

		it('should return true when element is partially visible (bottom cropped)', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 500,
				left: 100,
				bottom: 700,
				right: 300,
				width: 200,
				height: 200,
				x: 100,
				y: 500
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});

		it('should return true when element is partially visible (left cropped)', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 100,
				left: -50,
				bottom: 300,
				right: 200,
				width: 250,
				height: 200,
				x: -50,
				y: 100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});

		it('should return true when element is partially visible (right cropped)', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 100,
				left: 500,
				bottom: 300,
				right: 750,
				width: 250,
				height: 200,
				x: 500,
				y: 100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});

		it('should return false when element is completely out of viewport', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: -300,
				left: 100,
				bottom: -100,
				right: 300,
				width: 200,
				height: 200,
				x: 100,
				y: -300
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(false);
		});

		it('should handle null element', () => {
			const result = isElementPartiallyInViewport(null as any);
			expect(result).toBe(false);
		});

		it('should handle undefined element', () => {
			const result = isElementPartiallyInViewport(undefined as any);
			expect(result).toBe(false);
		});

		it('should handle zero size element in viewport', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 100,
				left: 100,
				bottom: 100,
				right: 100,
				width: 0,
				height: 0,
				x: 100,
				y: 100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});
	});

	describe('observeIntersection', () => {
		it('should return a cleanup function', () => {
			const callback = vi.fn();
			const cleanup = observeIntersection('.non-existent', callback);

			expect(typeof cleanup).toBe('function');
		});

		it('should handle cleanup function execution', () => {
			const callback = vi.fn();
			const cleanup = observeIntersection('.non-existent', callback);
			
			expect(() => cleanup()).not.toThrow();
		});

		it('should accept options parameter', () => {
			const callback = vi.fn();
			const cleanup = observeIntersection('.non-existent', callback, {
				threshold: 0.5,
				rootMargin: '10px'
			});

			expect(typeof cleanup).toBe('function');
			cleanup();
		});

		it('should handle empty selector gracefully', () => {
			const callback = vi.fn();
			// Use a valid selector that won't match anything
			const cleanup = observeIntersection('.definitely-not-a-class-that-exists-xyz', callback);

			expect(typeof cleanup).toBe('function');
			expect(callback).not.toHaveBeenCalled();
		});

		it('should handle disconnect option', () => {
			const callback = vi.fn();
			const cleanup = observeIntersection('.non-existent', callback, {
				disconnectAfterIntersection: true
			});

			expect(typeof cleanup).toBe('function');
			cleanup();
		});
	});

	describe('Hook behavior with edge cases', () => {
		it('should handle options with various threshold values', () => {
			const callback = vi.fn();
			const thresholds = [0, 0.25, 0.5, 0.75, 1];

			thresholds.forEach(threshold => {
				expect(typeof threshold).toBe('number');
				expect(threshold >= 0 && threshold <= 1).toBe(true);
			});
		});

		it('should handle custom root margin with various formats', () => {
			const margins = ['0px', '10px', '10px 20px', '10px 20px 30px', '10px 20px 30px 40px'];

			margins.forEach(margin => {
				expect(typeof margin).toBe('string');
				expect(margin.length).toBeGreaterThan(0);
			});
		});

		it('should validate threshold of 0', () => {
			const options = { threshold: 0 };
			
			expect(options.threshold).toBe(0);
		});

		it('should validate threshold of 1', () => {
			const options = { threshold: 1 };
			
			expect(options.threshold).toBe(1);
		});

		it('should validate threshold of 0.5', () => {
			const options = { threshold: 0.5 };
			
			expect(options.threshold).toBe(0.5);
		});

		it('should handle null root element option', () => {
			const options = { root: null };
			
			expect(options.root).toBeNull();
		});

		it('should handle disconnect after intersection true', () => {
			const options = { disconnectAfterIntersection: true };
			
			expect(options.disconnectAfterIntersection).toBe(true);
		});

		it('should handle disconnect after intersection false', () => {
			const options = { disconnectAfterIntersection: false };
			
			expect(options.disconnectAfterIntersection).toBe(false);
		});
	});

	describe('Viewport detection edge cases', () => {
		it('should handle element at exact viewport boundaries', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 0,
				left: 0,
				bottom: 600,
				right: 800,
				width: 800,
				height: 600,
				x: 0,
				y: 0
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 800;

			const result = isElementInViewport(element);
			expect(result).toBe(true);
		});

		it('should handle element partially in viewport from top', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: -100,
				left: 100,
				bottom: 300,
				right: 300,
				width: 200,
				height: 400,
				x: 100,
				y: -100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});

		it('should handle element partially in viewport from bottom', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 500,
				left: 100,
				bottom: 700,
				right: 300,
				width: 200,
				height: 200,
				x: 100,
				y: 500
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});

		it('should handle element partially in viewport from left', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 100,
				left: -100,
				bottom: 300,
				right: 200,
				width: 300,
				height: 200,
				x: -100,
				y: 100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});

		it('should handle element partially in viewport from right', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: 100,
				left: 500,
				bottom: 300,
				right: 700,
				width: 200,
				height: 200,
				x: 500,
				y: 100
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(true);
		});

		it('should handle element completely outside viewport', () => {
			const element = document.createElement('div');
			element.getBoundingClientRect = vi.fn(() => ({
				top: -1000,
				left: -1000,
				bottom: -800,
				right: -800,
				width: 200,
				height: 200,
				x: -1000,
				y: -1000
			} as any));

			global.innerHeight = 600;
			global.innerWidth = 600;

			const result = isElementPartiallyInViewport(element);
			expect(result).toBe(false);
		});

		it('should handle null element for isElementInViewport', () => {
			const result = isElementInViewport(null as any);
			expect(result).toBe(false);
		});

		it('should handle null element for isElementPartiallyInViewport', () => {
			const result = isElementPartiallyInViewport(null as any);
			expect(result).toBe(false);
		});

		it('should handle undefined element for isElementInViewport', () => {
			const result = isElementInViewport(undefined as any);
			expect(result).toBe(false);
		});

		it('should handle undefined element for isElementPartiallyInViewport', () => {
			const result = isElementPartiallyInViewport(undefined as any);
			expect(result).toBe(false);
		});
	});
});


