import { expect, it } from 'vitest';

it('exports new rules and exposes them in the recommended config (regression)', async () => {
  const mod = await import('../scripts/pixelated-eslint-plugin.js');
  const plugin = mod.default;

  const expected = ['validate-test-locations', 'no-process-env', 'no-debug-true', 'file-name-kebab-case'];
  for (const r of expected) {
    expect(plugin.rules && (plugin.rules as any)[r], `rule ${r} is exported`).toBeDefined();
    expect(plugin.configs, 'configs present').toBeDefined();
    expect(plugin.configs.recommended, 'recommended config present').toBeDefined();
    expect(plugin.configs.recommended.rules && ((plugin.configs.recommended.rules as any)[`pixelated/${r}`]), `recommended config includes pixelated/${r}`).toBeDefined();
  }

  // regression: ensure the no-process-env rule exposes the canonical allowlist
  const procCfg = ((plugin.configs && plugin.configs.recommended && (plugin.configs.recommended.rules as any)['pixelated/no-process-env']) as any);
  expect(procCfg).toBeDefined();
  const procCfgAny = procCfg as any;
  expect(Array.isArray(procCfgAny[1].allowed)).toBe(true);
  expect(procCfgAny[1].allowed).toEqual(expect.arrayContaining(['PIXELATED_CONFIG_KEY', 'PUPPETEER_EXECUTABLE_PATH']));
});
