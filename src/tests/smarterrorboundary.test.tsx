import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SmartErrorBoundary } from '../components/foundation/smarterrorboundary';

const ProblemChild = () => {
  throw new Error('Test crash');
};

describe('SmartErrorBoundary', () => {
  let consoleErrorMock: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorMock = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  it('should render children when there is no error', () => {
    render(
      <SmartErrorBoundary boundaryName="ChildBoundary">
        <div>Safe content</div>
      </SmartErrorBoundary>
    );

    expect(screen.getByText('Safe content')).toBeInTheDocument();
    expect(consoleErrorMock).not.toHaveBeenCalled();
  });

  it('should render the default fallback when a child throws', () => {
    render(
      <SmartErrorBoundary boundaryName="TestBoundary">
        <ProblemChild />
      </SmartErrorBoundary>
    );

    expect(screen.getByText(/Sorry, something went wrong loading/i)).toBeInTheDocument();
    expect(screen.getByText(/TestBoundary/i)).toBeInTheDocument();
    expect(consoleErrorMock).toHaveBeenCalled();
  });

  it('should render a custom fallback when provided', () => {
    render(
      <SmartErrorBoundary
        boundaryName="CustomFallbackBoundary"
        fallback={<div data-testid="custom-fallback">Custom fallback content</div>}
      >
        <ProblemChild />
      </SmartErrorBoundary>
    );

    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByText(/Sorry, something went wrong loading/i)).not.toBeInTheDocument();
    expect(consoleErrorMock).toHaveBeenCalled();
  });
});
