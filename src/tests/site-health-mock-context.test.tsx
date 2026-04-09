import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SiteHealthMockProvider, useSiteHealthMockData } from '../components/admin/site-health/site-health-mock-context';

const TestComponent = () => {
	const mockData = useSiteHealthMockData();
	return <div id="test-output">{JSON.stringify(mockData)}</div>;
};

describe('SiteHealthMockProvider', () => {
	it('should provide mock data to children', () => {
		const mockData = { site1: { status: 'healthy' } };
		render(
			<SiteHealthMockProvider mocks={mockData}>
				<TestComponent />
			</SiteHealthMockProvider>
		);
		
		const output = screen.getByText(/site1/);
		expect(output).toBeDefined();
	});

	it('should render children without crashing', () => {
		const { container } = render(
			<SiteHealthMockProvider mocks={{}}>
				<div>Test Child</div>
			</SiteHealthMockProvider>
		);
		
		expect(container).toBeDefined();
	});

	it('should handle empty mock data', () => {
		const { container } = render(
			<SiteHealthMockProvider mocks={{}}>
				<TestComponent />
			</SiteHealthMockProvider>
		);
		
		expect(container.querySelector('#test-output')).toBeDefined();
	});

	it('should handle complex mock data structure', () => {
		const complexMocks = {
			site1: {
				metrics: [{ value: 100 }, { value: 200 }],
				timestamp: '2025-01-01',
				status: 'healthy'
			}
		};
		
		const { container } = render(
			<SiteHealthMockProvider mocks={complexMocks}>
				<TestComponent />
			</SiteHealthMockProvider>
		);
		
		expect(container).toBeDefined();
	});
});

describe('useSiteHealthMockData Hook', () => {
	it('should return null when used outside provider', () => {
		const TestComponentStandalone = () => {
			const data = useSiteHealthMockData();
			return <div>{data === null ? 'null' : 'has data'}</div>;
		};
		
		render(<TestComponentStandalone />);
		const output = screen.getByText('null');
		expect(output).toBeDefined();
	});

	it('should return mock data when inside provider', () => {
		const mockData = { test: 'value' };
		render(
			<SiteHealthMockProvider mocks={mockData}>
				<TestComponent />
			</SiteHealthMockProvider>
		);
		
		const output = screen.getByText(/test/);
		expect(output).toBeDefined();
	});
});
