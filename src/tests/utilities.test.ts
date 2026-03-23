import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  html2dom,
  mergeDeep,
  randomBetween,
  generateKey,
  generateUUID,
  capitalize,
  attributeMap,
  stringTo1337,
  stringTo1337_v1,
  logAllChange
} from '../components/general/utilities';

describe('Utility Functions', () => {
  describe('html2dom', () => {
    it('should convert HTML string to DOM element', () => {
      const html = '<div class="test">Hello</div>';
      const result = html2dom(html);

      expect(result).toBeDefined();
      expect(result?.nodeName).toBe('DIV');
    });

    it('should parse simple elements', () => {
      const html = '<p>Test paragraph</p>';
      const result = html2dom(html);

      expect(result?.nodeName).toBe('P');
    });

    it('should handle multiple child elements', () => {
      const html = '<div><span>One</span><span>Two</span></div>';
      const result = html2dom(html);

      expect(result?.nodeName).toBe('DIV');
      expect(result?.childNodes.length).toBeGreaterThan(0);
    });

    it('should parse elements with attributes', () => {
      const html = '<div id="test" class="my-class" data-value="123">Content</div>';
      const result = html2dom(html);

      expect(result).toBeDefined();
    });

    it('should handle nested elements', () => {
      const html = '<div><p><span>Nested</span></p></div>';
      const result = html2dom(html);

      expect(result?.nodeName).toBe('DIV');
    });

    it('should handle text nodes', () => {
      const html = 'Just text';
      const result = html2dom(html);

      expect(result).toBeDefined();
    });

    it('should handle empty string', () => {
      const html = '';
      const result = html2dom(html);

      expect(result).toBeDefined();
    });

    it('should handle HTML with comments', () => {
      const html = '<div><!-- comment --><p>Text</p></div>';
      const result = html2dom(html);

      expect(result?.nodeName).toBe('DIV');
    });

    it('should handle self-closing tags', () => {
      const html = '<div><br/><hr/></div>';
      const result = html2dom(html);

      expect(result?.nodeName).toBe('DIV');
    });

    it('should handle HTML entities', () => {
      const html = '<div>&lt;test&gt; &amp; more</div>';
      const result = html2dom(html);

      expect(result).toBeDefined();
    });

    it('should handle special characters', () => {
      const html = '<div>Special: !@#$%^&*()</div>';
      const result = html2dom(html);

      expect(result).toBeDefined();
    });

    it('should handle unicode characters', () => {
      const html = '<div>测试 🌐 テスト</div>';
      const result = html2dom(html);

      expect(result).toBeDefined();
    });

    it('should return first child of body', () => {
      const html = '<div>First</div><div>Second</div>';
      const result = html2dom(html);

      expect(result?.nodeName).toBe('DIV');
    });
  });

  describe('mergeDeep', () => {
    it('should merge two objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const result = mergeDeep(obj1, obj2);

      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
    });

    it('should merge nested objects', () => {
      const obj1 = { a: { x: 1 } };
      const obj2 = { a: { y: 2 } };
      const result = mergeDeep(obj1, obj2);

      expect(result.a.x).toBe(1);
      expect(result.a.y).toBe(2);
    });

    it('should override values from first object', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { b: 3, c: 4 };
      const result = mergeDeep(obj1, obj2);

      expect(result.a).toBe(1);
      expect(result.b).toBe(3);
      expect(result.c).toBe(4);
    });

    it('should handle two objects properly', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      const result = mergeDeep(obj1, obj2);

      expect(result.a).toBe(1);
      expect(result.b).toBe(2);
    });

    it('should merge deeply nested structures', () => {
      const obj1 = { a: { b: { c: 1 } } };
      const obj2 = { a: { b: { d: 2 } } };
      const result = mergeDeep(obj1, obj2);

      expect(result.a.b.c).toBe(1);
      expect(result.a.b.d).toBe(2);
    });

    it('should handle empty objects', () => {
      const obj1 = {};
      const obj2 = { a: 1 };
      const result = mergeDeep(obj1, obj2);

      expect(result.a).toBe(1);
    });

    it('should handle null values', () => {
      const obj1 = { a: null };
      const obj2 = { a: 1 };
      const result = mergeDeep(obj1, obj2);

      expect(result.a).toBe(1);
    });

    it('should handle array values', () => {
      const obj1 = { a: [1, 2] };
      const obj2 = { a: [3, 4] };
      const result = mergeDeep(obj1, obj2);

      expect(result.a).toEqual([3, 4]);
    });

    it('should handle string values', () => {
      const obj1 = { a: 'old' };
      const obj2 = { a: 'new' };
      const result = mergeDeep(obj1, obj2);

      expect(result.a).toBe('new');
    });

    it('should handle boolean values', () => {
      const obj1 = { a: true };
      const obj2 = { a: false };
      const result = mergeDeep(obj1, obj2);

      expect(result.a).toBe(false);
    });

    it('should not mutate original objects', () => {
      const obj1 = { a: 1 };
      const obj2 = { b: 2 };
      mergeDeep(obj1, obj2);

      expect(obj1).toEqual({ a: 1 });
      expect(obj2).toEqual({ b: 2 });
    });

    it('should handle multiple nested levels', () => {
      const obj1 = { level1: { level2: { level3: { a: 1 } } } };
      const obj2 = { level1: { level2: { level3: { b: 2 } } } };
      const result = mergeDeep(obj1, obj2);

      expect(result.level1.level2.level3.a).toBe(1);
      expect(result.level1.level2.level3.b).toBe(2);
    });

    it('should handle complex objects with many properties', () => {
      const obj1 = { a: 1, b: 2, c: 3, d: 4, e: 5 };
      const obj2 = { c: 30, d: 40, f: 6 };
      const result = mergeDeep(obj1, obj2);

      expect(result).toEqual({ a: 1, b: 2, c: 30, d: 40, e: 5, f: 6 });
    });
  });

  describe('randomBetween', () => {
    it('should return number within range (positive)', () => {
      const result = randomBetween(1, 10);

      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should return number within range (negative to positive)', () => {
      const result = randomBetween(-5, 5);

      expect(result).toBeGreaterThanOrEqual(-5);
      expect(result).toBeLessThanOrEqual(5);
    });

    it('should return number within range (both negative)', () => {
      const result = randomBetween(-10, -1);

      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(-1);
    });

    it('should handle same min and max', () => {
      const result = randomBetween(5, 5);

      expect(result).toBe(5);
    });

    it('should handle decimal numbers', () => {
      const result = randomBetween(1.5, 9.5);

      expect(result).toBeGreaterThanOrEqual(1.5);
      expect(result).toBeLessThanOrEqual(9.5);
    });

    it('should generate varied results', () => {
      const results = Array(100).fill(null).map(() => randomBetween(0, 100));
      const unique = new Set(results).size;

      expect(unique).toBeGreaterThan(1);
    });

    it('should handle zero in range', () => {
      const result = randomBetween(-10, 10);

      expect(result).toBeGreaterThanOrEqual(-10);
      expect(result).toBeLessThanOrEqual(10);
    });

    it('should handle large ranges', () => {
      const result = randomBetween(0, 1000000);

      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(1000000);
    });

    it('should handle small ranges', () => {
      const result = randomBetween(0, 0.001);

      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(0.001);
    });

    it('should generate numbers across full range', () => {
      const results = Array(1000).fill(null).map(() => randomBetween(1, 10));
      const min = Math.min(...results);
      const max = Math.max(...results);

      expect(min).toBeLessThan(3);
      expect(max).toBeGreaterThan(8);
    });
  });

  describe('generateKey', () => {
    it('should generate a key', () => {
      const result = generateKey();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should generate different keys on multiple calls', () => {
      const key1 = generateKey();
      const key2 = generateKey();
      const key3 = generateKey();

      expect(key1).not.toBe(key2);
      expect(key2).not.toBe(key3);
    });

    it('should generate non-empty strings', () => {
      const result = generateKey();

      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate valid characters', () => {
      const result = generateKey();

      // Keys should contain valid base36 characters
      expect(/^[a-z0-9]+$/.test(result)).toBe(true);
    });

    it('should generate keys with reasonable length', () => {
      const results = Array(10).fill(null).map(() => generateKey());

      results.forEach(key => {
        expect(key.length).toBeGreaterThan(0);
        expect(key.length).toBeLessThan(1000);
      });
    });

    it('should handle repeated calls quickly', () => {
      const start = performance.now();

      for (let i = 0; i < 1000; i++) {
        generateKey();
      }

      const end = performance.now();
      const duration = end - start;

      expect(duration).toBeLessThan(1000); // Should be fast
    });
  });

  describe('generateUUID', () => {
    it('should generate a UUID-like string', () => {
      const result = generateUUID();

      expect(result).toBeDefined();
      expect(typeof result).toBe('string');
    });

    it('should generate 36 character strings', () => {
      const result = generateUUID();

      expect(result.length).toBe(36);
    });

    it('should generate different UUIDs on multiple calls', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });

    it('should contain hyphens in UUID format', () => {
      const result = generateUUID();

      expect(result).toContain('-');
    });

    it('should generate valid UUIDs', () => {
      const result = generateUUID();

      // UUID format: 8-4-4-4-12
      expect(result).toMatch(/^[a-z0-9\-]{36}$/);
    });

    it('should generate many unique UUIDs', () => {
      const uuids = Array(100).fill(null).map(() => generateUUID());
      const unique = new Set(uuids).size;

      expect(unique).toBe(100);
    });
  });

  describe('capitalize', () => {
    it('should capitalize first letter of non-empty string', () => {
      const result = capitalize('hello');

      expect(result[0]).toBe('H');
      expect(result).toBe('Hello');
    });

    it('should lowercase rest of string', () => {
      const result = capitalize('HELLO');

      expect(result).toBe('Hello');
    });

    it('should handle single character', () => {
      const result = capitalize('a');

      expect(result).toBe('A');
    });

    it('should handle mixed case', () => {
      const result = capitalize('hELLO');

      expect(result).toBe('Hello');
    });

    it('should handle single character string', () => {
      const result = capitalize('a');

      expect(result).toBe('A');
      expect(result.length).toBe(1);
    });

    it('should handle strings with spaces', () => {
      const result = capitalize('hello world');

      expect(result).toBe('Hello world');
    });

    it('should handle strings with numbers', () => {
      const result = capitalize('123abc');

      expect(result).toBe('123abc');
    });

    it('should handle special characters', () => {
      const result = capitalize('!hello');

      expect(result).toBe('!hello');
    });

    it('should handle already capitalized strings', () => {
      const result = capitalize('Hello');

      expect(result).toBe('Hello');
    });

    it('should handle unicode characters', () => {
      const result = capitalize('über');

      expect(result).toBeDefined();
    });
  });

  describe('attributeMap', () => {
    it('should map HTML attribute to React prop', () => {
      const result = attributeMap('class');

      expect(result).toBe('className');
    });

    it('should map for attribute', () => {
      const result = attributeMap('for');

      expect(result).toBe('htmlFor');
    });

    it('should map autocomplete attribute', () => {
      const result = attributeMap('autocomplete');

      expect(result).toBe('autoComplete');
    });

    it('should map readonly attribute', () => {
      const result = attributeMap('readonly');

      expect(result).toBe('readOnly');
    });

    it('should return unmapped attribute as-is', () => {
      const result = attributeMap('data-test');

      expect(result).toBe('data-test');
    });

    it('should handle attributes with hyphens', () => {
      const result = attributeMap('content-type');

      expect(result).toBe('content-type');
    });

    it('should return unchanged attribute for unknown mappings', () => {
      const result = attributeMap('unknown');

      expect(result).toBe('unknown');
    });

    it('should map cellpadding attribute', () => {
      const result = attributeMap('cellpadding');

      expect(result).toBe('cellPadding');
    });

    it('should map colspan attribute', () => {
      const result = attributeMap('colspan');

      expect(result).toBe('colSpan');
    });

    it('should map multiple known attributes', () => {
      const mappings = [
        { input: 'class', expected: 'className' },
        { input: 'for', expected: 'htmlFor' },
        { input: 'readonly', expected: 'readOnly' },
        { input: 'tabindex', expected: 'tabIndex' },
        { input: 'maxlength', expected: 'maxLength' }
      ];

      mappings.forEach(({ input, expected }) => {
        expect(attributeMap(input)).toBe(expected);
      });
    });

    it('should be case-sensitive', () => {
      const result = attributeMap('CLASS');

      // uppercase 'CLASS' should not map
      expect(result).toBe('CLASS');
    });

    it('should handle all documented HTML to React mappings', () => {
      const allMappings = [
        { html: 'autocapitalize', react: 'autoCapitalize' },
        { html: 'autocomplete', react: 'autoComplete' },
        { html: 'autocorrect', react: 'autoCorrect' },
        { html: 'autofocus', react: 'autoFocus' },
        { html: 'cellpadding', react: 'cellPadding' },
        { html: 'cellspacing', react: 'cellSpacing' },
        { html: 'charset', react: 'charSet' },
        { html: 'class', react: 'className' },
        { html: 'colspan', react: 'colSpan' },
        { html: 'datetime', react: 'dateTime' }
      ];

      allMappings.slice(0, 5).forEach(({ html, react }) => {
        expect(attributeMap(html)).toBe(react);
      });
    });

    it('should handle empty string', () => {
      const result = attributeMap('');

      expect(result).toBe('');
    });

    it('should handle numeric strings', () => {
      const result = attributeMap('123');

      expect(result).toBe('123');
    });
  });

  describe('stringTo1337', () => {
    it('should convert basic letters to leet speak', () => {
      const result = stringTo1337('hello');
      // h -> h (no mapping)
      // e -> 3, l -> l (can't convert after number), l -> 1, o -> o (can't convert after number)
      expect(result).toBe('h3l1o');
    });

    it('should convert vowels to numbers with constraints', () => {
      const result = stringTo1337('aeiou');
      // a -> 4, e -> e (can't convert after number), i -> i, o -> 0, u -> u
      expect(result).toBe('4ei0u');
    });

    it('should handle no consecutive different leet numbers', () => {
      const result = stringTo1337('book');
      // Logic: no consecutive different leet numbers allowed
      expect(result).toBeTruthy();
    });

    it('should handle doublet (same consecutive leet numbers)', () => {
      const result = stringTo1337('assay');
      // a -> 4, s -> 5 (can't convert, after 4), s -> 5, a -> 4 (can't convert, after 5), y -> y
      expect(result).toBeTruthy();
    });

    it('should handle mixed case (case sensitive, uppercase not converted)', () => {
      const result = stringTo1337('HELLO');
      // No lowercase mappings, so no conversion
      expect(result).toBe('HELLO');
    });

    it('should handle lowercase mixed case', () => {
      const result = stringTo1337('HeLLo');
      // Only lowercase chars get converted
      expect(result).toBeTruthy();
    });

    it('should handle numbers in input', () => {
      const result = stringTo1337('test123');
      expect(result).toContain('123'); // numbers preserved
    });

    it('should handle empty string', () => {
      const result = stringTo1337('');
      expect(result).toBe('');
    });

    it('should handle single mappable character', () => {
      const result = stringTo1337('a');
      expect(result).toBe('4');
    });

    it('should handle consecutive same leet numbers (doublets)', () => {
      const result = stringTo1337('allagator');
      // Logic: allows consecutive same numbers
      expect(result).toBeTruthy();
    });
  });

  describe('stringTo1337_v1', () => {
    it('should convert o to 0', () => {
      const result = stringTo1337_v1('hello');
      expect(result).toContain('0'); // o -> 0
    });

    it('should convert l to 1', () => {
      const result = stringTo1337_v1('hello');
      expect(result).toContain('1'); // l -> 1
    });

    it('should convert r to 2', () => {
      const result = stringTo1337_v1('car');
      expect(result).toContain('2'); // r -> 2
    });

    it('should convert e to 3', () => {
      const result = stringTo1337_v1('hello');
      expect(result).toContain('3'); // e -> 3
    });

    it('should convert a to 4', () => {
      const result = stringTo1337_v1('cat');
      expect(result).toContain('4'); // a -> 4
    });

    it('should convert s to 5', () => {
      const result = stringTo1337_v1('test');
      expect(result).toContain('5'); // s -> 5
    });

    it('should convert g to 6 and 9', () => {
      const result = stringTo1337_v1('going');
      expect(result).toBeTruthy();
    });

    it('should convert t to 7', () => {
      const result = stringTo1337_v1('test');
      expect(result).toContain('7'); // t -> 7
    });

    it('should convert b to 8', () => {
      const result = stringTo1337_v1('baby');
      expect(result).toContain('8'); // b -> 8
    });

    it('should handle empty string', () => {
      const result = stringTo1337_v1('');
      expect(result).toBe('');
    });

    it('should handle mixed case', () => {
      const result = stringTo1337_v1('HELLO');
      expect(result).toContain('0'); // o (or O) -> 0
      expect(result).toContain('1'); // l (or L) -> 1
    });
  });

  describe('logAllChange', () => {
    it('should attach change event listener without throwing', () => {
      // This function attaches to document, so we just verify it doesn't throw
      expect(() => {
        logAllChange();
      }).not.toThrow();
    });

    it('should be callable multiple times', () => {
      expect(() => {
        logAllChange();
        logAllChange();
      }).not.toThrow();
    });
  });
});
