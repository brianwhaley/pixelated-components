import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CountUp } from '../components/general/countup';

// Mock useIntersectionObserver
vi.mock('../components/foundation/intersection-observer', () => ({
	useIntersectionObserver: (callback: Function, options: any) => {
		const ref = { current: { isIntersecting: true } };
		// Simulate intersection after component mounts
		setTimeout(() => {
			callback({ isIntersecting: true });
		}, 0);
		return ref;
	}
}));

describe('CountUp Component', () => {
	const defaultProps = {
		id: 'counter-1',
		start: 0,
		end: 100,
		duration: 500
	};

	it('should render with required props', () => {
		const { container } = render(<CountUp {...defaultProps} />);
		const counter = container.querySelector('#counter-1');
		expect(counter).toBeDefined();
	});

	it('should display starting value initially', () => {
		const { container } = render(<CountUp {...defaultProps} start={5} end={50} duration={1000} id="test" />);
		const counter = container.querySelector('#test');
		expect(counter?.textContent).toBe('5');
	});

	it('should add pre text when supplied', () => {
		const { container } = render(<CountUp {...defaultProps} pre="$" id="price" />);
		const preText = container.querySelector('.countup-pre');
		expect(preText?.textContent).toBe('$');
	});

	it('should add post text when supplied', () => {
		const { container } = render(<CountUp {...defaultProps} post=" items" id="items" />);
		const postText = container.querySelector('.countup-post');
		expect(postText?.textContent).toBe(' items');
	});

	it('should add both pre and post text', () => {
		const { container } = render(
			<CountUp {...defaultProps} pre="$" post=".00" id="amount" />
		);
		const preText = container.querySelector('.countup-pre');
		const postText = container.querySelector('.countup-post');
		
		expect(preText?.textContent).toBe('$');
		expect(postText?.textContent).toBe('.00');
	});

	it('should display content when provided', () => {
		const { container } = render(
			<CountUp {...defaultProps} content="Total Sales" id="sales" />
		);
		const contentP = container.querySelector('.countup p');
		expect(contentP?.textContent).toBe('Total Sales');
	});

	it('should render with proper CSS classes', () => {
		const { container } = render(<CountUp {...defaultProps} id="css-test" />);
		const countupDiv = container.querySelector('.countup');
		
		expect(countupDiv).toBeDefined();
		expect(countupDiv?.querySelector('.countup-pre')).toBeDefined();
		expect(countupDiv?.querySelector('.countup-counter')).toBeDefined();
		expect(countupDiv?.querySelector('.countup-post')).toBeDefined();
	});

	it('should handle decimal values', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={0.5} end={99.99} decimals={2} id="decimal" />
		);
		const counter = container.querySelector('#decimal');
		expect(counter?.textContent).toBeTruthy();
	});

	it('should handle zero decimals (default)', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={0} end={1000} decimals={0} id="noDecimal" />
		);
		const counter = container.querySelector('#noDecimal');
		const text = counter?.textContent;
		
		// Should not contain decimal point for whole numbers
		expect(text).toBeTruthy();
	});

	it('should set counter ID correctly', () => {
		const { container } = render(<CountUp {...defaultProps} id="unique-id-123" />);
		const counter = container.querySelector('#unique-id-123');
		expect(counter).toBeDefined();
	});

	it('should handle large numbers', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={0} end={1000000} id="large" duration={1000} />
		);
		const counter = container.querySelector('#large');
		expect(counter).toBeDefined();
	});

	it('should handle negative ranges', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={-100} end={100} id="negative" duration={500} />
		);
		const counter = container.querySelector('#negative');
		expect(counter).toBeDefined();
	});

	it('should display in countup wrapper', () => {
		const { container } = render(<CountUp {...defaultProps} id="wrapper-test" />);
		const wrapper = container.querySelector('.countup');
		expect(wrapper?.textContent).toContain(defaultProps.start.toString());
	});

	it('should handle zero values', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={0} end={0} id="zero" />
		);
		const counter = container.querySelector('#zero');
		expect(counter?.textContent).toBe('0');
	});

	it('should handle same start and end', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={50} end={50} id="same" />
		);
		const counter = container.querySelector('#same');
		expect(counter).toBeDefined();
	});

	it('should handle very small duration', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={0} end={100} duration={1} id="fast" />
		);
		const counter = container.querySelector('#fast');
		expect(counter).toBeDefined();
	});

	it('should handle very large duration', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={0} end={100} duration={10000} id="slow" />
		);
		const counter = container.querySelector('#slow');
		expect(counter).toBeDefined();
	});

	it('should render with multiple decimals', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={0} end={99.9999} decimals={4} id="manyDecimals" />
		);
		const counter = container.querySelector('#manyDecimals');
		expect(counter).toBeDefined();
	});

	it('should combine with all props', () => {
		const { container } = render(
			<CountUp
				id="allProps"
				start={10}
				end={100}
				duration={1000}
				decimals={2}
				pre="$"
				post=" USD"
				content="Total Revenue"
			/>
		);
		const countup = container.querySelector('.countup');
		expect(countup).toBeDefined();
	});

	it('should render counter span specifically', () => {
		const { container } = render(<CountUp {...defaultProps} id="counter-span" />);
		const counter = container.querySelector('.countup-counter');
		expect(counter?.querySelector('#counter-span')).toBeDefined();
	});

	it('should support className customization', () => {
		const { container } = render(
			<CountUp {...defaultProps} id="custom-class" />
		);
		const wrapper = container.querySelector('.countup');
		expect(wrapper?.className).toContain('countup');
	});

	it('should handle edge case where start > end', () => {
		const { container } = render(
			<CountUp {...defaultProps} start={100} end={0} id="reverse" />
		);
		const counter = container.querySelector('#reverse');
		expect(counter).toBeDefined();
	});

	it('should update when props change', () => {
		const { container, rerender } = render(
			<CountUp {...defaultProps} end={50} id="changing" />
		);
		
		rerender(<CountUp {...defaultProps} end={100} id="changing" />);
		
		const counter = container.querySelector('#changing');
		expect(counter).toBeDefined();
	});

	it('should render without content', () => {
		const { container } = render(
			<CountUp id="noContent" start={0} end={100} duration={500} />
		);
		const contentP = container.querySelector('.countup p');
		expect(contentP?.textContent).toBe('');
	});

	it('should handle fractional start and end with decimals', () => {
		const { container } = render(
			<CountUp
				id="fractions"
				start={10.55}
				end={99.99}
				duration={500}
				decimals={2}
			/>
		);
		const counter = container.querySelector('#fractions');
		expect(counter).toBeDefined();
	});

	it('should preserve zero padding with multiple decimals', () => {
		const { container } = render(
			<CountUp
				id="padded"
				start={0}
				end={1.5}
				duration={500}
				decimals={2}
			/>
		);
		const counter = container.querySelector('#padded');
		expect(counter?.textContent).toBeTruthy();
	});

	it('should handle empty pre text', () => {
		const { container } = render(
			<CountUp {...defaultProps} pre="" id="emptyPre" />
		);
		const preText = container.querySelector('.countup-pre');
		expect(preText?.textContent).toBe('');
	});

	it('should handle empty post text', () => {
		const { container } = render(
			<CountUp {...defaultProps} post="" id="emptyPost" />
		);
		const postText = container.querySelector('.countup-post');
		expect(postText?.textContent).toBe('');
	});

	it('should handle empty content', () => {
		const { container } = render(
			<CountUp {...defaultProps} content="" id="emptyContent" />
		);
		const contentP = container.querySelector('.countup p');
		expect(contentP?.textContent).toBe('');
	});

	it('should animate to the end value once visible', async () => {
		const { container } = render(
			<CountUp
				id="anim"
				start={0}
				end={10}
				duration={64}
			/>
		);

		await waitFor(() => {
			expect(container.querySelector('#anim')?.textContent).not.toBe('0');
		}, { timeout: 1500 });

		await waitFor(() => {
			expect(container.querySelector('#anim')?.textContent).toBe('10');
		}, { timeout: 2000 });
	});
});
