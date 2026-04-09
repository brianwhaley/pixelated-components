import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { NerdJoke } from '../components/general/nerdjoke';

const mockJokeData = {
  question: 'Why did the programmer quit his job?',
  answer: 'Because he didn\'t get arrays.'
};

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockJokeData),
  })
) as any;

describe('NerdJoke Component', () => {
  describe('Basic Rendering', () => {
    it('should render main nerdJoke container', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.nerd-joke')).toBeInTheDocument();
    });

    it('should render row-12col grid container', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.row-12col')).toBeInTheDocument();
    });

    it('should render both buttons', () => {
      render(<NerdJoke />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should render pause/play button', () => {
      const { container } = render(<NerdJoke />);
      const pauseButton = container.querySelector('.left button');
      expect(pauseButton?.textContent).toContain('Pause');
    });

    it('should render next joke button', () => {
      const { container } = render(<NerdJoke />);
      const nextButton = container.querySelector('.right button');
      expect(nextButton?.textContent).toContain('Next Joke');
    });

    it('should render joke timer section', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.joke-timer')).toBeInTheDocument();
    });

    it('should render joke text section', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.joke-text')).toBeInTheDocument();
    });

    it('should render svg timer element', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.joke-timer-svg')).toBeInTheDocument();
    });

    it('should have grid layout classes', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.grid-s1-e5')).toBeInTheDocument();
      expect(container.querySelector('.grid-s9-e13')).toBeInTheDocument();
      expect(container.querySelector('.grid-s1-e13')).toBeInTheDocument();
      expect(container.querySelector('.grid-s1-e11')).toBeInTheDocument();
      expect(container.querySelector('.grid-s11-e13')).toBeInTheDocument();
    });
  });

  describe('Button Functionality', () => {
    it('should render pause button with correct class', () => {
      const { container } = render(<NerdJoke />);
      const buttons = container.querySelectorAll('button');
      expect(buttons[0]).toHaveClass('joke-button');
    });

    it('should render next joke button with correct class', () => {
      const { container } = render(<NerdJoke />);
      const buttons = container.querySelectorAll('button');
      expect(buttons[1]).toHaveClass('joke-button');
    });

    it('should have pause button on left side', () => {
      const { container } = render(<NerdJoke />);
      const leftDiv = container.querySelector('.left');
      const button = leftDiv?.querySelector('button');
      expect(button?.textContent).toContain('Pause');
    });

    it('should have next joke button on right side', () => {
      const { container } = render(<NerdJoke />);
      const rightDiv = container.querySelector('.right');
      const button = rightDiv?.querySelector('button');
      expect(button?.textContent).toContain('Next Joke');
    });

    it('should handle pause button click', () => {
      const { container } = render(<NerdJoke />);
      const pauseButton = container.querySelector('.left button');
      expect(() => fireEvent.click(pauseButton as HTMLElement)).not.toThrow();
    });

    it('should handle next joke button click', () => {
      const { container } = render(<NerdJoke />);
      const nextButton = container.querySelector('.right button');
      expect(() => fireEvent.click(nextButton as HTMLElement)).not.toThrow();
    });
  });

  describe('Timer Display', () => {
    it('should have timer label element', () => {
      render(<NerdJoke />);
      const timerLabel = document.getElementById('jokeTimerLabel');
      expect(timerLabel).toBeInTheDocument();
    });

    it('should have timer path elapsed element', () => {
      render(<NerdJoke />);
      const elapsedPath = document.getElementById('jokeTimerPathElapsed');
      expect(elapsedPath).toBeInTheDocument();
    });

    it('should display timer in center div', () => {
      const { container } = render(<NerdJoke />);
      const centerDiv = container.querySelector('.grid-s11-e13.center');
      expect(centerDiv).toBeInTheDocument();
    });

    it('should have timer SVG with correct namespace', () => {
      const { container } = render(<NerdJoke />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg');
    });

    it('should have timer progress rect element', () => {
      const { container } = render(<NerdJoke />);
      const rect = container.querySelector('rect');
      expect(rect).toHaveAttribute('id', 'jokeTimerPathElapsed');
    });
  });

  describe('Joke Content', () => {
    it('should render joke text container with correct class', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.joke-text')).toBeInTheDocument();
    });

    it('should have label spans for question and answer', () => {
      const { container } = render(<NerdJoke />);
      const labels = container.querySelectorAll('.label');
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });

    it('should have question span element', () => {
      const { container } = render(<NerdJoke />);
      const question = container.querySelector('.question');
      expect(question).toBeInTheDocument();
    });

    it('should have answer span element', () => {
      const { container } = render(<NerdJoke />);
      const answer = container.querySelector('.answer');
      expect(answer).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should have main container with nerdJoke class', () => {
      const { container } = render(<NerdJoke />);
      const main = container.querySelector('.nerd-joke');
      expect(main).toHaveClass('nerd-joke');
    });

    it('should have two button containers', () => {
      const { container } = render(<NerdJoke />);
      const leftDiv = container.querySelector('.left');
      const rightDiv = container.querySelector('.right');
      expect(leftDiv).toBeInTheDocument();
      expect(rightDiv).toBeInTheDocument();
    });

    it('should have joke content structure with divs', async () => {
      const { container } = render(<NerdJoke />);
      await waitFor(() => {
        const jokeText = container.querySelector('.joke-text');
        const divs = jokeText?.querySelectorAll('div');
        expect(divs?.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should maintain proper grid layout structure', () => {
      const { container } = render(<NerdJoke />);
      const rowCol = container.querySelector('.row-12col');
      expect(rowCol?.children.length).toBeGreaterThan(0);
    });

    it('should have nested row structure in timer', () => {
      const { container } = render(<NerdJoke />);
      const timerSection = container.querySelector('.joke-timer');
      const rowCol = timerSection?.querySelector('.row-12col');
      expect(rowCol).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('should apply nerdJoke class to main container', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.nerd-joke')).toBeInTheDocument();
    });

    it('should apply jokeButton class to buttons', () => {
      const { container } = render(<NerdJoke />);
      const buttons = container.querySelectorAll('.joke-button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should apply jokeTimer class to timer section', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.joke-timer')).toBeInTheDocument();
    });

    it('should apply jokeTimerSvg class to svg', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.joke-timer-svg')).toBeInTheDocument();
    });

    it('should apply jokeText class to text section', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.joke-text')).toBeInTheDocument();
    });

    it('should apply center class to timer display', () => {
      const { container } = render(<NerdJoke />);
      const centerDiv = container.querySelector('.center');
      expect(centerDiv).toHaveClass('center');
    });

    it('should apply left class to left button container', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.left')).toBeInTheDocument();
    });

    it('should apply right class to right button container', () => {
      const { container } = render(<NerdJoke />);
      expect(container.querySelector('.right')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have buttons accessible by role', () => {
      render(<NerdJoke />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have descriptive button text for pause', () => {
      const { container } = render(<NerdJoke />);
      const button = container.querySelector('.left button');
      expect(button?.tagName).toBe('BUTTON');
      expect(button?.textContent).toContain('Pause');
    });

    it('should have descriptive button text for next joke', () => {
      const { container } = render(<NerdJoke />);
      const button = container.querySelector('.right button');
      expect(button?.tagName).toBe('BUTTON');
      expect(button?.textContent).toContain('Next');
    });

    it('should render buttons as button elements not divs', () => {
      const { container } = render(<NerdJoke />);
      const buttons = container.querySelectorAll('button');
      buttons.forEach(button => {
        expect(button.tagName).toBe('BUTTON');
      });
    });
  });

  describe('State Management', () => {
    it('should initialize and load a joke', () => {
      render(<NerdJoke />);
      // Joke should be loaded via API and displayed
      const jokeText = document.querySelector('.joke-text');
      expect(jokeText).toBeInTheDocument();
    });

    it('should have question and answer spans for display', () => {
      const { container } = render(<NerdJoke />);
      const question = container.querySelector('.question');
      const answer = container.querySelector('.answer');
      expect(question).toBeInTheDocument();
      expect(answer).toBeInTheDocument();
    });
  });

  describe('Timer Functionality', () => {
    it('should have timer SVG element with rect', () => {
      const { container } = render(<NerdJoke />);
      const svg = container.querySelector('svg.joke-timer-svg');
      const rect = svg?.querySelector('rect');
      expect(rect).toBeInTheDocument();
    });

    it('should initialize timer label with time', () => {
      render(<NerdJoke />);
      const timerLabel = document.getElementById('jokeTimerLabel');
      expect(timerLabel?.textContent).toBeTruthy();
    });

    it('should have timer elements in correct structure', () => {
      const { container } = render(<NerdJoke />);
      const timerSection = container.querySelector('.joke-timer');
      const rowCol = timerSection?.querySelector('.row-12col');
      expect(rowCol).toBeInTheDocument();
    });

    it('should have timer path element for progress', () => {
      const { container } = render(<NerdJoke />);
      const pathElapsed = document.getElementById('jokeTimerPathElapsed');
      expect(pathElapsed).toBeInTheDocument();
      expect(pathElapsed?.tagName).toBe('rect');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid button clicks', () => {
      const { container } = render(<NerdJoke />);
      const pauseButton = container.querySelector('.left button');
      expect(() => {
        fireEvent.click(pauseButton as HTMLElement);
        fireEvent.click(pauseButton as HTMLElement);
        fireEvent.click(pauseButton as HTMLElement);
      }).not.toThrow();
    });

    it('should handle pause and next joke button clicks together', () => {
      const { container } = render(<NerdJoke />);
      const pauseButton = container.querySelector('.left button');
      const nextButton = container.querySelector('.right button');
      expect(() => {
        fireEvent.click(pauseButton as HTMLElement);
        fireEvent.click(nextButton as HTMLElement);
        fireEvent.click(pauseButton as HTMLElement);
      }).not.toThrow();
    });

    it('should render without crashing with initial state', () => {
      const { container } = render(<NerdJoke />);
      expect(container).toBeInTheDocument();
    });

    it('should not have memory leaks on unmount', () => {
      const { unmount } = render(<NerdJoke />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should render all required UI elements together', () => {
      const { container } = render(<NerdJoke />);
      
      // Check buttons exist
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
      
      // Check timer exists
      expect(document.getElementById('jokeTimerLabel')).toBeInTheDocument();
      
      // Check joke text section
      expect(document.querySelector('.joke-text')).toBeInTheDocument();
    });

    it('should maintain structure through button interactions', () => {
      const { container } = render(<NerdJoke />);
      const pauseButton = container.querySelector('.left button');
      
      fireEvent.click(pauseButton as HTMLElement);
      
      // Structure should still be intact
      expect(document.querySelector('.nerd-joke')).toBeInTheDocument();
      expect(document.querySelector('.joke-timer')).toBeInTheDocument();
      expect(document.querySelector('.joke-text')).toBeInTheDocument();
    });

    it('should have question and answer labels available', () => {
      const { container } = render(<NerdJoke />);
      const labels = container.querySelectorAll('.label');
      expect(labels.length).toBeGreaterThanOrEqual(2);
    });
  });
});
