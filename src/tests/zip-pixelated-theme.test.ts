import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import { spawnSync } from 'child_process';

import { zipPixelatedTheme, buildZipArgs } from '../scripts/zip-pixelated-theme.js';

describe('zip-pixelated-theme script', () => {
  const fakeTheme = '/fake/theme/dir';
  const fakeZip = '/fake/theme/dir/Pixelated.zip';

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when theme dir is missing', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false);
    expect(() => zipPixelatedTheme('/no/such/dir')).toThrow(/Theme directory not found/);
  });

  it('removes existing zip and calls system zip', () => {
    const exists = vi.spyOn(fs, 'existsSync');
    // accept PathLike per Node typings
    exists.mockImplementation((p: fs.PathLike) => (String(p) === fakeTheme || String(p) === fakeZip));
    vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true } as any);
    const unlink = vi.spyOn(fs, 'unlinkSync').mockImplementation(() => undefined);

    // Simulate successful which + zip; some test environments won't actually run zip.
    let capturedArgs: any[] | undefined;
    vi.spyOn(require('child_process'), 'spawnSync' as any).mockImplementation((...callArgs: any[]) => {
      const cmd = String(callArgs[0]);
      const args = callArgs[1] as any[] | undefined;
      if (cmd === 'which') return { status: 0 } as any;
      if (cmd === 'zip') {
        capturedArgs = args;
        return { status: 0 } as any;
      }
      return { status: 0 } as any;
    });

    const out = zipPixelatedTheme(fakeTheme, 'Pixelated.zip');
    expect(unlink).toHaveBeenCalledWith(fakeZip);

    // Ensure we excluded .git from the zip (safety: don't bundle repo history)
    const args = buildZipArgs('Pixelated.zip');
    expect(args).toContain('.git/**');
    expect(args).toContain('.DS_Store');
    expect(args).toContain('node_modules/**');
    expect(args).toContain('dist/**');
    expect(args).toContain('.cache/**');
    expect(args).toContain('coverage/**');
    expect(args).toContain('.vscode/**');
    expect(out).toBe(fakeZip);
  });

  it('errors when zip not on PATH', () => {
    vi.spyOn(fs, 'existsSync').mockImplementation((p: fs.PathLike) => String(p) === fakeTheme);
    vi.spyOn(fs, 'statSync').mockReturnValue({ isDirectory: () => true } as any);
    vi.spyOn(require('child_process'), 'spawnSync' as any).mockImplementation((...callArgs: any[]) => {
      const cmd = String(callArgs[0]);
      if (cmd === 'which') return { status: 1 } as any; // not found
      throw Object.assign(new Error('spawn ENOENT'), { code: 'ENOENT' });
    });

    expect(() => zipPixelatedTheme(fakeTheme)).toThrow(/`zip` command not found/);
  });
});
