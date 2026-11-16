import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

/**
 * POST /api/ypy/contact — stores a contact message.
 *
 * Messages go to the project's SQLite database (table ypy_contact) and, when
 * YPY_CONTACT_WEBHOOK_URL is set, are also forwarded there as JSON. If neither
 * destination accepts the message the request fails, so the form never
 * reports a delivery that did not happen.
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request.' }, { status: 400 });
  }

  if (str(body.website, 200)) return NextResponse.json({ ok: true }); // honeypot

  const msg = {
    name: str(body.name, 120),
    email: str(body.email, 200),
    organization: str(body.organization, 160),
    interest: str(body.interest, 60),
    message: str(body.message, 4000),
  };
  if (!msg.name || !msg.message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(msg.email)) {
    return NextResponse.json({ message: 'Please provide your name, a valid email and a message.' }, { status: 400 });
  }

  let delivered = false;

  try {
    const db = getDb();
    db.exec(`CREATE TABLE IF NOT EXISTS ypy_contact (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      name TEXT NOT NULL, email TEXT NOT NULL, organization TEXT, interest TEXT, message TEXT NOT NULL
    )`);
    db.prepare('INSERT INTO ypy_contact (name, email, organization, interest, message) VALUES (?, ?, ?, ?, ?)').run(
      msg.name,
      msg.email,
      msg.organization,
      msg.interest,
      msg.message,
    );
    delivered = true;
  } catch (e) {
    console.error('[api/ypy/contact] database write failed:', e);
  }

  const hook = process.env.YPY_CONTACT_WEBHOOK_URL;
  if (hook) {
    try {
      const res = await fetch(hook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'ypy-website', ...msg }),
      });
      if (res.ok) delivered = true;
    } catch (e) {
      console.error('[api/ypy/contact] webhook failed:', e);
    }
  }

  if (!delivered) {
    return NextResponse.json(
      { message: 'The contact channel is temporarily unavailable. Please try again later.' },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true });
}
