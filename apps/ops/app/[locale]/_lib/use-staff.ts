"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@mouna/ui";
import type { Locale } from "@mouna/i18n";

export type Staff = { user: { id: string; fullName: string; email: string | null }; staffRoles: string[] };

/** Loads the signed-in staff member; sends to the sign-in page if there is no session. */
export function useStaff(locale: Locale) {
  const [staff, setStaff] = useState<Staff | null>(null);
  useEffect(() => {
    api<Staff>("/auth/staff/me").then(setStaff, (err) => {
      if (err instanceof ApiError && err.status === 401) {
        const next = encodeURIComponent(window.location.pathname);
        window.location.replace(`/${locale}/sign-in?next=${next}`);
      }
    });
  }, [locale]);
  return staff;
}

export async function signOut(locale: Locale) {
  await api("/auth/staff/sign-out", { method: "POST" }).catch(() => undefined);
  window.location.assign(`/${locale}/sign-in`);
}
