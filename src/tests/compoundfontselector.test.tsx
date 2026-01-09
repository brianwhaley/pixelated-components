import { describe, it, expect, vi } from 'vitest';
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
  it('should render CompoundFontSelector with three font selectors', () => {
    render(
      <CompoundFontSelector
        id="test-font"
        name="test-font"
        label="Test Font Stack"
        value='"Test Font", Arial, sans-serif'
      />
    );

    expect(screen.getByText('Test Font Stack')).toBeInTheDocument();
    expect(screen.getByText('Primary Font')).toBeInTheDocument();
    expect(screen.getByText('Fallback Font')).toBeInTheDocument();
    expect(screen.getByText('Generic Family')).toBeInTheDocument();
  });

  it('should parse compound value correctly', () => {
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

    // Simulate user input
    fireEvent.change(primaryInput, { target: { value: '"Roboto"' } });
    fireEvent.change(fallbackInput, { target: { value: 'Helvetica' } });
    fireEvent.change(genericInput, { target: { value: 'sans-serif' } });

    // Wait for the onChange to be called
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

    // Only set primary font
    fireEvent.change(primaryInput, { target: { value: '"Montserrat"' } });

    await waitFor(() => {
      expect(mockOnChange).toHaveBeenCalledWith('"Montserrat"');
    });
  });

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
    let fallbackInput = screen.getByTestId('input-websafe');
    let genericInput = screen.getByTestId('input-generic');

    expect(primaryInput).toHaveValue('"Old Font"');
    expect(fallbackInput).toHaveValue('OldFallback');
    expect(genericInput).toHaveValue('old-generic');

    // Rerender with new value
    rerender(
      <CompoundFontSelector
        id="test-font"
        name="test-font"
        label="Test Font Stack"
        value='"New Font", NewFallback, new-generic'
      />
    );

    primaryInput = screen.getByTestId('input-google');
    fallbackInput = screen.getByTestId('input-websafe');
    genericInput = screen.getByTestId('input-generic');

    expect(primaryInput).toHaveValue('"New Font"');
    expect(fallbackInput).toHaveValue('NewFallback');
    expect(genericInput).toHaveValue('new-generic');
  });

  it('should handle empty value gracefully', () => {
    render(
      <CompoundFontSelector
        id="test-font"
        name="test-font"
        label="Test Font Stack"
        value=""
      />
    );

    const primaryInput = screen.getByTestId('input-google');
    const fallbackInput = screen.getByTestId('input-websafe');
    const genericInput = screen.getByTestId('input-generic');

    expect(primaryInput).toHaveValue('');
    expect(fallbackInput).toHaveValue('');
    expect(genericInput).toHaveValue('');
  });
});