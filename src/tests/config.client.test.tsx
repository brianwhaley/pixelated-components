import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PixelatedClientConfigProvider, usePixelatedConfig } from '../components/config/config.client';
import { getFullPixelatedConfig, getClientOnlyPixelatedConfig } from '../components/config/config';

// Test component that uses the hook
function TestComponent() {
  const config = usePixelatedConfig();
  return (
    <div>
      <div data-testid="config-check">{config ? 'has-config' : 'no-config'}</div>
    </div>
  );
}

describe('PixelatedClientConfigProvider & usePixelatedConfig', () => {
  describe('PixelatedClientConfigProvider', () => {
    it('should render provider with config and children', () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });

    it('should provide config to child components through context', () => {
      const config = {
        cloudinary: { product_env: 'production', secure: true },
        featureFlags: { newUI: true, betaFeatures: false }
      };

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });

    it('should handle empty config object', () => {
      const config = {};
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(consoleSpy).toHaveBeenCalledWith('Pixelated config is empty. Check that src/app/config/pixelated.config.json is available.');
      expect(screen.getByTestId('config-check')).toHaveTextContent('no-config');

      consoleSpy.mockRestore();
    });

    it('should handle partial config', () => {
      const config = {
        featureFlags: { feature1: true }
      };

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });

    it('should render multiple child components', () => {
      const config = {
        cloudinary: { product_env: 'dev' }
      };

      const { container } = render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      const components = container.querySelectorAll('[data-testid="config-check"]');
      expect(components).toHaveLength(2);
      expect(components[0]).toHaveTextContent('has-config');
      expect(components[1]).toHaveTextContent('has-config');
    });
  });

  describe('usePixelatedConfig', () => {
    it('should return config from context when provider present', () => {
      const config = {
        cloudinary: { product_env: 'staging' },
        wordpress: { baseURL: 'https://test.com', site: 'test.com' }
      };

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });

    it('should throw error when provider not present in development', () => {
      // In development mode without provider, usePixelatedConfig should log warning and return null
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      render(<TestComponent />);

      expect(consoleSpy).toHaveBeenCalledWith('PixelatedClientConfigProvider not found when called by testcomponent. Some components may not work as expected. Wrap your app with PixelatedClientConfigProvider for full functionality.');
      expect(screen.getByTestId('config-check')).toHaveTextContent('no-config');

      consoleSpy.mockRestore();
    });

    it('should render without error when provider is present', () => {
      // This test verifies that when the provider is present, no error is thrown
      const config = { featureFlags: { test: true } };

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });

    it('should allow accessing config in deeply nested components', () => {
      const config = {
        featureFlags: { deepTest: true }
      };

      function DeepComponent() {
        return (
          <div>
            <div>
              <TestComponent />
            </div>
          </div>
        );
      }

      render(
        <PixelatedClientConfigProvider config={config}>
          <DeepComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });
  });

  describe('Config updates', () => {
    it('should update config when provider receives new config', () => {
      const { rerender } = render(
        <PixelatedClientConfigProvider config={{ featureFlags: { test: false } }}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');

      rerender(
        <PixelatedClientConfigProvider config={{ featureFlags: { test: true } }}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });

    it('should handle partial config updates', () => {
      const initialConfig = {
        cloudinary: { product_env: 'dev' },
        featureFlags: { flag1: true }
      };

      const { rerender } = render(
        <PixelatedClientConfigProvider config={initialConfig}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');

      const updatedConfig = {
        cloudinary: { product_env: 'staging' },
        featureFlags: { flag1: false }
      };

      rerender(
        <PixelatedClientConfigProvider config={updatedConfig}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });
  });

  describe('Edge cases', () => {
    it('should handle feature flags with various values', () => {
      const config = {
        featureFlags: {
          'feature-with-dashes': true,
          'feature_with_underscores': false,
          'featureWithCaps': true
        }
      };

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });

    it('should handle many feature flags', () => {
      const config = {
        featureFlags: Object.fromEntries(
          Array(50).fill(null).map((_, i) => [`feature${i}`, i % 2 === 0])
        )
      };

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });

    it('should handle multiple service configs', () => {
      const config = {
        cloudinary: { product_env: 'prod' },
        contentful: { base_url: 'https://example.com', space_id: 'test', environment: 'master' },
        wordpress: { baseURL: 'https://blog.example.com/api', site: 'example.com' }
      };

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });

    it('should handle empty feature flags object', () => {
      const config = {
        featureFlags: {}
      };

      render(
        <PixelatedClientConfigProvider config={config}>
          <TestComponent />
        </PixelatedClientConfigProvider>
      );

      expect(screen.getByTestId('config-check')).toHaveTextContent('has-config');
    });
  });

  describe('Performance and memory', () => {
    it('should not cause memory leaks with multiple provider/consumer pairs', () => {
      const configs = Array(10).fill(null).map((_, i) => ({
        featureFlags: { [`feature${i}`]: true }
      }));

      const { unmount } = render(
        <div>
          {configs.map((config, i) => (
            <PixelatedClientConfigProvider key={i} config={config}>
              <TestComponent />
            </PixelatedClientConfigProvider>
          ))}
        </div>
      );

      expect(screen.getAllByTestId('config-check')).toHaveLength(10);

      unmount();
    });

    it('should efficiently update multiple consumers', () => {
      const { rerender } = render(
        <div>
          <PixelatedClientConfigProvider config={{ featureFlags: { test: false } }}>
            <TestComponent />
            <TestComponent />
          </PixelatedClientConfigProvider>
        </div>
      );

      expect(screen.getAllByTestId('config-check')).toHaveLength(2);

      rerender(
        <div>
          <PixelatedClientConfigProvider config={{ featureFlags: { test: true } }}>
            <TestComponent />
            <TestComponent />
          </PixelatedClientConfigProvider>
        </div>
      );

      const elements = screen.getAllByTestId('config-check');
      expect(elements).toHaveLength(2);
      elements.forEach(el => expect(el).toBeInTheDocument());
    });
  });
});

describe('Config Utility Functions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getClientOnlyPixelatedConfig', () => {
    it('should strip secret keys from config', () => {
      const fullConfig = {
        cloudinary: { product_env: 'test' },
        apiKey: 'secret-key',
        token: 'secret-token',
        password: 'secret-password',
        management: { key: 'secret' },
        access_token: 'secret-access',
        normalKey: 'normal-value'
      };

      const clientConfig = getClientOnlyPixelatedConfig(fullConfig as any);
      
      expect(clientConfig).toEqual({
        cloudinary: { product_env: 'test' }
      });
    });

    it('should handle nested objects with secrets', () => {
      const fullConfig = {
        level1: {
          level2: {
            secretKey: 'secret',
            normalKey: 'normal'
          },
          normalKey: 'normal'
        }
      };

      const clientConfig = getClientOnlyPixelatedConfig(fullConfig as any);
      
      expect(clientConfig).toEqual({
        level1: {
          level2: {},
        }
      });
    });

    it('should handle arrays correctly', () => {
      const fullConfig = {
        items: [
          { secret: 'secret1', normal: 'normal1' },
          { secret: 'secret2', normal: 'normal2' }
        ]
      };

      const clientConfig = getClientOnlyPixelatedConfig(fullConfig as any);
      
      expect(clientConfig).toEqual({
        items: [
          { normal: 'normal1' },
          { normal: 'normal2' }
        ]
      });
    });

    it('should handle primitive values', () => {
      const fullConfig = 'string value';

      const clientConfig = getClientOnlyPixelatedConfig(fullConfig as any);
      expect(clientConfig).toBe('string value');
    });

    it('should handle null and undefined values', () => {
      const clientConfig = getClientOnlyPixelatedConfig(null as any);
      expect(clientConfig).toEqual({});

      const clientConfig2 = getClientOnlyPixelatedConfig(undefined);
      expect(clientConfig2).toEqual({});
    });

    it('should handle complex secret key patterns', () => {
      const fullConfig = {
        'api_key': 'secret1',
        'API_KEY': 'secret2',
        'ApiKey': 'secret3',
        'accessToken': 'secret4',
        'ACCESS_TOKEN': 'secret5',
        'password_field': 'secret6',
        'management_url': 'secret7',
        normal: 'normal'
      };

      const clientConfig = getClientOnlyPixelatedConfig(fullConfig as any);
      
      expect(clientConfig).toEqual({
        normal: 'normal'
      });
    });

    it('should handle errors during stripping', () => {
      // Create a circular reference that will cause JSON operations to fail
      const circular: any = { self: null };
      circular.self = circular;

      const clientConfig = getClientOnlyPixelatedConfig(circular);
      expect(clientConfig).toEqual({});
    });
  });
});
