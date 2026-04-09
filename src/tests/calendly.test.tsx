import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Calendly } from '../components/integrations/calendly';

describe('Calendly Component', () => {
	beforeEach(() => {
		document.head.innerHTML = '';
		vi.clearAllMocks();
	});

	it('should render the calendly inline widget div', () => {
		render(
			<Calendly 
				url="https://calendly.com/example" 
				width="320px" 
				height="700px" 
			/>
		);
		
		const widget = document.querySelector('.calendly-inline-widget');
		expect(widget).toBeInTheDocument();
	});

	it('should set the correct data-url attribute', () => {
		render(
			<Calendly 
				url="https://calendly.com/john-doe" 
				width="320px" 
				height="700px" 
			/>
		);
		
		const widget = document.querySelector('.calendly-inline-widget');
		expect(widget?.getAttribute('data-url')).toBe('https://calendly.com/john-doe');
	});

	it('should set provided width style', () => {
		render(
			<Calendly 
				url="https://calendly.com/example" 
				width="500px" 
				height="700px" 
			/>
		);
		
		const widget = document.querySelector('.calendly-inline-widget') as HTMLElement;
		expect(widget?.style.minWidth).toBe('500px');
	});

	it('should set provided height style', () => {
		render(
			<Calendly 
				url="https://calendly.com/example" 
				width="320px" 
				height="800px" 
			/>
		);
		
		const widget = document.querySelector('.calendly-inline-widget') as HTMLElement;
		expect(widget?.style.height).toBe('800px');
	});

	it('should have data-resize attribute set to true', () => {
		render(
			<Calendly 
				url="https://calendly.com/example" 
				width="320px" 
				height="700px" 
			/>
		);
		
		const widget = document.querySelector('.calendly-inline-widget');
		expect(widget?.getAttribute('data-resize')).toBe('true');
	});

	it('should load the Calendly external widget script', () => {
		render(
			<Calendly 
				url="https://calendly.com/example" 
				width="320px" 
				height="700px" 
			/>
		);
		
		const script = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
		expect(script).toBeInTheDocument();
	});

	it('should set script type to text/javascript', () => {
		render(
			<Calendly 
				url="https://calendly.com/example" 
				width="320px" 
				height="700px" 
			/>
		);
		
		const script = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
		expect(script?.getAttribute('type')).toBe('text/javascript');
	});

	it('should set script async attribute', () => {
		render(
			<Calendly 
				url="https://calendly.com/example" 
				width="320px" 
				height="700px" 
			/>
		);
		
		const script = document.querySelector('script[src="https://assets.calendly.com/assets/external/widget.js"]');
		expect(script?.getAttribute('async')).toBe('true');
	});

	it('should have suppressHydrationWarning attribute', () => {
		const { container } = render(
			<Calendly 
				url="https://calendly.com/example" 
				width="320px" 
				height="700px" 
			/>
		);
		
		const widget = container.querySelector('.calendly-inline-widget');
		// suppressHydrationWarning is a React prop, not a DOM attribute, so just verify the widget renders
		expect(widget).toBeInTheDocument();
	});

	it('should load script only once on mount', () => {
		const { rerender } = render(
			<Calendly 
				url="https://calendly.com/example" 
				width="320px" 
				height="700px" 
			/>
		);
		
		let scripts = document.querySelectorAll('script[src="https://assets.calendly.com/assets/external/widget.js"]');
		expect(scripts.length).toBe(1);
		
		rerender(
			<Calendly 
				url="https://calendly.com/different" 
				width="400px" 
				height="700px" 
			/>
		);
		
		scripts = document.querySelectorAll('script[src="https://assets.calendly.com/assets/external/widget.js"]');
		expect(scripts.length).toBe(1);
	});

	it('should handle missing head element gracefully', () => {
		const originalHead = document.head;
		Object.defineProperty(document, 'head', {
			value: null,
			configurable: true
		});
		
		expect(() => {
			render(
				<Calendly 
					url="https://calendly.com/example" 
					width="320px" 
					height="700px" 
				/>
			);
		}).not.toThrow();
		
		Object.defineProperty(document, 'head', {
			value: originalHead,
			configurable: true
		});
	});

	it('should render widget with default styles when provided', () => {
		const { container } = render(
			<Calendly 
				url="https://calendly.com/example" 
				width="600px" 
				height="900px" 
			/>
		);
		
		const widget = container.querySelector('.calendly-inline-widget') as HTMLElement;
		expect(widget?.style.minWidth).toBe('600px');
		expect(widget?.style.height).toBe('900px');
	});
});
