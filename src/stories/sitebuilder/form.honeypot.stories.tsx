import React, { useEffect, useState } from 'react';
import { FormInput, FormTextarea, FormHoneypot } from '../../components/sitebuilder/form/formcomponents';
import { emailFormData } from '../../components/sitebuilder/form/formemailer';
import { FormValidationProvider } from '../../components/sitebuilder/form/formvalidator';

export default {
  title: 'Admin/Sitebuilder/Form',
  parameters: {
    layout: 'centered',
    docs: { description: { component: 'Demonstrates the honeypot (id="winnie") and how the formemailer silently drops bot submissions.' } }
  }
};

export const HoneypotReject = () => {
  const [status, setStatus] = useState<string>('idle');
  const [fetchCalled, setFetchCalled] = useState<boolean | null>(null);

  useEffect(() => {
    const orig = window.fetch;
    // instrument fetch so the story can show whether a network call was attempted
    // (the real emailFormData should NOT call fetch when honeypot is filled)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - running in Storybook iframe
    window.fetch = async (...args: any[]) => {
      setFetchCalled(true);
      // return a benign successful response if invoked
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    };
    setFetchCalled(false);
    return () => {
      // restore
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.fetch = orig;
    };
  }, []);

  useEffect(() => {
    // ensure the honeypot starts empty (human view) — user can toggle in the story
    const hp = document.getElementById('winnie') as HTMLInputElement | null;
    if (hp) hp.value = '';
  }, []);

  const submitHandler = async (e: Event) => {
    setStatus('submitting');
    await emailFormData(e, () => {
      setStatus('callback-invoked');
    });
  };

  const simulateBot = async () => {
    const hp = document.getElementById('winnie') as HTMLInputElement | null;
    if (hp) hp.value = 'bot-filled';
    const form = document.getElementById('storybook-contact-form') as HTMLFormElement | null;
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  const simulateHuman = async () => {
    const hp = document.getElementById('winnie') as HTMLInputElement | null;
    if (hp) hp.value = '';
    const form = document.getElementById('storybook-contact-form') as HTMLFormElement | null;
    form?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  };

  return (
    <div style={{ width: 680, padding: 24, boxShadow: '0 6px 18px rgba(0,0,0,.08)' }}>
      <FormValidationProvider>
        <form id="storybook-contact-form" name="contact-us" onSubmit={(e) => { e.preventDefault(); submitHandler(e as unknown as Event); }}>
          <FormInput id="name" name="name" placeholder="Your name" defaultValue="Alex" />
          <FormInput id="email" name="email" placeholder="you@example.com" defaultValue="alex@example.test" />
          <FormTextarea id="message" name="message" placeholder="How can we help?" defaultValue="Hello!" />

          {/* Honeypot (invisible) */}
          <FormHoneypot id="winnie" name="website" />

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button type="submit">Submit</button>
            <button type="button" data-testid="simulate-human" onClick={simulateHuman}>Simulate human submit</button>
            <button type="button" data-testid="simulate-bot" onClick={simulateBot}>Simulate bot submit</button>
          </div>

          <div style={{ marginTop: 16, fontSize: 13 }}>
            <div><strong>Status:</strong> <span data-testid="status">{status}</span></div>
            <div><strong>Network attempted:</strong> <span data-testid="fetchCalled">{String(fetchCalled)}</span></div>
            <div style={{ marginTop: 8, color: '#6b7280' }}>
              - Fill the honeypot (bot) and press <em>Simulate bot submit</em> — the emailer should silently drop the request (no network call).
            </div>
          </div>
        </form>
      </FormValidationProvider>
    </div>
  );
};

HoneypotReject.storyName = 'Honeypot';

HoneypotReject.play = async (context: { canvasElement: HTMLElement }) => {
  const { canvasElement } = context;
  // click the story's "simulate bot" button and wait for the story to finish
  const botBtn = canvasElement.querySelector('[data-testid="simulate-bot"]') as HTMLButtonElement | null;
  botBtn?.click();
  // wait until the status indicates the submit callback fired (or timeout)
  const statusEl = canvasElement.querySelector('[data-testid="status"]');
  const start = Date.now();
  while ((statusEl?.textContent ?? '') !== 'callback-invoked' && Date.now() - start < 2000) {
    // small tick
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 30));
  }
  const fetchText = (canvasElement.querySelector('[data-testid="fetchCalled"]')?.textContent || '').trim().toLowerCase();
  if (fetchText === 'true') {
    throw new Error('Expected no network call when honeypot is filled');
  }
};

// Play: asserts honeypot causes emailer to silently drop the submission (no network call).
