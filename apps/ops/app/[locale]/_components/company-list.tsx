"use client";

import { useEffect, useState } from "react";
import { api, Badge, Input } from "@mouna/ui";
import type { Locale } from "@mouna/i18n";
import { strings } from "../_lib/strings";

type Row = { id: string; nameAr: string; nameEn: string; status: string; sizeBand: string | null; siteCount: number };

export function CompanyList({ locale }: { locale: Locale }) {
  const s = strings[locale];
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    const handle = setTimeout(() => {
      api<Row[]>(`/ops/companies${q ? `?q=${encodeURIComponent(q)}` : ""}`).then(setRows, () => setRows([]));
    }, 250);
    return () => clearTimeout(handle);
  }, [q]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{s.companies}</h1>
        <a
          href={`/${locale}/companies/new`}
          className="rounded-[var(--radius)] bg-[var(--color-pine)] px-4 py-2 font-medium text-white hover:bg-[var(--color-pine-dark)]"
        >
          {s.newCompany}
        </a>
      </div>
      <Input type="search" placeholder={s.search} value={q} onChange={(e) => setQ(e.target.value)} className="max-w-sm" />
      {rows === null ? (
        <p className="text-[var(--color-ink-muted)]">{s.loading}</p>
      ) : rows.length === 0 ? (
        <p className="text-[var(--color-ink-muted)]">{s.noCompanies}</p>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius)] border border-[var(--color-mist)] bg-white">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-paper)] text-start text-[var(--color-ink-muted)]">
              <tr>
                <th className="px-4 py-2 text-start font-medium">{s.name}</th>
                <th className="px-4 py-2 text-start font-medium">{s.status}</th>
                <th className="px-4 py-2 text-start font-medium">{s.size}</th>
                <th className="px-4 py-2 text-start font-medium">{s.sites}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-[var(--color-mist)] hover:bg-[var(--color-paper)]">
                  <td className="px-4 py-2">
                    <a className="font-medium text-[var(--color-pine)] hover:underline" href={`/${locale}/companies/${r.id}`}>
                      {locale === "ar" ? r.nameAr : r.nameEn}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <Badge tone={r.status === "active" ? "good" : r.status === "on_hold" ? "attention" : "neutral"}>
                      {s.statuses[r.status] ?? r.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2" dir="ltr">
                    {r.sizeBand ?? "–"}
                  </td>
                  <td className="px-4 py-2">{r.siteCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
