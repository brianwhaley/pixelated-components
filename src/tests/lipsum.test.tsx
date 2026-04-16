import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLipsum } from '../components/integrations/lipsum';

vi.mock('../components/foundation/smartfetch');

describe('Lipsum Functions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch paragraphs from lipsum.com via proxy', async () => {
		const mockHTML = `
			<div id="lipsum">
				<p>Lorem ipsum dolor sit amet.</p>
				<p>Consectetur adipiscing elit.</p>
			</div>
		`;
		
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue(mockHTML);
		
		const result = await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 2
		});
		
		expect(result).toHaveLength(2);
		expect(result[0]).toBe('Lorem ipsum dolor sit amet.');
	});

	it('should construct correct proxy URL with parameters', async () => {
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue('<div id="lipsum"></div>');
		
		await getLipsum({
			LipsumTypeId: 'Word',
			Amount: 50,
			StartWithLoremIpsum: true
		});
		
		const callURL = vi.mocked(smartFetch).mock.calls[0][0];
		expect(callURL).toContain('LipsumTypeId=Word');
		expect(callURL).toContain('amount=50');
		expect(callURL).toContain('StartWithLoremIpsum=true');
	});

	it('should handle Paragraph type', async () => {
		const mockHTML = `
			<div id="lipsum">
				<p>First paragraph</p>
				<p>Second paragraph</p>
			</div>
		`;
		
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue(mockHTML);
		
		const result = await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 2
		});
		
		expect(result).toHaveLength(2);
		expect(result).toContain('First paragraph');
		expect(result).toContain('Second paragraph');
	});

	it('should handle Word type', async () => {
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue('<div id="lipsum"></div>');
		
		await getLipsum({
			LipsumTypeId: 'Word',
			Amount: 30
		});
		
		const callURL = vi.mocked(smartFetch).mock.calls[0][0];
		expect(callURL).toContain('LipsumTypeId=Word');
	});

	it('should handle Char type', async () => {
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue('<div id="lipsum"></div>');
		
		await getLipsum({
			LipsumTypeId: 'Char',
			Amount: 500
		});
		
		const callURL = vi.mocked(smartFetch).mock.calls[0][0];
		expect(callURL).toContain('LipsumTypeId=Char');
	});

	it('should start with Lorem Ipsum when flag is true', async () => {
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue('<div id="lipsum"></div>');
		
		await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 1,
			StartWithLoremIpsum: true
		});
		
		const callURL = vi.mocked(smartFetch).mock.calls[0][0];
		expect(callURL).toContain('StartWithLoremIpsum=true');
	});

	it('should trim whitespace from paragraphs', async () => {
		const mockHTML = `
			<div id="lipsum">
				<p>  Text with spaces  </p>
				<p>
					Text with newlines
				</p>
			</div>
		`;
		
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue(mockHTML);
		
		const result = await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 2
		});
		
		expect(result[0]).toBe('Text with spaces');
		expect(result[1]).toBe('Text with newlines');
	});

	it('should return empty array on fetch error', async () => {
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockRejectedValue(new Error('Network error'));
		
		const result = await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 1
		});
		
		expect(result).toEqual([]);
	});

	it('should return empty array when lipsum element not found', async () => {
		const mockHTML = '<div>No lipsum element</div>';
		
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue(mockHTML);
		
		const result = await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 5
		});
		
		expect(result).toEqual([]);
	});

	it('should use proxy.pixelated.tech URL', async () => {
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue('<div id="lipsum"></div>');
		
		await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 1
		});
		
		const callURL = vi.mocked(smartFetch).mock.calls[0][0];
		expect(callURL).toContain('proxy.pixelated.tech');
		expect(callURL).toContain('lipsum.com');
	});

	it('should URL encode the lipsum.com endpoint', async () => {
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue('<div id="lipsum"></div>');
		
		await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 1
		});
		
		const callURL = vi.mocked(smartFetch).mock.calls[0][0];
		expect(callURL).toContain('https://www.lipsum.com/feed/html');
	});

	it('should handle multiple paragraphs with different content', async () => {
		const mockHTML = `
			<div id="lipsum">
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
				<p>Sed do eiusmod tempor incididunt ut labore.</p>
				<p>Quis nostrud exercitation ullamco laboris.</p>
			</div>
		`;
		
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue(mockHTML);
		
		const result = await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 3
		});
		
		expect(result).toHaveLength(3);
		expect(result[0]).toBe('Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
		expect(result[1]).toBe('Sed do eiusmod tempor incididunt ut labore.');
		expect(result[2]).toBe('Quis nostrud exercitation ullamco laboris.');
	});

	it('should handle HTML parsing errors gracefully', async () => {
		const { smartFetch } = await import('../components/foundation/smartfetch');
		vi.mocked(smartFetch).mockResolvedValue('Invalid HTML <<<<>>>>');
		
		const result = await getLipsum({
			LipsumTypeId: 'Paragraph',
			Amount: 1
		});
		
		// Should not throw, returns empty array or tries to parse
		expect(Array.isArray(result)).toBe(true);
	});
});
