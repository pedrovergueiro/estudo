'use client';

import { useState } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/ypy/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { message?: string };
        throw new Error(body.message || 'Your message could not be delivered. Please try again later.');
      }
      form.reset();
      setStatus('sent');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Your message could not be delivered.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="y-form y-form--done" role="status">
        <p>Message received.</p>
        <span>Thank you for reaching out — the YPY team will read it.</span>
        <button type="button" onClick={() => setStatus('idle')}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="y-form" onSubmit={submit}>
      <div className="y-field">
        <label htmlFor="c-name">Name</label>
        <input id="c-name" name="name" type="text" autoComplete="name" required maxLength={120} />
      </div>
      <div className="y-field">
        <label htmlFor="c-email">Email</label>
        <input id="c-email" name="email" type="email" autoComplete="email" required maxLength={200} />
      </div>
      <div className="y-field">
        <label htmlFor="c-org">Organization</label>
        <input id="c-org" name="organization" type="text" autoComplete="organization" maxLength={160} />
      </div>
      <div className="y-field">
        <label htmlFor="c-interest">I am reaching out as</label>
        <select id="c-interest" name="interest" defaultValue="Technology partner">
          <option>Investor</option>
          <option>Technology partner</option>
          <option>Agribusiness / producer</option>
          <option>Research</option>
          <option>Other</option>
        </select>
      </div>
      <div className="y-field y-field--wide">
        <label htmlFor="c-msg">Message</label>
        <textarea id="c-msg" name="message" rows={4} required maxLength={4000} />
      </div>
      {/* Honeypot: hidden from people, tempting for bots. */}
      <div className="y-hp" aria-hidden="true">
        <label htmlFor="c-site">Website</label>
        <input id="c-site" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="y-form__foot">
        <button type="submit" disabled={status === 'sending'}>
          <span>{status === 'sending' ? 'Sending…' : 'Send message'}</span>
          <i aria-hidden="true">→</i>
        </button>
        <p role="alert">{status === 'error' ? error : ''}</p>
      </div>
    </form>
  );
}
