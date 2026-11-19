"use client";

import { useState } from "react";
import type { Locale } from "@mouna/i18n";
import { api, ApiError } from "./api";
import { ErrorNote, Field, Input } from "./forms";
import { Button } from "./index";

const t = {
  ar: {
    title: "تسجيل الدخول",
    idLabelStaff: "البريد الإلكتروني",
    idLabelClient: "رقم الجوال أو البريد الإلكتروني",
    idHintClient: "نرسل الرمز عبر واتساب إلى الجوال، أو إلى البريد الإلكتروني.",
    send: "أرسل الرمز",
    codeLabel: "رمز التحقق",
    codeSentWhatsapp: "أرسلنا رمزاً من ٦ أرقام عبر واتساب إلى",
    codeSentEmail: "أرسلنا رمزاً من ٦ أرقام إلى",
    verify: "دخول",
    change: "تغيير",
    devShow: "بيئة التطوير: اعرض الرمز",
    errors: {
      invalid_identifier: "تحقق من الرقم أو البريد.",
      invalid_code: "الرمز غير صحيح أو انتهت صلاحيته.",
      too_many_attempts: "محاولات كثيرة. اطلب رمزاً جديداً.",
      too_soon: "انتظر دقيقة قبل طلب رمز جديد.",
      too_many_codes: "طلبات كثيرة. حاول بعد ساعة.",
      generic: "حدث خطأ. حاول مرة أخرى.",
    } as Record<string, string>,
  },
  en: {
    title: "Sign in",
    idLabelStaff: "Email",
    idLabelClient: "Mobile number or email",
    idHintClient: "We send the code by WhatsApp to your mobile, or to your email.",
    send: "Send code",
    codeLabel: "Verification code",
    codeSentWhatsapp: "We sent a 6-digit code by WhatsApp to",
    codeSentEmail: "We sent a 6-digit code to",
    verify: "Sign in",
    change: "Change",
    devShow: "Development: show code",
    errors: {
      invalid_identifier: "Check the number or email.",
      invalid_code: "The code is wrong or has expired.",
      too_many_attempts: "Too many tries. Ask for a new code.",
      too_soon: "Wait a minute before asking for a new code.",
      too_many_codes: "Too many requests. Try again in an hour.",
      generic: "Something went wrong. Try again.",
    } as Record<string, string>,
  },
};

export function SignInForm({ audience, locale, next }: { audience: "staff" | "client"; locale: Locale; next: string }) {
  const s = t[locale];
  const [identifier, setIdentifier] = useState("");
  const [code, setCode] = useState("");
  const [channel, setChannel] = useState<"whatsapp" | "email" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const fail = (err: unknown) => {
    const key = err instanceof ApiError ? (err.body.error ?? "") : "";
    setError(s.errors[key] ?? s.errors.generic!);
  };

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ channel: "whatsapp" | "email" }>(`/auth/${audience}/code`, { body: { identifier } });
      setChannel(res.channel);
    } catch (err) {
      fail(err);
    } finally {
      setBusy(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api(`/auth/${audience}/verify`, { body: { identifier, code } });
      window.location.assign(next);
    } catch (err) {
      fail(err);
      setBusy(false);
    }
  }

  async function devShowCode() {
    try {
      const res = await api<{ code: string }>(`/dev/last-code?identifier=${encodeURIComponent(identifier)}`);
      setCode(res.code);
    } catch {
      /* no code was sent to this identifier */
    }
  }

  return (
    <div className="mx-auto mt-10 max-w-sm rounded-[var(--radius)] border border-[var(--color-mist)] bg-white p-6">
      <h1 className="mb-5 text-2xl font-bold">{s.title}</h1>
      {!channel ? (
        <form onSubmit={sendCode} className="space-y-4">
          <Field label={audience === "staff" ? s.idLabelStaff : s.idLabelClient} hint={audience === "client" ? s.idHintClient : undefined}>
            <Input
              dir="ltr"
              autoFocus
              required
              inputMode={audience === "staff" ? "email" : "text"}
              autoComplete={audience === "staff" ? "email" : "username"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={audience === "staff" ? "name@mouna.sa" : "05XXXXXXXX"}
            />
          </Field>
          {error ? <ErrorNote>{error}</ErrorNote> : null}
          <Button type="submit" disabled={busy} className="w-full">
            {s.send}
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <p className="text-sm text-[var(--color-ink-muted)]">
            {channel === "whatsapp" ? s.codeSentWhatsapp : s.codeSentEmail}{" "}
            <span dir="ltr" className="font-medium text-[var(--color-ink)]">
              {identifier}
            </span>{" "}
            <button
              type="button"
              className="text-[var(--color-pine)] underline"
              onClick={() => {
                setChannel(null);
                setCode("");
                setError(null);
              }}
            >
              {s.change}
            </button>
          </p>
          <Field label={s.codeLabel}>
            <Input
              dir="ltr"
              autoFocus
              required
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="\d{6}"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="text-center text-2xl tracking-[0.5em]"
            />
          </Field>
          {error ? <ErrorNote>{error}</ErrorNote> : null}
          <Button type="submit" disabled={busy || code.length !== 6} className="w-full">
            {s.verify}
          </Button>
          {process.env.NODE_ENV !== "production" ? (
            <button type="button" onClick={devShowCode} className="w-full text-xs text-[var(--color-ink-muted)] underline">
              {s.devShow}
            </button>
          ) : null}
        </form>
      )}
    </div>
  );
}
