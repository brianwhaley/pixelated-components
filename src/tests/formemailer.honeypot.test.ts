import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '../test/test-utils';
import { emailFormData, emailJSON } from '../components/sitebuilder/form/formemailer';

describe('formemailer honeypot guard', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    // cleanup DOM
    document.body.innerHTML = '';
  });

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

});
