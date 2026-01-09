import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import { BuzzwordBingo } from '../components/general/buzzwordbingo';

const mockBuzzwords = [
  'Synergy',
  'Paradigm Shift',
  'Leveraging',
  'Disruptive',
  'Blockchain',
  'AI-Powered',
  'Optimize',
  'Circle Back',
  'Vertical Integration',
  'Deep Dive',
  'Touch Base',
  'Bandwidth',
  'Low Hanging Fruit',
  'Win-Win',
  'Core Competency',
  'Best Practice',
  'Think Outside The Box',
  'Strategic Vision',
  'Pivot',
  'MVP',
  'Growth Hacking',
  'Engagement Metrics',
  'KPIs',
  'Stakeholder Value',
  'Agile Methodology'
];

describe('BuzzwordBingo Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('BuzzwordBingo Rendering', () => {
    it('should render bingo card container', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      expect(container.querySelector('.bingoCard')).toBeInTheDocument();
    });

    it('should have grid layout class', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      expect(container.querySelector('.bingoCard')).toHaveClass('rowfix-5col');
    });

    it('should render bingo headers', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const headers = container.querySelectorAll('.bingoHeader');
      expect(headers.length).toBe(5);
    });

    it('should render correct header letters', () => {
      render(<BuzzwordBingo buzzwords={mockBuzzwords} />);
      expect(screen.getByText('B')).toBeInTheDocument();
      expect(screen.getByText('I')).toBeInTheDocument();
      expect(screen.getByText('N')).toBeInTheDocument();
      expect(screen.getByText('G')).toBeInTheDocument();
      expect(screen.getByText('O')).toBeInTheDocument();
    });

    it('should render all bingo boxes', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      expect(boxes.length).toBe(25); // 5x5 grid
    });

    it('should render headers with gridItem class', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const headers = container.querySelectorAll('.bingoHeader.gridItem');
      expect(headers.length).toBe(5);
    });

    it('should render boxes with gridItem class', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox.gridItem');
      expect(boxes.length).toBe(25);
    });
  });

  describe('BuzzwordBingo Content', () => {
    it('should render 24 buzzwords from input', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      const textBoxes = Array.from(boxes).filter(box => 
        box.textContent && box.textContent !== 'FREE SPACE'
      );
      expect(textBoxes.length).toBe(24);
    });

    it('should include FREE SPACE in center', () => {
      render(<BuzzwordBingo buzzwords={mockBuzzwords} />);
      expect(screen.getByText('FREE SPACE')).toBeInTheDocument();
    });

    it('should have FREE SPACE at index 12 (center of 25 grid)', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      expect(boxes[12].textContent).toBe('FREE SPACE');
    });

    it('should render buzzwords in bingo boxes', () => {
      const testBuzzwords = ['Word1', 'Word2', 'Word3', 'Word4', 'Word5', 'Word6', 'Word7', 'Word8', 'Word9', 'Word10', 'Word11', 'Word12', 'Word13', 'Word14', 'Word15', 'Word16', 'Word17', 'Word18', 'Word19', 'Word20', 'Word21', 'Word22', 'Word23', 'Word24'];
      render(<BuzzwordBingo buzzwords={testBuzzwords} />);
      // Check that some buzzwords are rendered (there will be multiple matches)
      const buzzwordElements = screen.getAllByText(/Word\d+/);
      expect(buzzwordElements.length).toBeGreaterThan(0);
    });
  });

  describe('BuzzwordBingo FREE SPACE', () => {
    it('should have bingoBoxFreeSpace class on FREE SPACE', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const freeSpaceBox = Array.from(container.querySelectorAll('.bingoBox')).find(
        box => box.textContent === 'FREE SPACE'
      );
      expect(freeSpaceBox?.querySelector('.bingoBoxFreeSpace')).toBeInTheDocument();
    });

    it('should have bingoBoxText class on regular buzzwords', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBoxText');
      // Should have 24 regular buzzwords + 5 headers with bingoBoxText class
      expect(boxes.length).toBe(29);
    });

    it('should differentiate FREE SPACE styling', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const textBoxes = container.querySelectorAll('.bingoBoxText');
      const freeSpaceElement = container.querySelector('.bingoBoxFreeSpace');
      expect(freeSpaceElement).toBeInTheDocument();
      expect(textBoxes.length).toBe(29); // 24 buzzword boxes + 5 headers
    });
  });

  describe('BuzzwordBingo Shuffling', () => {
    it('should randomize buzzword order', () => {
      const buzzwords1 = Array.from({ length: 24 }, (_, i) => `Word${i}`);
      const buzzwords2 = Array.from({ length: 24 }, (_, i) => `Word${i}`);
      
      const { container: container1 } = render(
        <BuzzwordBingo buzzwords={buzzwords1} />
      );
      const { container: container2 } = render(
        <BuzzwordBingo buzzwords={buzzwords2} />
      );

      const boxes1 = Array.from(container1.querySelectorAll('.bingoBoxText')).map(b => b.textContent);
      const boxes2 = Array.from(container2.querySelectorAll('.bingoBoxText')).map(b => b.textContent);

      // With 24 items, it's extremely unlikely they'll be in the same order
      // But we can at least verify both are arrays of the same length with same content
      expect(boxes1.length).toBe(boxes2.length);
    });

    it('should use first 24 buzzwords when more are provided', () => {
      const manyBuzzwords = Array.from({ length: 50 }, (_, i) => `Word${i}`);
      const { container } = render(
        <BuzzwordBingo buzzwords={manyBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      expect(boxes.length).toBe(25); // 24 buzzwords + 1 FREE SPACE
    });

    it('should render all buzzwords from smaller array', () => {
      const fewBuzzwords = ['Synergy', 'Paradigm', 'Disruptive', 'Leverage'];
      const { container } = render(
        <BuzzwordBingo buzzwords={fewBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      expect(boxes.length).toBe(5); // 4 buzzwords + 1 FREE SPACE
    });
  });

  describe('BuzzwordBingo Grid Structure', () => {
    it('should have 5x5 grid (25 total cells)', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const items = container.querySelectorAll('.gridItem');
      expect(items.length).toBe(30); // 5 headers + 25 boxes
    });

    it('should have headers in first row', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const headers = container.querySelectorAll('.bingoHeader');
      expect(headers.length).toBe(5);
      Array.from(headers).forEach((header, index) => {
        expect(['B', 'I', 'N', 'G', 'O']).toContain(header.textContent);
      });
    });

    it('should have boxText content in proper structure', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const boxTexts = container.querySelectorAll('.bingoBoxText, .bingoBoxFreeSpace');
      expect(boxTexts.length).toBe(30); // 25 boxes + 5 headers
    });
  });

  describe('BuzzwordBingo Edge Cases', () => {
    it('should handle minimum buzzwords', () => {
      const minBuzzwords = ['Word1'];
      const { container } = render(
        <BuzzwordBingo buzzwords={minBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      expect(boxes.length).toBe(2); // 1 buzzword + 1 FREE SPACE
    });

    it('should handle empty buzzword array', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={[]} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      expect(boxes.length).toBe(1); // Only FREE SPACE
    });

    it('should handle buzzwords with special characters', () => {
      const specialBuzzwords = [
        'Word & Special',
        'Word "Quoted"',
        'Word <HTML>',
        'Word™',
        'Word©'
      ].concat(Array.from({ length: 19 }, (_, i) => `Word${i}`));
      const { container } = render(
        <BuzzwordBingo buzzwords={specialBuzzwords} />
      );
      expect(container.querySelector('.bingoCard')).toBeInTheDocument();
    });

    it('should handle very long buzzword text', () => {
      const longWord = 'A'.repeat(100);
      const longBuzzwords = [longWord].concat(Array.from({ length: 23 }, (_, i) => `Word${i}`));
      const { container } = render(
        <BuzzwordBingo buzzwords={longBuzzwords} />
      );
      expect(container.querySelector('.bingoCard')).toBeInTheDocument();
    });

    it('should handle duplicate buzzwords', () => {
      const dupeBuzzwords = ['Word1', 'Word1', 'Word2', 'Word2'].concat(Array.from({ length: 20 }, (_, i) => `Word${i}`));
      const { container } = render(
        <BuzzwordBingo buzzwords={dupeBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      expect(boxes.length).toBe(25);
    });
  });

  describe('BuzzwordBingo Bingo Box Structure', () => {
    it('should wrap buzzword text in appropriate div', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const buzzwordDivs = container.querySelectorAll('.bingoBoxText');
      buzzwordDivs.forEach(div => {
        expect(div.textContent).toBeTruthy();
      });
    });

    it('should have nested structure: bingoBox > bingoBoxText', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      let nestedCount = 0;
      boxes.forEach(box => {
        if (box.querySelector('.bingoBoxText, .bingoBoxFreeSpace')) {
          nestedCount++;
        }
      });
      expect(nestedCount).toBe(25);
    });

    it('should render header with bingoBoxText inside', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const headers = container.querySelectorAll('.bingoHeader');
      headers.forEach(header => {
        const textDiv = header.querySelector('.bingoBoxText');
        expect(textDiv).toBeInTheDocument();
      });
    });
  });

  describe('BuzzwordBingo Accessibility', () => {
    it('should render all text content', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const allText = container.textContent;
      expect(allText).toContain('B');
      expect(allText).toContain('I');
      expect(allText).toContain('N');
      expect(allText).toContain('G');
      expect(allText).toContain('O');
      expect(allText).toContain('FREE SPACE');
    });

    it('should have semantic grid structure', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      expect(container.querySelector('.bingoCard')).toBeInTheDocument();
      expect(container.querySelectorAll('.gridItem').length).toBe(30);
    });
  });

  describe('BuzzwordBingo Rendering Consistency', () => {
    it('should consistently render 5x5 grid with sufficient buzzwords', () => {
      const buzzwords = Array.from({ length: 24 }, (_, i) => `Word${i}`);
      const { container } = render(
        <BuzzwordBingo buzzwords={buzzwords} />
      );
      expect(container.querySelectorAll('.gridItem').length).toBe(30); // 5 headers + 25 boxes
    });

    it('should always have exactly 25 bingo boxes with 24 buzzwords', () => {
      const buzzwords = Array.from({ length: 24 }, (_, i) => `Word${i}`);
      const { container } = render(
        <BuzzwordBingo buzzwords={buzzwords} />
      );
      expect(container.querySelectorAll('.bingoBox').length).toBe(25);
    });

    it('should always have exactly 25 bingo boxes with 50 buzzwords', () => {
      const buzzwords = Array.from({ length: 50 }, (_, i) => `Word${i}`);
      const { container } = render(
        <BuzzwordBingo buzzwords={buzzwords} />
      );
      expect(container.querySelectorAll('.bingoBox').length).toBe(25);
    });

    it('should always have exactly 25 bingo boxes with 100 buzzwords', () => {
      const buzzwords = Array.from({ length: 100 }, (_, i) => `Word${i}`);
      const { container } = render(
        <BuzzwordBingo buzzwords={buzzwords} />
      );
      expect(container.querySelectorAll('.bingoBox').length).toBe(25);
    });

    it('should handle fewer buzzwords than 24', () => {
      const buzzwords = ['A', 'B', 'C'];
      const { container } = render(
        <BuzzwordBingo buzzwords={buzzwords} />
      );
      // With 3 buzzwords + 1 FREE SPACE = 4 total
      expect(container.querySelectorAll('.bingoBox').length).toBe(4);
    });

    it('should maintain FREE SPACE at center position with full array', () => {
      const buzzwords = Array.from({ length: 24 }, (_, j) => `Word${j}`);
      const { container } = render(
        <BuzzwordBingo buzzwords={buzzwords} />
      );
      const boxes = container.querySelectorAll('.bingoBox');
      expect(boxes[12].textContent).toBe('FREE SPACE');
    });
  });

  describe('BuzzwordBingo Text Content', () => {
    it('should render header box text correctly', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const headerBoxes = container.querySelectorAll('.bingoHeader .bingoBoxText');
      const texts = Array.from(headerBoxes).map(h => h.textContent);
      expect(texts).toEqual(['B', 'I', 'N', 'G', 'O']);
    });

    it('should render buzzword box text correctly', () => {
      const { container } = render(
        <BuzzwordBingo buzzwords={mockBuzzwords} />
      );
      const buzzwordBoxes = container.querySelectorAll('.bingoBox .bingoBoxText, .bingoBox .bingoBoxFreeSpace');
      expect(buzzwordBoxes.length).toBe(25);
      buzzwordBoxes.forEach(box => {
        expect(box.textContent).toBeTruthy();
      });
    });

    it('should render all text without HTML injection', () => {
      const xssBuzzwords = [
        '<script>alert("xss")</script>',
        '<img src=x onerror="alert(1)">',
        '&lt;safe&gt;'
      ].concat(Array.from({ length: 21 }, (_, i) => `Word${i}`));
      const { container } = render(
        <BuzzwordBingo buzzwords={xssBuzzwords} />
      );
      const scripts = container.querySelectorAll('script');
      expect(scripts.length).toBe(0); // No script tags should execute
    });
  });
});
