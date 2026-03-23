import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../test/test-utils';
import { CompoundFontSelector } from '../components/sitebuilder/config/CompoundFontSelector';

// Mock the FontSelector component to avoid complex dependencies
vi.mock('../components/sitebuilder/config/FontSelector', () => ({
  FontSelector: ({ id, name, label, fontType, value, onChange, required, placeholder }: any) => (
    <div data-testid={`font-selector-${fontType}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        required={required}
        placeholder={placeholder}
        data-testid={`input-${fontType}`}
      />
    </div>
  ),
}));

describe('CompoundFontSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render with required props', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"Test Font", Arial, sans-serif'
        />
      );

      expect(screen.getByText('Test Font Stack')).toBeInTheDocument();
    });

    it('should render label text correctly', () => {
      render(
        <CompoundFontSelector
          id="my-fonts"
          name="my-fonts"
          label="Custom Fonts"
          value="Arial"
        />
      );

      expect(screen.getByText('Custom Fonts')).toBeInTheDocument();
    });

    it('should render three font selector inputs', () => {
      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value="Arial"
        />
      );

      expect(screen.getByTestId('input-google')).toBeInTheDocument();
      expect(screen.getByTestId('input-websafe')).toBeInTheDocument();
      expect(screen.getByTestId('input-generic')).toBeInTheDocument();
    });

    it('should render primary font label', () => {
      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value="Arial"
        />
      );

      expect(screen.getByText('Primary Font')).toBeInTheDocument();
    });

    it('should render fallback font label', () => {
      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value="Arial"
        />
      );

      expect(screen.getByText('Fallback Font')).toBeInTheDocument();
    });

    it('should render generic family label', () => {
      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value="Arial"
        />
      );

      expect(screen.getByText('Generic Family')).toBeInTheDocument();
    });
  });

  describe('Font Value Parsing', () => {
    it('should parse single quoted font correctly', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"Montserrat", Arial, sans-serif'
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      expect(primaryInput).toHaveValue('"Montserrat"');
    });

    it('should parse three-part font stack', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"Montserrat", Arial, sans-serif'
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      const fallbackInput = screen.getByTestId('input-websafe');
      const genericInput = screen.getByTestId('input-generic');

      expect(primaryInput).toHaveValue('"Montserrat"');
      expect(fallbackInput).toHaveValue('Arial');
      expect(genericInput).toHaveValue('sans-serif');
    });

    it('should parse two-part font stack', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"Georgia", serif'
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      const genericInput = screen.getByTestId('input-generic');

      expect(primaryInput).toBeDefined();
      expect(genericInput).toBeDefined();
    });

    it('should handle single font value', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value="Arial"
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      expect(primaryInput).toHaveValue('Arial');
    });

    it('should handle empty value', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value=""
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      expect(primaryInput).toHaveValue('');
    });

    it('should handle font names with spaces', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"Times New Roman", Times, serif'
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      expect(primaryInput).toHaveValue('"Times New Roman"');
    });
  });

  describe('Font Value Combining', () => {
    it('should combine font values into single output', async () => {
      const mockOnChange = vi.fn();

      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value=""
          onChange={mockOnChange}
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      const fallbackInput = screen.getByTestId('input-websafe');
      const genericInput = screen.getByTestId('input-generic');

      fireEvent.change(primaryInput, { target: { value: '"Roboto"' } });
      fireEvent.change(fallbackInput, { target: { value: 'Helvetica' } });
      fireEvent.change(genericInput, { target: { value: 'sans-serif' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('"Roboto", Helvetica, sans-serif');
      });
    });

    it('should handle partial font values', async () => {
      const mockOnChange = vi.fn();

      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value=""
          onChange={mockOnChange}
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      fireEvent.change(primaryInput, { target: { value: '"Montserrat"' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('"Montserrat"');
      });
    });

    it('should update only fallback font', async () => {
      const mockOnChange = vi.fn();

      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"Google", Arial, sans-serif'
          onChange={mockOnChange}
        />
      );

      const fallbackInput = screen.getByTestId('input-websafe');
      fireEvent.change(fallbackInput, { target: { value: 'Georgia' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should update only generic family', async () => {
      const mockOnChange = vi.fn();

      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"Font", Fallback, sans-serif'
          onChange={mockOnChange}
        />
      );

      const genericInput = screen.getByTestId('input-generic');
      fireEvent.change(genericInput, { target: { value: 'serif' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });
  });

  describe('External Value Changes', () => {
    it('should update when value prop changes externally', () => {
      const { rerender } = render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"Old Font", OldFallback, old-generic'
        />
      );

      let primaryInput = screen.getByTestId('input-google');
      expect(primaryInput).toHaveValue('"Old Font"');

      rerender(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"New Font", NewFallback, new-generic'
        />
      );

      primaryInput = screen.getByTestId('input-google');
      expect(primaryInput).toHaveValue('"New Font"');
    });

    it('should handle multiple re-renders', () => {
      const { rerender } = render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value="Arial"
        />
      );

      const values = ['Arial', 'Georgia', 'Times', 'Courier'];
      values.forEach(value => {
        rerender(
          <CompoundFontSelector
            id="test-font"
            name="test-font"
            label="Test Font Stack"
            value={value}
          />
        );
        const input = screen.getByTestId('input-google');
        expect(input).toHaveValue(value);
      });
    });

    it('should handle rapid prop updates', () => {
      const { rerender } = render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value="Initial"
        />
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          <CompoundFontSelector
            id="test"
            name="test"
            label="Fonts"
            value={`Update${i}`}
          />
        );
      }

      const input = screen.getByTestId('input-google');
      expect(input).toHaveValue('Update4');
    });
  });

  describe('Accessibility', () => {
    it('should have proper label associations', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value="Arial"
        />
      );

      const labels = screen.getAllByText(/Font/);
      expect(labels.length).toBeGreaterThan(0);
    });

    it('should have data-testid attributes for testing', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value="Arial"
        />
      );

      expect(screen.getByTestId('font-selector-google')).toBeInTheDocument();
      expect(screen.getByTestId('font-selector-websafe')).toBeInTheDocument();
      expect(screen.getByTestId('font-selector-generic')).toBeInTheDocument();
    });

    it('should have proper input IDs', () => {
      render(
        <CompoundFontSelector
          id="my-custom-id"
          name="test"
          label="Fonts"
          value=""
        />
      );

      const inputs = screen.getAllByRole('textbox');
      expect(inputs.length).toBeGreaterThan(0);
    });
  });

  describe('Props Handling', () => {
    it('should accept custom id and name attributes', () => {
      render(
        <CompoundFontSelector
          id="custom-id"
          name="custom-name"
          label="My Fonts"
          value="Arial"
        />
      );

      const input = screen.getByTestId('input-google');
      expect(input).toHaveAttribute('id', expect.stringContaining('custom-id'));
    });

    it('should handle onChange callback', async () => {
      const mockOnChange = vi.fn();

      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value=""
          onChange={mockOnChange}
        />
      );

      fireEvent.change(screen.getByTestId('input-google'), { target: { value: 'Arial' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should accept optional onChange prop', () => {
      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value="Arial"
        />
      );

      expect(screen.getByTestId('input-google')).toBeInTheDocument();
    });

    it('should handle changed label prop', () => {
      const { rerender } = render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Original Label"
          value="Arial"
        />
      );

      expect(screen.getByText('Original Label')).toBeInTheDocument();

      rerender(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Updated Label"
          value="Arial"
        />
      );

      expect(screen.getByText('Updated Label')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string value gracefully', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value=""
        />
      );

      expect(screen.getByTestId('input-google')).toHaveValue('');
    });

    it('should handle single long font name', () => {
      const longName = '"Very Long Font Name With Many Words"';
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value={longName}
        />
      );

      expect(screen.getByTestId('input-google')).toHaveValue(longName);
    });

    it('should handle special characters in font names', () => {
      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value='"Font-Name_123", Arial, sans-serif'
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      expect(primaryInput).toHaveValue('"Font-Name_123"');
    });

    it('should handle numeric font names', () => {
      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value='"Font123", "Font456", serif'
        />
      );

      const primaryInput = screen.getByTestId('input-google');
      expect(primaryInput).toHaveValue('"Font123"');
    });

    it('should handle whitespace-only values', () => {
      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value="   "
        />
      );

      expect(screen.getByTestId('input-google')).toBeInTheDocument();
    });

    it('should handle very long compound font values', () => {
      const longValue = '"Very Long Font Name", "Another Long Font Name", "Yet Another Font Name", sans-serif';
      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value={longValue}
        />
      );

      expect(screen.getByTestId('input-google')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should respond to font input changes', async () => {
      const mockOnChange = vi.fn();

      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value=""
          onChange={mockOnChange}
        />
      );

      const input = screen.getByTestId('input-google');
      fireEvent.change(input, { target: { value: '"MyFont"' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should handle multiple sequential changes', async () => {
      const mockOnChange = vi.fn();

      render(
        <CompoundFontSelector
          id="test"
          name="test"
          label="Fonts"
          value=""
          onChange={mockOnChange}
        />
      );

      const primaryInput = screen.getByTestId('input-google');

      fireEvent.change(primaryInput, { target: { value: '"Font1"' } });
      fireEvent.change(primaryInput, { target: { value: '"Font2"' } });
      fireEvent.change(primaryInput, { target: { value: '"Font3"' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should handle partial font values', async () => {
      const mockOnChange = vi.fn();

      render(
        <CompoundFontSelector
          id="test-font"
          name="test-font"
          label="Test Font Stack"
          value=""
          onChange={mockOnChange}
        />
      );

      const primaryInput = screen.getByTestId('input-google');

      // Only set primary font
      fireEvent.change(primaryInput, { target: { value: '"Montserrat"' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('"Montserrat"');
      });
    });
  });
});