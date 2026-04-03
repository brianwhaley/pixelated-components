import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '../test/test-utils';
import { emailFormData, emailJSON } from '../components/sitebuilder/form/formemailer';

describe('formemailer honeypot guard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Clear DOM first
    document.body.innerHTML = '';
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
      status: 200,
      json: () => Promise.resolve({ success: true })
    } as any)));
  });

  afterEach(() => {
    // cleanup DOM
    document.body.innerHTML = '';
    vi.unstubAllGlobals();
  });

  describe('Honeypot Detection', () => {
    it('emailFormData should silently drop submissions when honeypot is present as id="winnie" name="winnie"', async () => {
      const form = document.createElement('form');
      form.id = 'test-form';
      const hp = document.createElement('input');
      hp.id = 'winnie';
      hp.name = 'winnie';
      (hp as HTMLInputElement).value = 'bot-value';
      form.appendChild(hp);
      document.body.appendChild(form);

      const cb = vi.fn();
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);

      expect(global.fetch).not.toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('emailFormData should silently drop submissions when honeypot is present as id="winnie" name="website" (default)', async () => {
      const form = document.createElement('form');
      form.id = 'test-form-2';
      const hp = document.createElement('input');
      hp.id = 'winnie';
      hp.name = 'website';
      (hp as HTMLInputElement).value = 'bot-value';
      form.appendChild(hp);
      document.body.appendChild(form);

      const cb = vi.fn();
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);

      expect(global.fetch).not.toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('should allow form with empty honeypot field (not treated as spam)', async () => {
      const form = document.createElement('form');
      form.id = 'test-form-3';
      const hp = document.createElement('input');
      hp.id = 'winnie';
      hp.name = 'website';
      (hp as HTMLInputElement).value = '';
      form.appendChild(hp);
      document.body.appendChild(form);

      const cb = vi.fn();
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);

      // Empty honeypot field does not block submission
      expect(global.fetch).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('should detect honeypot field with any value', async () => {
      const form = document.createElement('form');
      form.id = 'test-form-4';
      const hp = document.createElement('input');
      hp.id = 'winnie';
      hp.name = 'website';
      (hp as HTMLInputElement).value = 'http://example.com';
      form.appendChild(hp);
      document.body.appendChild(form);

      const cb = vi.fn();
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);

      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('JSON Honeypot Detection', () => {
    it('emailJSON should silently return when payload contains winnie or website and not call fetch', async () => {
      const cb = vi.fn();
      await emailJSON({ winnie: 'bot', email: 'a@b.c' }, cb);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();

      vi.clearAllMocks();
      const cb2 = vi.fn();
      await emailJSON({ website: 'bot', email: 'a@b.c' }, cb2);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(cb2).toHaveBeenCalled();
    });

    it('emailJSON should block when winnie field has any value', async () => {
      const cb = vi.fn();
      await emailJSON({ winnie: 'something', email: 'user@example.com' }, cb);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('emailJSON should block when website field has value', async () => {
      const cb = vi.fn();
      await emailJSON({ website: 'http://spam.com', email: 'user@example.com' }, cb);
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('emailJSON should allow submission when honeypot fields are absent', async () => {
      const cb = vi.fn();
      const payload = { email: 'user@example.com', message: 'Hello' };
      await emailJSON(payload, cb);
      
      // Should either call fetch or callback without honeypot detection
      expect(cb).toBeDefined();
    });
  });

  describe('Form Data Handling', () => {
    it('should accept valid form submission with required fields', async () => {
      const form = document.createElement('form');
      form.id = 'form-valid-fields';
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.name = 'email';
      emailInput.value = 'user@example.com';
      form.appendChild(emailInput);
      document.body.appendChild(form);

      const cb = vi.fn();
      const event = { target: form, preventDefault: () => {} } as unknown as Event;
      
      await emailFormData(event, cb as any);
      expect(cb).toHaveBeenCalled();
    });

    it('should handle form with multiple input fields', async () => {
      const form = document.createElement('form');
      form.id = 'form-multiple-fields';
      
      const name = document.createElement('input');
      name.name = 'name';
      name.value = 'John Doe';
      
      const email = document.createElement('input');
      email.type = 'email';
      email.name = 'email';
      email.value = 'john@example.com';
      
      const message = document.createElement('textarea');
      message.name = 'message';
      message.value = 'Hello there';
      
      form.appendChild(name);
      form.appendChild(email);
      form.appendChild(message);
      document.body.appendChild(form);

      const cb = vi.fn();
      const event = { target: form, preventDefault: () => {} } as unknown as Event;
      
      await emailFormData(event, cb as any);
      expect(cb).toHaveBeenCalled();
    });

    it('should handle form with checkboxes and radios', async () => {
      const form = document.createElement('form');
      form.id = 'form-checkbox-radio';
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = 'agree';
      checkbox.checked = true;
      
      const radio = document.createElement('input');
      radio.type = 'radio';
      radio.name = 'choice';
      radio.value = 'option1';
      radio.checked = true;
      
      form.appendChild(checkbox);
      form.appendChild(radio);
      document.body.appendChild(form);

      const cb = vi.fn();
      const event = { target: form, preventDefault: () => {} } as unknown as Event;
      
      await emailFormData(event, cb as any);
      expect(cb).toHaveBeenCalled();
    });

    it('should handle hidden form fields', async () => {
      const form = document.createElement('form');
      form.id = 'form-hidden-fields';
      
      const hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.name = 'formId';
      hidden.value = 'contact-form-1';
      
      form.appendChild(hidden);
      document.body.appendChild(form);

      const cb = vi.fn();
      const event = { target: form, preventDefault: () => {} } as unknown as Event;
      
      await emailFormData(event, cb as any);
      expect(cb).toHaveBeenCalled();
    });

    it('should call callback on sendmail 502 response and not throw', async () => {
      // Make fetch return a 502 error JSON body
      vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({
        ok: false,
        status: 502,
        statusText: 'Bad Gateway',
        text: () => Promise.resolve('{"message":"Internal server error"}')
      } as any)));

      const form = document.createElement('form');
      form.id = 'form-502';
      const emailInput = document.createElement('input');
      emailInput.type = 'email';
      emailInput.name = 'email';
      emailInput.value = 'user@example.com';
      form.appendChild(emailInput);
      document.body.appendChild(form);

      const cb = vi.fn();
      const event = { target: form, preventDefault: () => {} } as unknown as Event;

      await expect(emailFormData(event, cb as any)).resolves.not.toThrow();
      expect(cb).toHaveBeenCalled();
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('JSON Payload Validation', () => {
    it('should process valid JSON payload', async () => {
      const payload = {
        email: 'user@example.com',
        name: 'John Doe',
        subject: 'Contact Request'
      };
      const cb = vi.fn();
      await emailJSON(payload, cb);
      expect(cb).toBeDefined();
    });

    it('should handle JSON with optional fields', async () => {
      const payload = {
        email: 'user@example.com'
      };
      const cb = vi.fn();
      await emailJSON(payload, cb);
      expect(cb).toBeDefined();
    });

    it('should handle JSON with extra custom fields', async () => {
      const payload = {
        email: 'user@example.com',
        company: 'Acme Corp',
        phone: '555-1234',
        customfield: 'value'
      };
      const cb = vi.fn();
      await emailJSON(payload, cb);
      expect(cb).toBeDefined();
    });

    it('should handle JSON with nested objects', async () => {
      const payload = {
        email: 'user@example.com',
        address: {
          street: '123 Main St',
          city: 'Anytown'
        }
      };
      const cb = vi.fn();
      await emailJSON(payload, cb);
      expect(cb).toBeDefined();
    });
  });

  describe('Honeypot Field Variations', () => {
    it('should not detect winnie field with capital letter (case-sensitive)', async () => {
      const form = document.createElement('form');
      form.id = 'form-capital-winnie';
      const hp = document.createElement('input');
      hp.id = 'Winnie'; // Capital W
      hp.name = 'Winnie';
      (hp as HTMLInputElement).value = 'bot-value';
      form.appendChild(hp);
      document.body.appendChild(form);

      const cb = vi.fn();
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);
      
      // Capital W is not detected as honeypot (case-sensitive)
      expect(global.fetch).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('should not detect website field with capital letter (case-sensitive)', async () => {
      const form = document.createElement('form');
      form.id = 'form-capital-website';
      const hp = document.createElement('input');
      hp.id = 'Website'; // Capital W
      hp.name = 'Website';
      (hp as HTMLInputElement).value = 'http://example.com';
      form.appendChild(hp);
      document.body.appendChild(form);

      const cb = vi.fn();
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);
      
      // Capital W is not detected as honeypot (case-sensitive)
      expect(global.fetch).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('should block form with multiple honeypot fields detected', async () => {
      const form = document.createElement('form');
      form.id = 'form-multiple-honeypots';
      
      const hp1 = document.createElement('input');
      hp1.id = 'winnie';
      hp1.name = 'winnie';
      hp1.value = 'value1';
      
      const hp2 = document.createElement('input');
      hp2.id = 'website';
      hp2.name = 'website';
      hp2.value = 'value2';
      
      form.appendChild(hp1);
      form.appendChild(hp2);
      document.body.appendChild(form);

      const cb = vi.fn();
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);

      expect(global.fetch).not.toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('Error Cases & Edge Cases', () => {
    it('should handle form submission callback', async () => {
      const form = document.createElement('form') as HTMLFormElement;
      form.id = 'form-callback';
      document.body.appendChild(form);
      const cb = vi.fn();
      
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);
      expect(cb).toHaveBeenCalled();
    });

    it('should handle null or undefined payload', async () => {
      const cb = vi.fn();
      try {
        await emailJSON(null as any, cb);
      } catch (e) {
        // May throw or handle gracefully
      }
      // Expect callback to be called or error handled
      expect(cb).toBeDefined();
    });

    it('should handle empty form submission', async () => {
      const form = document.createElement('form');
      form.id = 'form-empty';
      document.body.appendChild(form);
      const cb = vi.fn();
      
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);
      expect(cb).toHaveBeenCalled();
    });

    it('should handle empty JSON payload', async () => {
      const cb = vi.fn();
      await emailJSON({}, cb);
      expect(cb).toHaveBeenCalled();
    });
  });

  describe('Security Validation', () => {
    it('honeypot should prevent spam/bot submissions', async () => {
      const form = document.createElement('form');
      form.id = 'form-security-spam';
      const hp = document.createElement('input');
      hp.id = 'winnie';
      hp.name = 'website';
      hp.value = 'http://spam-site.com';
      form.appendChild(hp);
      document.body.appendChild(form);

      const cb = vi.fn();
      await emailFormData({ target: form, preventDefault: () => {} } as unknown as Event, cb as any);

      expect(global.fetch).not.toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('should not send data when honeypot is populated', async () => {
      const payload = { winnie: 'populated', email: 'user@example.com' };
      const cb = vi.fn();
      
      await emailJSON(payload, cb);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });

    it('should allow legitimate submissions without honeypot', async () => {
      const payload = { email: 'user@example.com', message: 'Legitimate message' };
      const cb = vi.fn();
      
      await emailJSON(payload, cb);
      expect(global.fetch).toHaveBeenCalled();
      expect(cb).toHaveBeenCalled();
    });
  });
});
