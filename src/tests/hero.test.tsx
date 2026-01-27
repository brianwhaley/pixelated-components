import React from 'react';
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

	it('renders anchored variant and applies background image when requested', () => {
		const { container } = render(<Hero img="/images/test.jpg" variant="anchored" />);
		const section = container.querySelector('.hero') as HTMLElement;
		expect(section).not.toBeNull();
		expect(section.className).toMatch(/\banchored\b/);
		// the simplified implementation applies the image via backgroundImage
		expect(section.style.backgroundImage).toContain('/images/test.jpg');
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
});
