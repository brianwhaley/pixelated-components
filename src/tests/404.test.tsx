import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FourOhFour } from '../components/general/404';

// Mock usePixelatedConfig
vi.mock('../components/config/config.client', () => ({
	usePixelatedConfig: () => ({
		cloudinary: {
			product_env: 'test-env',
			baseUrl: 'https://res.cloudinary.com',
			transforms: {}
		}
	})
}));

// Mock SmartImage component
vi.mock('../components/general/smartimage', () => ({
	SmartImage: ({ src, alt, title }: any) => (
		<img src={src} alt={alt} title={title} />
	)
}));

describe('FourOhFour Component', () => {
	const mockImages = [
		{ img: 'test1.jpg', text: 'Page Lost', description: 'This page was lost' },
		{ img: 'test2.jpg', text: 'Not Found', description: 'This page was not found' },
		{ img: 'test3.jpg', text: 'Missing', description: 'This page is missing' }
	];

	it('should render 404 page with heading', () => {
		render(<FourOhFour images={mockImages} />);
		
		const heading = screen.getByRole('heading', { level: 1 });
		expect(heading).toBeDefined();
		expect(heading?.textContent).toContain('404');
	});

	it('should render a link to home', () => {
		render(<FourOhFour images={mockImages} />);
		
		const homeLink = screen.getByRole('link', { name: /go home/i });
		expect(homeLink).toBeDefined();
		expect(homeLink?.getAttribute('href')).toBe('/');
	});

	it('should select a random image from the array', () => {
		const { container } = render(<FourOhFour images={mockImages} />);
		
		const img = container.querySelector('img');
		expect(img).toBeDefined();
		const imgSrc = img?.getAttribute('src') || img?.src;
		expect(imgSrc).toBeTruthy();
	});

	it('should display selected image text in heading', async () => {
		render(<FourOhFour images={mockImages} />);
		
		const heading = screen.getByRole('heading', { level: 1 });
		const textContent = heading?.textContent || '';
		
		const imageTexts = mockImages.map(img => img.text);
		const hasValidText = imageTexts.some(text => textContent.includes(text));
		expect(hasValidText).toBe(true);
	});

	it('should handle single image in array', () => {
		const singleImage = [{ img: 'single.jpg', text: 'Only One', description: 'The only image' }];
		render(<FourOhFour images={singleImage} />);
		
		const heading = screen.getByRole('heading', { level: 1 });
		expect(heading?.textContent).toContain('Only One');
	});

	it('should pass alt text to image', () => {
		const { container } = render(<FourOhFour images={mockImages} />);
		
		const img = container.querySelector('img');
		const altText = img?.getAttribute('alt');
		expect(altText).toBeDefined();
		expect(altText).toContain('Page Not Found');
	});

	it('should have proper link attributes (target and rel)', () => {
		render(<FourOhFour images={mockImages} />);
		
		const homeLink = screen.getByRole('link');
		expect(homeLink?.getAttribute('target')).toBe('_self');
		expect(homeLink?.getAttribute('rel')).toBe('noopener noreferrer');
	});
});
