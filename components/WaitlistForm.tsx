"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

type Status = "idle" | "loading" | "success" | "error";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function WaitlistForm({
  variant = "hero",
  source = "hero",
  onSuccess,
}: {
  variant?: "hero" | "final";
  source?: string;
  onSuccess?: () => void;
}) {
  const reduce = useReducedMotion();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const inputId = useId();
  const statusId = useId();

  const invalid = status === "error";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      setMessage("Hmm, that email looks a little sus. Try again?");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, company }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Something glitched. Try again in a sec.");
      }

      setStatus("success");
      setMessage("You're in line! We'll ping you the second it drops.");
      onSuccess?.();
    } catch (err) {
      setStatus("error");
      setMessage(
        err instanceof Error
          ? err.message
          : "Something glitched. Try again in a sec.",
      );
    }
  }

  const big = variant === "hero";

  if (status === "success") {
    return (
      <motion.div
        initial={reduce ? false : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 16 }}
        className={`card-pop ${
          big ? "p-5 sm:p-6" : "p-5"
        } bg-lime text-ink`}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-white">
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                d="M5 13l4 4L19 7"
                fill="none"
                stroke="#1A1030"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <div>
            <p className="font-display text-xl font-extrabold leading-tight sm:text-2xl">
              YOU&apos;RE IN LINE!
            </p>
            <p className="mt-1 font-semibold text-ink/80">
              We&apos;ll ping <span className="font-extrabold">{email}</span> the
              second it drops. Now go recruit your most suspicious friend.
            </p>
            <ShareButton />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className={`w-full ${big ? "max-w-xl" : "max-w-lg"}`}
    >
      <div
        className={`flex flex-col gap-3 sm:flex-row ${
          big ? "" : "sm:gap-2"
        }`}
      >
        <div className="flex-1">
          <label htmlFor={inputId} className="sr-only">
            Email address
          </label>
          <input
            id={inputId}
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@catchyourfriends.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === "error") setStatus("idle");
            }}
            aria-invalid={invalid}
            aria-describedby={message ? statusId : undefined}
            className={`w-full rounded-pill border-[3px] bg-white px-5 font-sans text-lg font-bold text-ink placeholder:text-ink/40 shadow-pop-sm focus:outline-none ${
              big ? "py-4" : "py-3.5"
            } ${invalid ? "border-danger" : "border-ink"}`}
          />
        </div>

        {/* honeypot — hidden from humans, catches bots */}
        <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor={`${inputId}-company`}>Company</label>
          <input
            id={`${inputId}-company`}
            tabIndex={-1}
            autoComplete="off"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.95 }}
          disabled={status === "loading"}
          className={`btn-pop bg-magenta text-white disabled:opacity-70 ${
            big ? "text-xl" : ""
          }`}
        >
          {status === "loading" ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> HOLD UP…
            </span>
          ) : (
            "GET EARLY ACCESS"
          )}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {message && status === "error" && (
          <motion.p
            key="err"
            id={statusId}
            role="alert"
            aria-live="assertive"
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-2 pl-2 font-bold text-danger-deep"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="mt-2 pl-2 text-sm font-semibold text-ink/55">
        No spam, ever. Just one “it&apos;s live!” text. Unsubscribe anytime.
      </p>
    </form>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="3" opacity="0.3" />
      <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function ShareButton() {
  const [copied, setCopied] = useState(false);
  async function share() {
    const shareData = {
      title: "TRUTHERAAA",
      text: "I just skipped the line for the funniest lie-detector party app. Get in before me 👀",
      url: typeof window !== "undefined" ? window.location.href : "",
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled — no-op */
    }
  }
  return (
    <button
      type="button"
      onClick={share}
      className="btn-pop mt-3 bg-white text-ink shadow-pop-sm"
    >
      {copied ? "LINK COPIED!" : "CHALLENGE A FRIEND"}
    </button>
  );
}
