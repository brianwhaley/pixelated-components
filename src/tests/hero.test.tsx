/// <reference types="vitest" />
import React from 'react';
// stub entire components package so we don't load compiled dist files (404.js import causes missing CSS error)
vi.mock('@pixelated-tech/components', () => ({
	SmartImage: (props: any) => <img {...props} />,
}));
import { render, screen } from '@testing-library/react';
import { Hero } from '@/components/general/hero';

describe('Hero (unit)', () => {
	it('applies background image from `img` prop', () => {
		const { container } = render(<Hero img="/images/test.jpg" />);
		const section = container.querySelector('.hero') as HTMLElement;
		expect(section).not.toBeNull();
		expect(section.style.backgroundImage).toContain('/images/test.jpg');
	});

	it('defaults to static variant when none provided', () => {
		const { container } = render(<Hero img="/images/test.jpg" />);
		const section = container.querySelector('.hero');
		expect(section).not.toBeNull();
		expect(section!.className).toMatch(/\bstatic\b/);
		expect(section!.className).not.toMatch(/\banchored\b/);
	});

	it('renders anchored variant (no background-image check)', () => {
		const { container } = render(<Hero img="/images/test.jpg" variant="anchored" />);
		const section = container.querySelector('.hero') as HTMLElement;
		expect(section).not.toBeNull();
		expect(section.className).toMatch(/\banchored\b/);
		// styled behavior for anchored is handled by CSS, not inline style
	});

	it('supports anchored sticky variant (class present)', () => {
		const { container } = render(<Hero img="/images/test.jpg" variant="anchored" />);
		const section = container.querySelector('.hero') as HTMLElement;
		expect(section).not.toBeNull();
		expect(section.className).toMatch(/\banchored\b/);
	});

	it('background anchored does not render an extra img element', () => {
		render(<Hero img="/images/test.jpg" variant="anchored" />);
		const img = screen.queryByRole('img');
		// current implementation uses background-image; no separate img expected
		expect(img).toBeNull();
	});

		it('renders video variant with video element and no background-image', () => {
			const { container } = render(
				<Hero variant="video" video="/videos/clip.mp4" videoPoster="/videos/poster.jpg" />
			);
			const section = container.querySelector('.hero.video') as HTMLElement;
			expect(section).not.toBeNull();
			// style should not include background-image when video is used
			expect(section.style.backgroundImage).toBe('');
			const videoEl = container.querySelector('video') as HTMLVideoElement;
			expect(videoEl).not.toBeNull();
			expect(videoEl.src).toContain('/videos/clip.mp4');
			expect(videoEl.getAttribute('poster')).toContain('/videos/poster.jpg');
		});
});
