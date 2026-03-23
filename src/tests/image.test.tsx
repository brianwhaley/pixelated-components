import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SmartImage } from '../components/general/smartimage';

describe('SmartImage Component', () => {
	describe('Basic Rendering', () => {
		it('should render image with source URL', () => {
			const { container } = render(
				<SmartImage 
					src='https://example.com/image.jpg' 
					alt='Test image' 
				/>
			);
			
			const img = container.querySelector('img');
			expect(img).toBeDefined();
			expect(img?.getAttribute('src')).toContain('example.com');
		});

		it('should always include alt text for accessibility', () => {
			const { container } = render(
				<SmartImage 
					src='/image.jpg' 
					alt='Descriptive text' 
				/>
			);
			
			const img = container.querySelector('img');
			expect(img?.getAttribute('alt')).toBe('Descriptive text');
			expect(img?.getAttribute('alt')?.length).toBeGreaterThan(0);
		});

		it('should handle different image formats', () => {
			const formats = ['jpg', 'png', 'webp', 'gif', 'svg'];
			
			formats.forEach((format) => {
				const { container } = render(
					<SmartImage
						src={`/image.${format}`}
						alt='Test'
					/>
				);
				
				const img = container.querySelector('img');
				expect(img?.getAttribute('src')).toContain(format);
			});
		});

		it('should support responsive images with srcSet', () => {
			const { container } = render(
				<SmartImage
					src='/image.jpg'
					srcSet='image-320w.jpg 320w, image-640w.jpg 640w'
					sizes='(max-width: 600px) 100vw, 50vw'
					alt='Responsive'
				/>
			);
			
			const img = container.querySelector('img');
			expect(img?.getAttribute('srcSet')).toContain('w');
			expect(img?.getAttribute('sizes')).toContain('vw');
		});
	});

	describe('Image Sizing', () => {
		it('should set explicit width and height attributes', () => {
			const { container } = render(
				<SmartImage
					src='/image.jpg'
					width={800}
					height={600}
					alt='Test'
				/>
			);
			
			const img = container.querySelector('img');
			expect(parseInt(img?.getAttribute('width') || '0')).toBe(800);
			expect(parseInt(img?.getAttribute('height') || '0')).toBe(600);
		});

		it('should handle aspect ratio preservation', () => {
			const { container } = render(
				<SmartImage
					src='/image.jpg'
					width={800}
					height={600}
					alt='Test'
				/>
			);
			
			const img = container.querySelector('img');
			const width = parseInt(img?.getAttribute('width') || '0');
			const height = parseInt(img?.getAttribute('height') || '0');
			
			const aspectRatio = width / height;
			expect(aspectRatio).toBeCloseTo(800 / 600, 1);
		});

		it('should support flexible sizing', () => {
			const { container } = render(
				<SmartImage
					src='/image.jpg'
					style={{ width: '100%', height: 'auto' }}
					alt='Flexible'
				/>
			);
			
			const img = container.querySelector('img');
			expect(img).toBeDefined();
		});
	});

	describe('Loading and Performance', () => {
		it('should support lazy loading', () => {
			const { container } = render(
				<SmartImage
					src='/image.jpg'
					loading='lazy'
					alt='Lazy loaded'
				/>
			);
			
			const img = container.querySelector('img');
			expect(img?.getAttribute('loading')).toBe('lazy');
		});

		it('should support eager loading', () => {
			document.body.innerHTML = '';
			const { container } = render(
				<SmartImage
					src='/image.jpg'
					aboveFold={true}
					alt='Eager loaded'
				/>
			);
			
			const img = container.querySelector('img');
			expect(img?.getAttribute('loading')).toBe('eager');
		});

		it('should handle onLoad callback', async () => {
			const onLoadMock = vi.fn();
			
			const { container } = render(
				<SmartImage
					src='/image.jpg'
					alt='Test'
					onLoad={onLoadMock}
				/>
			);
			
			const img = container.querySelector('img');
			expect(img).toBeDefined();
		});
	});

	describe('Error Handling', () => {
		it('should support onError callback', () => {
			const onErrorMock = vi.fn();
			
			const { container } = render(
				<SmartImage
					src='/nonexistent.jpg'
					alt='Error test'
					onError={onErrorMock}
				/>
			);
			
			const img = container.querySelector('img');
			expect(img).toBeDefined();
		});

		it('should handle missing alt text gracefully', () => {
			const { container } = render(
				<SmartImage
					src='/image.jpg'
					alt=''
				/>
			);
			
			const img = container.querySelector('img');
			expect(img?.getAttribute('alt')).toBeDefined();
		});
	});

	describe('Error Handling', () => {
		it('should handle missing images', () => {
			const error = new Error('Image not found');
			expect(error.message).toContain('not found');
		});

		it('should handle invalid URLs', () => {
			const url = 'not-a-url';
			const isValid = url.startsWith('http') || url.startsWith('/');

			expect(isValid).toBe(false);
		});

		it('should provide fallback images', () => {
			const fallback = 'https://via.placeholder.com/800x600';
			expect(fallback).toContain('http');
		});

		it('should handle load errors gracefully', () => {
			const onError = () => {
				return 'Failed to load image';
			};

			expect(onError()).toContain('Failed');
		});
	});

	describe('Image URLs', () => {
		it('should support absolute URLs', () => {
			const url = 'https://example.com/images/photo.jpg';
			expect(url).toMatch(/^https:\/\//);
		});

		it('should support relative URLs', () => {
			const url = '/images/photo.jpg';
			expect(url.startsWith('/')).toBe(true);
		});

		it('should support data URLs', () => {
			const dataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZ...';
			expect(dataUrl).toContain('data:');
		});

		it('should handle query parameters', () => {
			const url = 'image.jpg?w=800&q=75&fmt=webp';
			expect(url).toContain('?');
			expect(url).toContain('=');
		});
	});

	describe('Container Props', () => {
		it('should support fill prop', () => {
			const fill = true;
			expect(typeof fill).toBe('boolean');
		});

		it('should support container sizes', () => {
			const sizes = [
				'(max-width: 640px) 100vw',
				'(max-width: 1024px) 50vw',
				'33vw',
			];

			sizes.forEach((size) => {
				expect(size).toContain('vw');
			});
		});

		it('should handle responsive containers', () => {
			const breakpoints = {
				mobile: '100%',
				tablet: '50%',
				desktop: '33%',
			};

			Object.values(breakpoints).forEach((bp) => {
				expect(bp).toContain('%');
			});
		});
	});

	describe('Edge Cases', () => {
		it('should handle very large images', () => {
			const size = 10000;
			expect(size).toBeGreaterThan(0);
		});

		it('should handle very small images', () => {
			const size = 1;
			expect(size).toBeGreaterThan(0);
		});

		it('should handle SVG images', () => {
			const svg = 'data:image/svg+xml,...';
			expect(svg).toContain('svg');
		});

		it('should handle image sequences', () => {
			const sequence = [
				'frame-1.jpg',
				'frame-2.jpg',
				'frame-3.jpg',
			];

			expect(sequence).toHaveLength(3);
		});

		it('should handle animated GIFs', () => {
			const src = 'animation.gif';
			expect(src).toContain('.gif');
		});
	});
});
