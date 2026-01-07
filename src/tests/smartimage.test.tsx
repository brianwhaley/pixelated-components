import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SmartImage } from '@/components/general/smartimage';

// Mock the usePixelatedConfig hook
vi.mock('@/components/config/config.client', () => ({
usePixelatedConfig: vi.fn(),
}));

// Mock the buildCloudinaryUrl function
vi.mock('@/components/general/cloudinary', () => ({
buildCloudinaryUrl: vi.fn(),
}));

import { usePixelatedConfig } from '@/components/config/config.client';
import { buildCloudinaryUrl } from '@/components/general/cloudinary';

const mockUsePixelatedConfig = vi.mocked(usePixelatedConfig);
const mockBuildCloudinaryUrl = vi.mocked(buildCloudinaryUrl);

describe('SmartImage Component', () => {
	beforeEach(() => {
		// Reset mocks
		vi.clearAllMocks();

		// Default mock config
		mockUsePixelatedConfig.mockReturnValue({
cloudinary: {
product_env: 'test-env',
baseUrl: 'https://res.cloudinary.com/test/',
transforms: 'f_auto,c_limit,q_auto,dpr_auto',
},
});

		// Default mock Cloudinary URL builder
		mockBuildCloudinaryUrl.mockReturnValue('https://res.cloudinary.com/test/image/upload/f_auto,c_limit,q_75/https://example.com/test-image.jpg');
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Basic Rendering', () => {
		it('should render an image element', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" />);
			const img = screen.getByAltText('Test image');
			expect(img).toBeInTheDocument();
		});

		it('should apply alt text correctly', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Descriptive alt text" />);
			const img = screen.getByAltText('Descriptive alt text');
			expect(img).toBeInTheDocument();
		});

		it('should set default dimensions', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" />);
			const img = screen.getByAltText('Test image');
			expect(img).toHaveAttribute('width', '500');
			expect(img).toHaveAttribute('height', '500');
		});

		it('should accept custom dimensions', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" width={800} height={600} />);
			const img = screen.getByAltText('Test image');
			expect(img).toHaveAttribute('width', '800');
			expect(img).toHaveAttribute('height', '600');
		});
	});

	describe('Variants', () => {
		it('should render plain img tag for img variant', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="img" />);
			const img = screen.getByAltText('Test image');
			expect(img.tagName).toBe('IMG');
			expect(img).not.toHaveAttribute('data-nimg');
		});

		it('should use Next.js Image for nextjs variant', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="nextjs" />);
			const img = screen.getByAltText('Test image');
			expect(img).toHaveAttribute('data-nimg');
		});

		it('should use Cloudinary for cloudinary variant when config available', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="cloudinary" />);
			expect(mockBuildCloudinaryUrl).toHaveBeenCalled();
		});

		it('should not use Cloudinary for img variant', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="img" />);
			expect(mockBuildCloudinaryUrl).not.toHaveBeenCalled();
		});

		it('should not use Cloudinary for nextjs variant', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="nextjs" />);
			expect(mockBuildCloudinaryUrl).not.toHaveBeenCalled();
		});

		it('should use Cloudinary URLs with Next.js Image for cloudinary variant', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="cloudinary" />);
			const img = screen.getByAltText('Test image');
			expect(img).toHaveAttribute('data-nimg');
			expect(mockBuildCloudinaryUrl).toHaveBeenCalledWith({
				src: 'https://example.com/test-image.jpg',
				productEnv: 'test-env',
				cloudinaryDomain: 'https://res.cloudinary.com/test/',
				quality: 75,
				width: 500,
				transforms: 'f_auto,c_limit,q_auto,dpr_auto',
			});
		});

		it('should fall back to Next.js Image when Cloudinary config unavailable for cloudinary variant', () => {
			mockUsePixelatedConfig.mockReturnValue({});
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="cloudinary" />);
			const img = screen.getByAltText('Test image');
			expect(img).toHaveAttribute('data-nimg');
			expect(mockBuildCloudinaryUrl).not.toHaveBeenCalled();
		});

		it('should default to cloudinary variant when no variant specified', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" />);
			expect(mockBuildCloudinaryUrl).toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('should mark decorative images correctly', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="" variant="img" />);
			const img = screen.getByAltText('');
			expect(img).toHaveAttribute('aria-hidden', 'true');
			expect(img).toHaveAttribute('role', 'presentation');
		});
	});

	describe('Performance', () => {
		it('should set loading to eager for aboveFold images', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" aboveFold variant="img" />);
			const img = screen.getByAltText('Test image');
			expect(img).toHaveAttribute('loading', 'eager');
			expect(img).toHaveAttribute('fetchpriority', 'high');
		});
	});

	describe('Error Boundaries', () => {
		let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
		});

		afterEach(() => {
			consoleWarnSpy.mockRestore();
		});

		it('should fall back from cloudinary to nextjs on error', async () => {
			const { rerender } = render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="cloudinary" />);
			
			// Initially should use Cloudinary
			expect(mockBuildCloudinaryUrl).toHaveBeenCalled();
			
			// Simulate error on the img element
			const img = screen.getByAltText('Test image');
			fireEvent.error(img);
			
			// Should log warning and fall back to nextjs
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'SmartImage: Cloudinary variant failed for "https://example.com/test-image.jpg", falling back to Next.js Image',
				expect.any(Object) // SyntheticBaseEvent
			);
			
			// Re-render to check new state
			rerender(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="cloudinary" />);
			
			// Should now use Next.js Image (data-nimg attribute)
			const updatedImg = screen.getByAltText('Test image');
			expect(updatedImg).toHaveAttribute('data-nimg');
		});

		it('should fall back from nextjs to img on error', async () => {
			const { rerender } = render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="nextjs" />);
			
			// Initially should use Next.js Image
			const img = screen.getByAltText('Test image');
			expect(img).toHaveAttribute('data-nimg');
			
			// Simulate error
			fireEvent.error(img);
			
			// Should log warning and fall back to img
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				'SmartImage: Next.js Image variant failed for "https://example.com/test-image.jpg", falling back to HTML img',
				expect.any(Object) // SyntheticBaseEvent
			);
			
			// Re-render to check new state
			rerender(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="nextjs" />);
			
			// Should now use plain img (no data-nimg)
			const updatedImg = screen.getByAltText('Test image');
			expect(updatedImg.tagName).toBe('IMG');
			expect(updatedImg).not.toHaveAttribute('data-nimg');
		});

		it('should not fall back from img variant (final fallback)', () => {
			render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="img" />);
			
			const img = screen.getByAltText('Test image');
			expect(img.tagName).toBe('IMG');
			
			// Simulate error - should not log anything since img is final fallback
			fireEvent.error(img);
			
			expect(consoleWarnSpy).not.toHaveBeenCalled();
		});

		it('should reset fallback state when src changes', () => {
			const { rerender } = render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="cloudinary" />);
			
			// Trigger fallback
			const img = screen.getByAltText('Test image');
			fireEvent.error(img);
			
			expect(consoleWarnSpy).toHaveBeenCalledWith(
				expect.stringContaining('falling back to Next.js Image'),
				expect.any(Object) // SyntheticBaseEvent
			);
			
			// Change src - should reset to cloudinary
			rerender(<SmartImage src="https://example.com/different-image.jpg" alt="Test image" variant="cloudinary" />);
			
			// Should be back to cloudinary (buildCloudinaryUrl called for new src)
			expect(mockBuildCloudinaryUrl).toHaveBeenCalledWith({
				src: 'https://example.com/different-image.jpg',
				productEnv: 'test-env',
				cloudinaryDomain: 'https://res.cloudinary.com/test/',
				quality: 75,
				width: 500,
				transforms: 'f_auto,c_limit,q_auto,dpr_auto',
			});
		});

		it('should reset fallback state when variant prop changes', () => {
			const { rerender } = render(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="cloudinary" />);
			
			// Trigger fallback
			const img = screen.getByAltText('Test image');
			fireEvent.error(img);
			
			// Change variant prop - should reset
			rerender(<SmartImage src="https://example.com/test-image.jpg" alt="Test image" variant="nextjs" />);
			
			// Should use Next.js Image directly (not fallen back)
			const updatedImg = screen.getByAltText('Test image');
			expect(updatedImg).toHaveAttribute('data-nimg');
		});
	});
});
