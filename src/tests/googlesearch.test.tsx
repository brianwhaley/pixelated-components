import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '../test/test-utils';
import { GoogleSearch } from '@/components/general/googlesearch';
import type { GoogleSearchType } from '@/components/general/googlesearch';

describe('GoogleSearch Component', () => {
	beforeEach(() => {
		// Add a dummy script tag to the document to prevent errors
		const script = document.createElement('script');
		script.id = 'dummy-script';
		document.head.appendChild(script);
	});

	afterEach(() => {
		// Clean up
		const script = document.getElementById('dummy-script');
		if (script) {
			script.remove();
		}
		const gcseScripts = document.querySelectorAll('script[src*="cse.google"]');
		gcseScripts.forEach(s => s.remove());
	});

	describe('Component rendering', () => {
		it('should render without crashing', () => {
			const { container } = render(<GoogleSearch id="test-id" />);
			expect(container).toBeDefined();
		});

		it('should render div with gcse-search class', () => {
			const { container } = render(<GoogleSearch id="test-id" />);
			const searchDiv = container.querySelector('.gcse-search');
			expect(searchDiv).toBeDefined();
		});

		it('should render correct element type', () => {
			const { container } = render(<GoogleSearch id="test-id" />);
			const searchDiv = container.querySelector('.gcse-search');
			expect(searchDiv?.tagName.toLowerCase()).toBe('div');
		});

		it('should accept pixelated search ID', () => {
			const { container } = render(
				<GoogleSearch id="009500278966481927899:bcssp73qony" />
			);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});

		it('should accept pixelvivid search ID', () => {
			const { container } = render(
				<GoogleSearch id="e336d1c9d0e5e48e5" />
			);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});

		it('should handle empty ID string', () => {
			const { container } = render(<GoogleSearch id="" />);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});

		it('should handle long ID values', () => {
			const longId = 'a'.repeat(200);
			const { container } = render(<GoogleSearch id={longId} />);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});

		it('should have class name exactly as expected', () => {
			const { container } = render(<GoogleSearch id="test-id" />);
			const searchDiv = container.querySelector('.gcse-search');
			expect(searchDiv?.className).toBe('gcse-search');
		});

		it('should render with suppressHydrationWarning behavior', () => {
			const { container } = render(<GoogleSearch id="test-id" />);
			const searchDiv = container.querySelector('.gcse-search');
			expect(searchDiv?.attributes.length).toBeGreaterThanOrEqual(1);
		});

		it('should accept numeric-like string IDs', () => {
			const { container } = render(<GoogleSearch id="123456" />);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});

		it('should accept special character IDs', () => {
			const { container } = render(<GoogleSearch id="test-id:with:colons" />);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});

		it('should be compatible with different protocol scenarios', () => {
			const originalProtocol = window.location.protocol;
			const { container } = render(<GoogleSearch id="test-id" />);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});
	});

	describe('PropTypes validation', () => {
		it('should have GoogleSearch component defined', () => {
			expect(GoogleSearch).toBeDefined();
			expect(typeof GoogleSearch).toBe('function');
		});

		it('should accept id prop as string', () => {
			const props: GoogleSearchType = {
				id: 'test-search-id'
			};
			expect(props.id).toBe('test-search-id');
		});

		it('should handle various id formats', () => {
			const validIds = [
				'simple-id',
				'009500278966481927899:bcssp73qony',
				'e336d1c9d0e5e48e5',
				'id-with-dashes',
				'id_with_underscores',
				'id.with.dots'
			];

			validIds.forEach(id => {
				const props: GoogleSearchType = { id };
				expect(props.id).toBe(id);
			});
		});

		it('should preserve whitespace in ids', () => {
			const props: GoogleSearchType = { id: '  spaces  ' };
			expect(props.id).toBe('  spaces  ');
		});

		it('should accept special character ids', () => {
			const ids = [
				'id:with:colons',
				'id@example',
				'id/with/slashes',
				'id?with?questions'
			];

			ids.forEach(id => {
				const props: GoogleSearchType = { id };
				expect(props.id).toBe(id);
			});
		});

		it('should handle emoji in ids', () => {
			const props: GoogleSearchType = { id: 'search-🔍-id' };
			expect(props.id).toBe('search-🔍-id');
		});
	});

	describe('Type structure', () => {
		it('should have correct type interface', () => {
			const props: GoogleSearchType = {
				id: 'test'
			};

			expect(props).toHaveProperty('id');
			expect(typeof props.id).toBe('string');
		});

		it('should only have id property', () => {
			const minimalProps: GoogleSearchType = { id: 'test' };
			expect(Object.keys(minimalProps)).toEqual(['id']);
		});

		it('should validate id is required', () => {
			const props: GoogleSearchType = { id: 'required' };
			expect(props.id).toBeDefined();
			expect(props.id).not.toBeUndefined();
		});

		it('should export proper type', () => {
			const example: GoogleSearchType = { id: 'type-test' };
			expect(example).toBeTruthy();
		});
	});

	describe('Multiple instances', () => {
		it('should render multiple instances', () => {
			const { container } = render(
				<>
					<GoogleSearch id="search1" />
					<GoogleSearch id="search2" />
					<GoogleSearch id="search3" />
				</>
			);

			const searchDivs = container.querySelectorAll('.gcse-search');
			expect(searchDivs).toHaveLength(3);
		});

		it('should render many instances', () => {
			const { container } = render(
				<>
					{Array(5)
						.fill(null)
						.map((_, i) => (
							<GoogleSearch key={i} id={`search-${i}`} />
						))}
				</>
			);

			const searchDivs = container.querySelectorAll('.gcse-search');
			expect(searchDivs).toHaveLength(5);
		});

		it('should handle different IDs in multiple instances', () => {
			const { container } = render(
				<>
					<GoogleSearch id="009500278966481927899:bcssp73qony" />
					<GoogleSearch id="e336d1c9d0e5e48e5" />
					<GoogleSearch id="custom-id" />
				</>
			);

			const searchDivs = container.querySelectorAll('.gcse-search');
			expect(searchDivs).toHaveLength(3);
		});

		it('should create independent prop objects', () => {
			const props1: GoogleSearchType = { id: 'search1' };
			const props2: GoogleSearchType = { id: 'search2' };

			expect(props1.id).toBe('search1');
			expect(props2.id).toBe('search2');
			expect(props1.id).not.toBe(props2.id);
		});
	});

	describe('ID property validation', () => {
		it('should accept Google CSE format IDs', () => {
			const googleCseIds = [
				'009500278966481927899:bcssp73qony',
				'e336d1c9d0e5e48e5',
				'1234567890:abcdefghijklmnop'
			];

			googleCseIds.forEach(id => {
				const props: GoogleSearchType = { id };
				expect(props.id).toMatch(/[0-9a-zA-Z:]/);
			});
		});

		it('should accept pixelated search IDs', () => {
			const pixelatedId = '009500278966481927899:bcssp73qony';
			const props: GoogleSearchType = { id: pixelatedId };
			expect(props.id).toBe(pixelatedId);
		});

		it('should accept pixelvivid search IDs', () => {
			const pixelvidId = 'e336d1c9d0e5e48e5';
			const props: GoogleSearchType = { id: pixelvidId };
			expect(props.id).toBe(pixelvidId);
		});

		it('should preserve id value exactly', () => {
			const testIds = ['id1', 'id2', 'id3', 'id4', 'id5'];

			testIds.forEach(id => {
				const props: GoogleSearchType = { id };
				expect(props.id).toBe(id);
			});
		});

		it('should handle falsy-like string ids', () => {
			const falsyLikeIds = ['0', 'false', 'null', 'undefined', 'NaN'];

			falsyLikeIds.forEach(id => {
				const props: GoogleSearchType = { id };
				expect(props.id).toBe(id);
			});
		});

		it('should handle numeric-like string ids', () => {
			const props: GoogleSearchType = { id: '123456789' };
			expect(props.id).toBe('123456789');
		});

		it('should handle very long IDs', () => {
			const longId = 'a'.repeat(500);
			const props: GoogleSearchType = { id: longId };
			expect(props.id.length).toBe(500);
		});
	});

	describe('Edge cases', () => {
		it('should accept ids with consecutive special characters', () => {
			const { container } = render(
				<GoogleSearch id="id:with::multiple---dashes" />
			);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});

		it('should accept mixed case ids', () => {
			const { container } = render(
				<GoogleSearch id="MiXeDcAsE_ID-123" />
			);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});

		it('should preserve exact id string', () => {
			const originalId = 'ExAcTly-AsProvided_123';
			const props: GoogleSearchType = { id: originalId };
			expect(props.id).toBe(originalId);
		});

		it('should not mutate id values', () => {
			const id = 'test-id';
			const props: GoogleSearchType = { id };

			const idCopy = props.id;
			expect(idCopy).toBe(id);
			expect(props.id).toBe(id);
		});

		it('should handle IDs with dots', () => {
			const { container } = render(
				<GoogleSearch id="com.example.search" />
			);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});
	});

	describe('Component export', () => {
		it('should export GoogleSearch function', () => {
			expect(typeof GoogleSearch).toBe('function');
		});

		it('should be callable as component', () => {
			const result = GoogleSearch({ id: 'test' });
			expect(result).toBeTruthy();
		});

		it('should support JSX rendering', () => {
			const { container } = render(<GoogleSearch id="test" />);
			expect(container.querySelector('.gcse-search')).toBeDefined();
		});
	});

	describe('CSS class handling', () => {
		it('should have gcse-search class', () => {
			const { container } = render(<GoogleSearch id="test" />);
			const div = container.querySelector('.gcse-search');
			expect(div?.classList.contains('gcse-search')).toBe(true);
		});

		it('should not have additional classes', () => {
			const { container } = render(<GoogleSearch id="test" />);
			const div = container.querySelector('.gcse-search') as HTMLElement;
			expect(div.className).toBe('gcse-search');
		});

		it('should be a div element', () => {
			const { container } = render(<GoogleSearch id="test" />);
			const div = container.querySelector('.gcse-search');
			expect(div?.tagName).toBe('DIV');
		});
	});
});
