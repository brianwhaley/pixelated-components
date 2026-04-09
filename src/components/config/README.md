# pixelated.config

This folder contains types and a React provider to allow consumer apps to supply integration configuration
to components in `pixelated-components`.

Files added:

- `pixelatedConfigTypes.ts` — TypeScript interfaces describing the supported integrations.
- `pixelated.config.ts` — helper functions to load/sanitize a master config blob (`getFullPixelatedConfig`, `getClientOnlyConfig`).
- `pixelated.config.client.tsx` — React context provider and hooks (`usePixelatedConfig`, `usePixelatedConfig`).
- `index.ts` — barrel exports.
- `example.pixelated.config.ts` — an example `pixelated.config.ts` you can copy into your app.

Usage (Next.js app router example):

1. Copy `example.pixelated.config.ts` into your app, e.g. `src/pixelated.config.ts` and fill in values.

2. Wrap your app root with the provider (in `app/layout.tsx`):

```tsx
import { PixelatedClientConfigProvider } from '@pixelated-tech/components';
import pixelatedConfig from '../pixelated.config';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <PixelatedClientConfigProvider config={pixelatedConfig}>{children}</PixelatedClientConfigProvider>
      </body>
    </html>
  );
}
```

3. Use config in components:

```tsx
import { usePixelatedConfig } from 'pixelated-components/src/components/config/pixelated.config.client';

function MyComponent() {
  const config = usePixelatedConfig();
  if (config.cloudinary?.product_env) {
    // use cloudinary helpers
  }
}
```

Notes
- The provider pattern is recommended because it keeps imports light and makes runtime substitution easy.
- If you only need the config in server components, you can import a plain config file from your app directly (no provider) — however client components need the provider or another client-side injection method.
- Keep secrets out of a committed client config. Only include non-secret public IDs in `pixelated.config.ts`. Use environment variables on the server for private secrets.
