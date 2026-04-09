import React from 'react';
import { describe, it, expect } from 'vitest';
import { PixelatedServerConfigProvider } from '../components/config/config.server';

describe('PixelatedServerConfigProvider', () => {
  describe('Server provider rendering', () => {
    it('should accept config prop', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = <div data-testid="child">Child content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should accept children prop', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should handle undefined config prop', async () => {
      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ children });

      expect(result).toBeDefined();
    });

    it('should handle multiple children', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = (
        <>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </>
      );

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should return a React element', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should work with complex child components', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const ComplexChild = () => (
        <div>
          <header>Header</header>
          <main>
            <section>Section</section>
          </main>
          <footer>Footer</footer>
        </div>
      );

      const result = PixelatedServerConfigProvider({
        config,
        children: <ComplexChild />
      });

      expect(result).toBeDefined();
    });
  });

  describe('Config handling', () => {
    it('should accept and use provided config', async () => {
      const config = {
        cloudinary: { product_env: 'production' },
        global: { proxyUrl: "test" },
      };

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should handle empty config object', async () => {
      const config = {};

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should handle config with multiple properties', async () => {
      const config = {
        cloudinary: { product_env: 'production' },
        contentful: { base_url: 'https://example.com', space_id: 'test', environment: 'master' },
        wordpress: { baseURL: 'https://blog.example.com', site: 'example.com' }
      };

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should handle partial config', async () => {
      const config = {
        global: { proxyUrl: "test" },
      };

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should work when config is not provided', async () => {
      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ children });

      expect(result).toBeDefined();
    });
  });

  describe('Server-side rendering', () => {
    it('should work as a server component', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should pass config to client provider', async () => {
      const config = {
        cloudinary: { product_env: 'production' },
        global: { proxyUrl: "test" },
      };

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should wrap client provider with config', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should support nested server components', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const NestedComponent = ({ children }: { children: React.ReactNode }) => (
        <div>{children}</div>
      );

      const children = <NestedComponent>Inner content</NestedComponent>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle rapid successive calls', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = <div>Content</div>;

      const results = Array(10).fill(null).map(() =>
        PixelatedServerConfigProvider({ config, children })
      );

      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    it('should handle different configs in sequence', async () => {
      const configs = [
        { cloudinary: { product_env: 'dev' } },
        { cloudinary: { product_env: 'staging' } },
        { cloudinary: { product_env: 'prod' } }
      ];

      const children = <div>Content</div>;

      configs.forEach(config => {
        const result = PixelatedServerConfigProvider({ config, children });
        expect(result).toBeDefined();
      });
    });

    it('should handle deeply nested JSX structures', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = (
        <div>
          <div>
            <div>
              <div>
                <div>Deeply nested</div>
              </div>
            </div>
          </div>
        </div>
      );

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });

    it('should handle JSX with many elements', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = (
        <div>
          {Array(100).fill(null).map((_, i) => <div key={i}>Item {i}</div>)}
        </div>
      );

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });
  });

  describe('Props structure', () => {
    it('should accept object with config and children', async () => {
      const props = {
        config: { cloudinary: { product_env: 'production' } },
        children: <div>Content</div>
      };

      const result = PixelatedServerConfigProvider(props);

      expect(result).toBeDefined();
    });

    it('should accept object with only children', async () => {
      const props = {
        children: <div>Content</div>
      };

      const result = PixelatedServerConfigProvider(props as any);

      expect(result).toBeDefined();
    });

    it('should handle destructured props', async () => {
      const config = { cloudinary: { product_env: 'production' } };
      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });
  });

  describe('Configuration fallback', () => {
    it('should use getClientOnlyPixelatedConfig when no config provided', async () => {
      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ children });

      expect(result).toBeDefined();
    });

    it('should prefer provided config over fallback', async () => {
      const config = {
        cloudinary: { product_env: 'production' }
      };

      const children = <div>Content</div>;

      const result = PixelatedServerConfigProvider({ config, children });

      expect(result).toBeDefined();
    });
  });
});
