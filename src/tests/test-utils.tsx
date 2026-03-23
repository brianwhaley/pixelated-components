import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  // Add any provider-specific options here
}

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderWithProvidersOptions
) {
  return render(ui, { ...options });
}

export default renderWithProviders;
