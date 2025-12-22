/// <reference types="vitest/globals" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DeployPage from '@/app/(pages)/newdeployment/page';
import { vi } from 'vitest';

// Mock fetch
global.fetch = vi.fn();

// Mock sites.json
vi.mock('@/data/sites.json', () => ({
  default: [
    { name: 'pixelated' },
    { name: 'informationfocus' },
  ],
}));

describe('DeployPage', () => {
  it('renders the form', () => {
    render(<DeployPage />);
    expect(screen.getByText('New Deployment')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Select a site')).toBeInTheDocument();
  });

  it('allows selecting site and environments', () => {
    render(<DeployPage />);
    const siteSelect = screen.getByDisplayValue('Select a site');
    fireEvent.change(siteSelect, { target: { value: 'pixelated' } });
    expect(siteSelect).toHaveValue('pixelated');

    const devCheckbox = screen.getByLabelText('Dev');
    fireEvent.click(devCheckbox);
    expect(devCheckbox).toBeChecked();
  });

  it('submits the form successfully', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global.fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve({ message: 'Deployment results', results: { dev: 'Success' } }),
    });

    render(<DeployPage />);

    fireEvent.change(screen.getByDisplayValue('Select a site'), { target: { value: 'pixelated' } });
    fireEvent.click(screen.getByLabelText('Dev'));
    fireEvent.click(screen.getByLabelText('Patch'));
    fireEvent.change(screen.getByLabelText('Commit Message'), { target: { value: 'Test commit' } });

    fireEvent.click(screen.getByText('Deploy'));

    await waitFor(() => {
      expect(screen.getByText('Deployment results')).toBeInTheDocument();
    });
  });
});