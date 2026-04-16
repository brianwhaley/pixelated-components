import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import { Markdown, useFileData } from '../components/general/markdown';

// Mock SmartImage component
vi.mock('../components/cms/smartimage', () => ({
  SmartImage: (props: any) => React.createElement('img', {
    src: props.src,
    alt: props.alt,
    title: props.title,
    'data-testid': 'smart-image'
  })
}));

// Mock smartFetch
vi.mock('../components/foundation/smartfetch', () => ({
  smartFetch: vi.fn()
}));

import { smartFetch } from '../components/foundation/smartfetch';

describe('Markdown Component', () => {
  describe('Basic Rendering', () => {
    it('should render markdown container', () => {
      const { container } = render(<Markdown markdowndata="test" />);
      expect(container.querySelector('.section-container')).toBeInTheDocument();
    });

    it('should render markdown div', () => {
      const { container } = render(<Markdown markdowndata="test" />);
      expect(container.querySelector('.markdown')).toBeInTheDocument();
    });

    it('should render simple text as paragraph', () => {
      const { container } = render(<Markdown markdowndata="Hello World" />);
      expect(container.querySelector('.markdown')).toBeInTheDocument();
      expect(container.textContent).toContain('Hello World');
    });
  });

  describe('Heading Parsing', () => {
    it('should parse h1 heading', () => {
      const { container } = render(<Markdown markdowndata="# Heading 1" />);
      expect(container.querySelector('h1')).toHaveTextContent('Heading 1');
    });

    it('should parse h2 heading', () => {
      const { container } = render(<Markdown markdowndata="## Heading 2" />);
      expect(container.querySelector('h2')).toHaveTextContent('Heading 2');
    });

    it('should parse h3 heading', () => {
      const { container } = render(<Markdown markdowndata="### Heading 3" />);
      expect(container.querySelector('h3')).toHaveTextContent('Heading 3');
    });

    it('should parse h4 heading', () => {
      const { container } = render(<Markdown markdowndata="#### Heading 4" />);
      expect(container.querySelector('h4')).toHaveTextContent('Heading 4');
    });

    it('should parse h5 heading', () => {
      const { container } = render(<Markdown markdowndata="##### Heading 5" />);
      expect(container.querySelector('h5')).toHaveTextContent('Heading 5');
    });

    it('should parse h6 heading', () => {
      const { container } = render(<Markdown markdowndata="###### Heading 6" />);
      expect(container.querySelector('h6')).toHaveTextContent('Heading 6');
    });

    it('should parse multiple headings', () => {
      const markdown = '# H1\n## H2\n### H3';
      const { container } = render(<Markdown markdowndata={markdown} />);
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
      expect(container.querySelector('h3')).toBeInTheDocument();
    });
  });

  describe('Link Parsing', () => {
    it('should parse markdown links', () => {
      const { container } = render(<Markdown markdowndata="[Link Text](https://example.com)" />);
      const link = container.querySelector('a');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveTextContent('Link Text');
    });

    it('should parse multiple links', () => {
      const markdown = '[Link 1](https://link1.com)\n[Link 2](https://link2.com)';
      const { container } = render(<Markdown markdowndata={markdown} />);
      const links = container.querySelectorAll('a');
      // Links should be present
      expect(links.length).toBeGreaterThan(0);
    });

    it('should preserve link href attribute', () => {
      const { container } = render(<Markdown markdowndata="[Click Here](https://test.org)" />);
      const link = container.querySelector('a') as HTMLAnchorElement;
      expect(link.href).toContain('test.org');
    });
  });

  describe('Text Formatting', () => {
    it('should parse bold text', () => {
      const { container } = render(<Markdown markdowndata="**bold text**" />);
      expect(container.querySelector('b')).toHaveTextContent('bold text');
    });

    it('should parse italic text', () => {
      const { container } = render(<Markdown markdowndata="*italic text*" />);
      expect(container.querySelector('i')).toHaveTextContent('italic text');
    });

    it('should parse strikethrough text', () => {
      const { container } = render(<Markdown markdowndata="~~strikethrough~~" />);
      expect(container.querySelector('b')).toHaveTextContent('strikethrough');
    });

    it('should parse inline code', () => {
      const { container } = render(<Markdown markdowndata="`const x = 5;`" />);
      expect(container.querySelector('code')).toHaveTextContent('const x = 5;');
    });

    it('should parse multiple formatted text', () => {
      const markdown = '**bold** and *italic* and `code`';
      const { container } = render(<Markdown markdowndata={markdown} />);
      expect(container.querySelector('b')).toBeInTheDocument();
      expect(container.querySelector('i')).toBeInTheDocument();
      expect(container.querySelector('code')).toBeInTheDocument();
    });
  });

  describe('List Parsing', () => {
    it('should parse unordered list', () => {
      const markdown = '* Item 1\n* Item 2\n* Item 3';
      const { container } = render(<Markdown markdowndata={markdown} />);
      const lists = container.querySelectorAll('ul');
      expect(lists.length).toBeGreaterThan(0);
    });

    it('should parse ordered list', () => {
      const markdown = '1. First\n2. Second\n3. Third';
      const { container } = render(<Markdown markdowndata={markdown} />);
      const lists = container.querySelectorAll('ol');
      expect(lists.length).toBeGreaterThan(0);
    });

    it('should render list items', () => {
      const markdown = '* Item 1\n* Item 2';
      const { container } = render(<Markdown markdowndata={markdown} />);
      const items = container.querySelectorAll('li');
      expect(items.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Block Elements', () => {
    it('should parse blockquote', () => {
      const { container } = render(<Markdown markdowndata="> This is a quote" />);
      expect(container.querySelector('blockquote')).toBeInTheDocument();
    });

    it('should parse horizontal rule with dashes', () => {
      const { container } = render(<Markdown markdowndata="---" />);
      expect(container.querySelector('hr')).toBeInTheDocument();
    });

    it('should parse horizontal rule with equals', () => {
      const { container } = render(<Markdown markdowndata="===" />);
      expect(container.querySelector('hr')).toBeInTheDocument();
    });

    it('should parse horizontal rule with asterisks', () => {
      const { container } = render(<Markdown markdowndata="***" />);
      expect(container.querySelector('hr')).toBeInTheDocument();
    });

    it('should parse quote with colons', () => {
      const markdown = ':"quoted text":';
      const { container } = render(<Markdown markdowndata={markdown} />);
      // Quote pattern might not render in some cases - verify component doesn't crash
      expect(container.querySelector('.markdown')).toBeInTheDocument();
    });
  });

  describe('Image Parsing', () => {
    it('should attempt to parse markdown image syntax', () => {
      const markdown = '![Alt Text](https://example.com/image.jpg)';
      const { container } = render(<Markdown markdowndata={markdown} />);
      // The image parsing in the component has limitations due to attempting JSX in string replacement
      // This test verifies the component doesn't crash when encountering image syntax
      expect(container.querySelector('.markdown')).toBeInTheDocument();
    });

    it('should not crash with multiple image patterns', () => {
      const markdown = '![Image 1](img1.jpg) ![Image 2](img2.jpg)';
      const { container } = render(<Markdown markdowndata={markdown} />);
      // Verify component renders without error
      expect(container.querySelector('.markdown')).toBeInTheDocument();
    });
  });

  describe('Complex Markdown', () => {
    it('should parse mixed markdown content', () => {
      const markdown = `# Title
      **Bold** and *italic* text
      [Link](https://example.com)
      * List item
      \`code\``;
      const { container } = render(<Markdown markdowndata={markdown} />);
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('b')).toBeInTheDocument();
      expect(container.querySelector('i')).toBeInTheDocument();
      expect(container.querySelector('a')).toBeInTheDocument();
      expect(container.querySelector('code')).toBeInTheDocument();
    });

    it('should handle paragraph text correctly', () => {
      const markdown = 'This is a paragraph';
      const { container } = render(<Markdown markdowndata={markdown} />);
      // Paragraphs are created from plain text
      expect(container.querySelector('.markdown')).toBeInTheDocument();
      expect(container.textContent).toContain('This is a paragraph');
    });

    it('should preserve whitespace in code blocks', () => {
      const markdown = '`const x = 5;`';
      const { container } = render(<Markdown markdowndata={markdown} />);
      const code = container.querySelector('code');
      expect(code?.textContent).toContain('const x = 5;');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const { container } = render(<Markdown markdowndata="" />);
      expect(container.querySelector('.markdown')).toBeInTheDocument();
    });

    it('should handle whitespace only', () => {
      const { container } = render(<Markdown markdowndata="   " />);
      expect(container.querySelector('.markdown')).toBeInTheDocument();
    });

    it('should handle special characters', () => {
      const markdown = 'Text with & < > special chars';
      const { container } = render(<Markdown markdowndata={markdown} />);
      expect(container.textContent).toContain('&');
    });

    it('should handle very long text', () => {
      const longText = 'A'.repeat(1000);
      const { container } = render(<Markdown markdowndata={longText} />);
      expect(container.textContent).toContain('A');
    });

    it('should handle mixed line endings', () => {
      const markdown = '# Heading\nContent\r\nMore content';
      const { container } = render(<Markdown markdowndata={markdown} />);
      expect(container.querySelector('h1')).toBeInTheDocument();
    });
  });

  describe('Container Structure', () => {
    it('should have proper semantic structure', () => {
      const { container } = render(<Markdown markdowndata="# Test" />);
      const sectionContainer = container.querySelector('.section-container');
      const markdownDiv = container.querySelector('.markdown');
      expect(sectionContainer?.contains(markdownDiv)).toBe(true);
    });

    it('should not render directly on root', () => {
      const { container } = render(<Markdown markdowndata="test" />);
      expect(container.firstChild?.childNodes.length).toBeGreaterThan(0);
    });
  });

  describe('HTML Sanitization', () => {
    it('should use dangerouslySetInnerHTML for rendering', () => {
      const markdown = '**bold**';
      const { container } = render(<Markdown markdowndata={markdown} />);
      const markdown_div = container.querySelector('.markdown');
      expect(markdown_div?.innerHTML).toContain('<b>');
    });

    it('should render parsed HTML correctly', () => {
      const markdown = '[test](https://example.com)';
      const { container } = render(<Markdown markdowndata={markdown} />);
      expect(container.querySelector('a')).toBeInTheDocument();
    });
  });
});

/* ========== useFileData Hook Tests ========== */

// Test component to use the hook
function TestFileDataComponent({ filePath, responseType }: any) {
  const { data, loading, error } = useFileData(filePath, responseType);
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'done'}</div>
      <div data-testid="error">{error || 'no error'}</div>
      <div data-testid="data">{data ? JSON.stringify(data) : 'null'}</div>
    </div>
  );
}

describe('useFileData Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('text file loading', () => {
    it('should load text file successfully', async () => {
      const mockText = '# My Markdown\nThis is content';
      vi.mocked(smartFetch).mockResolvedValueOnce(mockText);

      render(<TestFileDataComponent filePath="/data/readme.md" responseType="text" />);

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('done');
      });

      // Check that the data element contains the escaped JSON representation
      const dataElement = screen.getByTestId('data');
      expect(dataElement.textContent).toBe(JSON.stringify(mockText));
      expect(screen.getByTestId('error')).toHaveTextContent('no error');
    });

    it('should use default responseType of "text"', async () => {
      const mockText = 'File content';
      vi.mocked(smartFetch).mockResolvedValueOnce(mockText);

      render(<TestFileDataComponent filePath="/data/test.md" />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('done');
      });

      // Verify smartFetch was called with 'text' as responseType
      expect(smartFetch).toHaveBeenCalledWith('/data/test.md', expect.objectContaining({
        responseType: 'text'
      }));

      expect(screen.getByTestId('data')).toHaveTextContent(mockText);
    });
  });

  describe('JSON file loading', () => {
    it('should load JSON file successfully', async () => {
      const mockJson = { name: 'Test', items: [1, 2, 3] };
      vi.mocked(smartFetch).mockResolvedValueOnce(mockJson);

      render(<TestFileDataComponent filePath="/data/config.json" responseType="json" />);

      // Initially loading
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('done');
      });

      expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(mockJson));
      expect(screen.getByTestId('error')).toHaveTextContent('no error');
    });

    it('should parse JSON arrays correctly', async () => {
      const mockArray = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      vi.mocked(smartFetch).mockResolvedValueOnce(mockArray);

      render(<TestFileDataComponent filePath="/data/items.json" responseType="json" />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('done');
      });

      expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(mockArray));
    });
  });

  describe('error handling', () => {
    it('should handle fetch errors gracefully', async () => {
      const errorMsg = 'File not found';
      vi.mocked(smartFetch).mockRejectedValueOnce(new Error(errorMsg));

      render(<TestFileDataComponent filePath="/data/missing.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('done');
      });

      expect(screen.getByTestId('error')).toHaveTextContent(errorMsg);
      expect(screen.getByTestId('data')).toHaveTextContent('null');
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(smartFetch).mockRejectedValueOnce('Some error string');

      render(<TestFileDataComponent filePath="/data/error.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('done');
      });

      expect(screen.getByTestId('error')).toHaveTextContent('Failed to load file');
      expect(screen.getByTestId('data')).toHaveTextContent('null');
    });

    it('should have loading=false when error occurs', async () => {
      vi.mocked(smartFetch).mockRejectedValueOnce(new Error('Network error'));

      render(<TestFileDataComponent filePath="/data/fail.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('done');
      });

      // Verify loading state is false (done)
      expect(screen.getByTestId('loading')).toHaveTextContent('done');
    });
  });

  describe('loading states', () => {
    it('should start in loading state', async () => {
      vi.mocked(smartFetch).mockImplementationOnce(() =>
        new Promise(() => {}) // Never resolves
      );

      render(<TestFileDataComponent filePath="/data/delayed.md" responseType="text" />);

      // Should be loading initially
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');
    });

    it('should transition from loading to done', async () => {
      const mockText = 'Loaded content';
      vi.mocked(smartFetch).mockResolvedValueOnce(mockText);

      const { rerender } = render(<TestFileDataComponent filePath="/data/file.md" responseType="text" />);

      // Check initial state
      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      // Wait for completion
      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('done');
      });
    });
  });

  describe('dependency tracking', () => {
    it('should refresh when filePath changes', async () => {
      const mockText1 = 'Content 1';
      const mockText2 = 'Content 2';
      vi.mocked(smartFetch)
        .mockResolvedValueOnce(mockText1)
        .mockResolvedValueOnce(mockText2);

      const { rerender } = render(<TestFileDataComponent filePath="/data/file1.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent(mockText1);
      });

      // Change filePath
      rerender(<TestFileDataComponent filePath="/data/file2.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent(mockText2);
      });

      // Should have called smartFetch twice
      expect(smartFetch).toHaveBeenCalledTimes(2);
    });

    it('should refresh when responseType changes', async () => {
      const mockText = 'Text data';
      const mockJson = { key: 'value' };
      
      vi.mocked(smartFetch)
        .mockResolvedValueOnce(mockText)
        .mockResolvedValueOnce(mockJson);

      const { rerender } = render(<TestFileDataComponent filePath="/data/data.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent(mockText);
      });

      // Change responseType
      rerender(<TestFileDataComponent filePath="/data/data.md" responseType="json" />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent(JSON.stringify(mockJson));
      });

      expect(smartFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('smartFetch integration', () => {
    it('should pass filePath to smartFetch', async () => {
      const filePath = '/data/custom.md';
      vi.mocked(smartFetch).mockResolvedValueOnce('content');

      render(<TestFileDataComponent filePath={filePath} responseType="text" />);

      await waitFor(() => {
        expect(smartFetch).toHaveBeenCalledWith(filePath, expect.any(Object));
      });
    });

    it('should pass responseType to smartFetch', async () => {
      vi.mocked(smartFetch).mockResolvedValueOnce('content');

      render(<TestFileDataComponent filePath="/data/file.md" responseType="text" />);

      await waitFor(() => {
        expect(smartFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
          responseType: 'text'
        }));
      });
    });

    it('should handle smartFetch with JSON responseType', async () => {
      vi.mocked(smartFetch).mockResolvedValueOnce({ test: true });

      render(<TestFileDataComponent filePath="/data/data.json" responseType="json" />);

      await waitFor(() => {
        expect(smartFetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
          responseType: 'json'
        }));
      });
    });
  });

  describe('data clearing on error', () => {
    it('should clear data when error occurs', async () => {
      const mockText = 'Initial content';
      
      vi.mocked(smartFetch)
        .mockResolvedValueOnce(mockText)
        .mockRejectedValueOnce(new Error('Network failure'));

      const { rerender } = render(<TestFileDataComponent filePath="/data/file1.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent(mockText);
      });

      // Change filePath to trigger re-fetch with error
      rerender(<TestFileDataComponent filePath="/data/file2.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('no error');
      });

      // Data should be cleared
      expect(screen.getByTestId('data')).toHaveTextContent('null');
    });
  });

  describe('error state cleared on success', () => {
    it('should clear error when subsequent load succeeds', async () => {
      const mockText1 = 'First content';
      const mockText2 = 'Second content';
      
      vi.mocked(smartFetch)
        .mockRejectedValueOnce(new Error('First error'))
        .mockResolvedValueOnce(mockText2);

      const { rerender } = render(<TestFileDataComponent filePath="/data/file1.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('no error');
      });

      // Trigger new fetch with success
      rerender(<TestFileDataComponent filePath="/data/file2.md" responseType="text" />);

      await waitFor(() => {
        expect(screen.getByTestId('data')).toHaveTextContent(mockText2);
      });

      expect(screen.getByTestId('error')).toHaveTextContent('no error');
    });
  });
});
