"use client";

import type { ReactNode } from "react";
import { AppShell } from "@mouna/ui";
import type { Locale } from "@mouna/i18n";
import { strings } from "./strings";
import { signOut, useStaff } from "./use-staff";

/** Signed-in back-office frame: waits for the session, shows who is signed in. */
export function OpsShell({ locale, path, children }: { locale: Locale; path: string; children: ReactNode }) {
  const s = strings[locale];
  const staff = useStaff(locale);
  return (
    <AppShell
      locale={locale}
      appName={s.appName}
      path={path}
      nav={
        staff ? (
          <>
            <span className="hidden text-sm text-[var(--color-ink-muted)] sm:inline">{staff.user.fullName}</span>
            <button className="text-sm text-[var(--color-pine)] underline" onClick={() => signOut(locale)}>
              {s.signOut}
            </button>
          </>
        ) : null
      }
    >
      {staff ? children : <p className="text-[var(--color-ink-muted)]">{s.loading}</p>}
    </AppShell>
  );
}
