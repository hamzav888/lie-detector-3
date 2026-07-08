import { NextResponse } from "next/server";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Body = {
  email?: string;
  source?: string;
  company?: string; // honeypot
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const source = (body.source ?? "unknown").slice(0, 60);

  // Honeypot: real users never fill this hidden field.
  if (body.company) {
    return NextResponse.json({ ok: true }); // silently accept, ignore bot
  }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "That email doesn't look right." },
      { status: 422 },
    );
  }

  const provider = (process.env.WAITLIST_PROVIDER ?? "console").toLowerCase();

  try {
    switch (provider) {
      case "resend":
        await addToResend(email);
        break;
      case "convertkit":
        await addToConvertKit(email);
        break;
      case "mailchimp":
        await addToMailchimp(email);
        break;
      case "formspree":
        await addToFormspree(email, source);
        break;
      case "console":
      default:
        // Zero-config default so the form works in development.
        console.log(`[waitlist] new signup: ${email} (source: ${source})`);
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[waitlist] provider error:", err);
    return NextResponse.json(
      { ok: false, error: "Our list hiccuped. Please try again in a moment." },
      { status: 502 },
    );
  }
}

/* ────────────────────────────────────────────────────────────────
 * PROVIDER INTEGRATIONS
 * Pick ONE, set WAITLIST_PROVIDER in .env.local, and fill in its keys.
 * Each function throws on failure; the handler turns that into a 502.
 * ──────────────────────────────────────────────────────────────── */

// ── Resend ── https://resend.com/docs/api-reference/contacts/create-contact
async function addToResend(email: string) {
  // TODO: set RESEND_API_KEY and RESEND_AUDIENCE_ID in .env.local
  const key = requireEnv("RESEND_API_KEY");
  const audienceId = requireEnv("RESEND_AUDIENCE_ID");
  const res = await fetch(
    `https://api.resend.com/audiences/${audienceId}/contacts`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, unsubscribed: false }),
    },
  );
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

// ── ConvertKit ── https://developers.convertkit.com/#add-subscriber-to-a-form
async function addToConvertKit(email: string) {
  // TODO: set CONVERTKIT_API_KEY and CONVERTKIT_FORM_ID in .env.local
  const key = requireEnv("CONVERTKIT_API_KEY");
  const formId = requireEnv("CONVERTKIT_FORM_ID");
  const res = await fetch(
    `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: key, email }),
    },
  );
  if (!res.ok) throw new Error(`ConvertKit ${res.status}: ${await res.text()}`);
}

// ── Mailchimp ── https://mailchimp.com/developer/marketing/api/list-members/
async function addToMailchimp(email: string) {
  // TODO: set MAILCHIMP_API_KEY, MAILCHIMP_DC (e.g. "us21"), MAILCHIMP_AUDIENCE_ID
  const key = requireEnv("MAILCHIMP_API_KEY");
  const dc = requireEnv("MAILCHIMP_DC");
  const audienceId = requireEnv("MAILCHIMP_AUDIENCE_ID");
  const res = await fetch(
    `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`anystring:${key}`).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email_address: email, status: "subscribed" }),
    },
  );
  // 400 with "Member Exists" is fine — treat as success.
  if (!res.ok) {
    const text = await res.text();
    if (!text.includes("Member Exists")) {
      throw new Error(`Mailchimp ${res.status}: ${text}`);
    }
  }
}

// ── Formspree ── https://formspree.io (easiest, no server keys needed)
async function addToFormspree(email: string, source: string) {
  // TODO: set FORMSPREE_FORM_ID in .env.local (the hash from your form URL)
  const formId = requireEnv("FORMSPREE_FORM_ID");
  const res = await fetch(`https://formspree.io/f/${formId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, source }),
  });
  if (!res.ok) throw new Error(`Formspree ${res.status}: ${await res.text()}`);
}

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    throw new Error(
      `Missing ${name}. Set it in .env.local (see .env.local.example).`,
    );
  }
  return v;
}
