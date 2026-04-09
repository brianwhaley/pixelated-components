/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  loadSitesConfig,
  saveSitesConfig,
  getSiteConfig,
  validateSiteConfig,
  upsertSiteConfig,
  removeSiteConfig,
  type SiteConfig
} from '../components/admin/sites/sites.integration';

// Mock fs module
vi.mock('fs', () => ({
  default: {
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    mkdirSync: vi.fn()
  }
}));

// Mock path module
vi.mock('path', () => ({
  default: {
    join: vi.fn(),
    dirname: vi.fn()
  }
}));

const mockFs = fs as any;
const mockPath = path as any;

describe('Sites Integration', () => {
  const mockSites: SiteConfig[] = [
    {
      name: 'test-site-1',
      localPath: '/path/to/site1',
      remote: 'https://site1.com',
      ga4PropertyId: '123456789',
      searchConsoleUrl: 'https://search.google.com/search-console'
    },
    {
      name: 'test-site-2',
      localPath: '/path/to/site2',
      ga4PropertyId: 'GA4_PROPERTY_ID_HERE'
    }
  ];

  const mockSitesJson = JSON.stringify(mockSites, null, 2);
  const defaultConfigPath = '/mock/sites.json';

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock path.join to return our controlled path
    mockPath.join.mockReturnValue(defaultConfigPath);
    mockPath.dirname.mockReturnValue('/mock/dir');

    // Default fs mocks
    mockFs.existsSync.mockReturnValue(true);
    mockFs.readFileSync.mockReturnValue(mockSitesJson);
    mockFs.writeFileSync.mockImplementation(() => {});
    mockFs.mkdirSync.mockImplementation(() => {});
  });

  describe('loadSitesConfig', () => {
    it('should load sites config from default path', async () => {
      const result = await loadSitesConfig();

      expect(mockPath.join).toHaveBeenCalledWith(process.cwd(), 'src/app/data/sites.json');
      expect(mockFs.readFileSync).toHaveBeenCalledWith(defaultConfigPath, 'utf8');
      expect(result).toEqual(mockSites);
    });

    it('should load sites config from custom path', async () => {
      const customPath = '/custom/sites.json';
      const result = await loadSitesConfig(customPath);

      expect(mockFs.readFileSync).toHaveBeenCalledWith(customPath, 'utf8');
      expect(result).toEqual(mockSites);
    });

    it('should throw error when config file does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await expect(loadSitesConfig()).rejects.toThrow('Failed to load sites configuration');
    });

    it('should throw error when JSON is invalid', async () => {
      mockFs.readFileSync.mockReturnValue('invalid json');

      await expect(loadSitesConfig()).rejects.toThrow('Failed to load sites configuration');
    });
  });

  describe('saveSitesConfig', () => {
    it('should save sites config to default path', async () => {
      const newSites = [...mockSites, { name: 'new-site', localPath: '/new/path' }];

      // Mock directory not existing
      mockFs.existsSync.mockImplementation((path: string) => {
        if (path === '/mock/dir') return false;
        return true;
      });

      await saveSitesConfig(newSites);

      expect(mockPath.dirname).toHaveBeenCalledWith(defaultConfigPath);
      expect(mockFs.existsSync).toHaveBeenCalledWith('/mock/dir');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/mock/dir', { recursive: true });
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        defaultConfigPath,
        JSON.stringify(newSites, null, 2),
        'utf8'
      );
    });

    it('should save sites config to custom path', async () => {
      const customPath = '/custom/sites.json';
      const newSites = [{ name: 'custom-site', localPath: '/custom/path' }];

      await saveSitesConfig(newSites, customPath);

      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        customPath,
        JSON.stringify(newSites, null, 2),
        'utf8'
      );
    });

    it('should create directory if it does not exist', async () => {
      mockFs.existsSync.mockReturnValue(false);

      await saveSitesConfig(mockSites);

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/mock/dir', { recursive: true });
    });

    it('should throw error on write failure', async () => {
      mockFs.writeFileSync.mockImplementation(() => {
        throw new Error('Write failed');
      });

      await expect(saveSitesConfig(mockSites)).rejects.toThrow('Failed to save sites configuration');
    });
  });

  describe('getSiteConfig', () => {
    it('should return site config by name', async () => {
      const result = await getSiteConfig('test-site-1');

      expect(result).toEqual(mockSites[0]);
    });

    it('should return null for non-existent site', async () => {
      const result = await getSiteConfig('non-existent-site');

      expect(result).toBeNull();
    });
  });

  describe('validateSiteConfig', () => {
    it('should validate valid site config', () => {
      const validSite: SiteConfig = {
        name: 'valid-site',
        localPath: '/existing/path'
      };

      mockFs.existsSync.mockReturnValue(true);

      const result = validateSiteConfig(validSite);

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should detect missing name', () => {
      const invalidSite = {
        localPath: '/path'
      } as SiteConfig;

      const result = validateSiteConfig(invalidSite);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Site name is required');
    });

    it('should detect missing local path', () => {
      const invalidSite = {
        name: 'test-site'
      } as SiteConfig;

      const result = validateSiteConfig(invalidSite);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Local path is required');
    });

    it('should detect non-existent local path', () => {
      const invalidSite: SiteConfig = {
        name: 'test-site',
        localPath: '/non/existent/path'
      };

      mockFs.existsSync.mockReturnValue(false);

      const result = validateSiteConfig(invalidSite);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Local path does not exist: /non/existent/path');
    });

    it('should validate GA4 property ID format', () => {
      const invalidSite: SiteConfig = {
        name: 'test-site',
        localPath: '/path',
        ga4PropertyId: 'invalid-id'
      };

      mockFs.existsSync.mockReturnValue(true);

      const result = validateSiteConfig(invalidSite);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid GA4 Property ID format');
    });

    it('should accept placeholder GA4 property ID', () => {
      const validSite: SiteConfig = {
        name: 'test-site',
        localPath: '/path',
        ga4PropertyId: 'GA4_PROPERTY_ID_HERE'
      };

      mockFs.existsSync.mockReturnValue(true);

      const result = validateSiteConfig(validSite);

      expect(result.valid).toBe(true);
    });

    it('should validate Search Console URL format', () => {
      const invalidSite: SiteConfig = {
        name: 'test-site',
        localPath: '/path',
        searchConsoleUrl: 'invalid-url'
      };

      mockFs.existsSync.mockReturnValue(true);

      const result = validateSiteConfig(invalidSite);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid Search Console URL format');
    });

    it('should accept valid Search Console URL', () => {
      const validSite: SiteConfig = {
        name: 'test-site',
        localPath: '/path',
        searchConsoleUrl: 'https://search.google.com/search-console'
      };

      mockFs.existsSync.mockReturnValue(true);

      const result = validateSiteConfig(validSite);

      expect(result.valid).toBe(true);
    });
  });

  describe('upsertSiteConfig', () => {
    it('should add new site config', async () => {
      const newSite: SiteConfig = {
        name: 'new-site',
        localPath: '/new/path'
      };

      mockFs.existsSync.mockReturnValue(true);

      await upsertSiteConfig(newSite);

      const expectedSites = [...mockSites, newSite];
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        defaultConfigPath,
        JSON.stringify(expectedSites, null, 2),
        'utf8'
      );
    });

    it('should update existing site config', async () => {
      const updatedSite: SiteConfig = {
        name: 'test-site-1',
        localPath: '/updated/path',
        remote: 'https://updated.com'
      };

      mockFs.existsSync.mockReturnValue(true);

      await upsertSiteConfig(updatedSite);

      const expectedSites = [
        { ...mockSites[0], ...updatedSite },
        mockSites[1]
      ];
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        defaultConfigPath,
        JSON.stringify(expectedSites, null, 2),
        'utf8'
      );
    });

    it('should throw error for invalid site config', async () => {
      const invalidSite = {
        localPath: '/path'
      } as SiteConfig;

      await expect(upsertSiteConfig(invalidSite)).rejects.toThrow('Invalid site configuration');
    });
  });

  describe('removeSiteConfig', () => {
    it('should remove existing site config', async () => {
      const result = await removeSiteConfig('test-site-1');

      expect(result).toBe(true);
      const expectedSites = [mockSites[1]];
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        defaultConfigPath,
        JSON.stringify(expectedSites, null, 2),
        'utf8'
      );
    });

    it('should return false for non-existent site', async () => {
      const result = await removeSiteConfig('non-existent-site');

      expect(result).toBe(false);
      expect(mockFs.writeFileSync).not.toHaveBeenCalled();
    });
  });
});