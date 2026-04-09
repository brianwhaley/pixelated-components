import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { FontSelector } from '../components/sitebuilder/config/FontSelector';

// Mock the google-fonts module
vi.mock('../components/sitebuilder/config/google-fonts', () => ({
  fetchGoogleFonts: vi.fn(() => Promise.resolve([
    { family: 'Roboto', category: 'sans-serif' },
    { family: 'Open Sans', category: 'sans-serif' },
    { family: 'Montserrat', category: 'sans-serif' },
    { family: 'Times New Roman', category: 'serif' },
    { family: 'Arial', category: 'sans-serif' }
  ])),
  getFontOptions: vi.fn(() => Promise.resolve([
    { value: 'Roboto', label: 'Roboto (sans-serif)', category: 'sans-serif' },
    { value: 'Open Sans', label: 'Open Sans (sans-serif)', category: 'sans-serif' },
    { value: 'Montserrat', label: 'Montserrat (sans-serif)', category: 'sans-serif' },
    { value: 'Times New Roman', label: 'Times New Roman (serif)', category: 'serif' },
    { value: 'Arial', label: 'Arial (sans-serif)', category: 'sans-serif' }
  ])),
  generateGoogleFontsUrl: vi.fn((fonts) => fonts.length > 0 ? `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}` : null)
}));

describe('FontSelector Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  describe('FontSelector Basic Rendering', () => {
    it('should render FontSelector component for Google fonts', () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="google"
        onChange={mockOnChange}
      />);
      expect(screen.getByText('Test Font')).toBeInTheDocument();
    });

    it('should render FontSelector component for web-safe fonts', () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="websafe"
        onChange={mockOnChange}
      />);
      expect(screen.getByText('Test Font')).toBeInTheDocument();
    });

    it('should render FontSelector component for generic fonts', () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="generic"
        onChange={mockOnChange}
      />);
      expect(screen.getByText('Test Font')).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="google"
        value="Roboto"
        onChange={mockOnChange}
      />);

      const input = screen.getByDisplayValue('Roboto');
      expect(input).toBeInTheDocument();
    });
  });

  describe('FontSelector Interactions', () => {
    it('should call onChange when Google font is selected', async () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="google"
        onChange={mockOnChange}
      />);

      const input = screen.getByLabelText('Test Font');
      fireEvent.change(input, { target: { value: 'Montserrat' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Montserrat');
      });
    });

    it('should call onChange when web-safe font is selected', async () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="websafe"
        onChange={mockOnChange}
      />);

      const input = screen.getByLabelText('Test Font');
      fireEvent.change(input, { target: { value: 'Arial' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Arial');
      });
    });

    it('should call onChange when generic family is selected', async () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="generic"
        onChange={mockOnChange}
      />);

      const select = screen.getByLabelText('Test Font');
      fireEvent.change(select, { target: { value: 'serif' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('serif');
      });
    });

    it('should show autocomplete options for Google fonts', async () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="google"
        onChange={mockOnChange}
      />);

      const input = screen.getByLabelText('Test Font');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Ro' } });

      await waitFor(() => {
        expect(screen.getByText('Roboto (sans-serif)')).toBeInTheDocument();
      });
    });

    it('should show web-safe font options', async () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="websafe"
        onChange={mockOnChange}
      />);

      const input = screen.getByLabelText('Test Font');
      fireEvent.focus(input);
      fireEvent.change(input, { target: { value: 'Ar' } });

      await waitFor(() => {
        expect(screen.getByText('Arial')).toBeInTheDocument();
      });
    });
  });

  describe('FontSelector Validation', () => {
    it('should handle empty values gracefully', () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="google"
        value="Roboto"
        onChange={mockOnChange}
      />);

      const input = screen.getByDisplayValue('Roboto');
      fireEvent.change(input, { target: { value: '' } });

      expect(mockOnChange).toHaveBeenCalledWith('');
    });

    it('should render with initial value', () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="google"
        value="Roboto"
        onChange={mockOnChange}
      />);

      expect(screen.getByDisplayValue('Roboto')).toBeInTheDocument();
    });
  });

  describe('FontSelector Accessibility', () => {
    it('should have proper label for input', () => {
      render(<FontSelector
        id="test-font"
        name="test-font"
        label="Test Font"
        fontType="google"
        onChange={mockOnChange}
      />);

      expect(screen.getByText('Test Font')).toBeInTheDocument();
    });
  });
});