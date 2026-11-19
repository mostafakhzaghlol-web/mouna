import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{label}</span>
      {children}
      {hint && !error ? <span className="mt-1 block text-xs text-[var(--color-ink-muted)]">{hint}</span> : null}
      {error ? <span className="mt-1 block text-xs text-[var(--color-danger)]">{error}</span> : null}
    </label>
  );
}

const control =
  "w-full rounded-[var(--radius)] border border-[var(--color-mist)] bg-white px-3 py-2 text-base outline-none focus:border-[var(--color-pine)] focus:ring-2 focus:ring-[var(--color-pine)]/20";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${control} ${props.className ?? ""}`} />;
}

export function Card({ title, actions, children }: { title?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-[var(--radius)] border border-[var(--color-mist)] bg-white p-4 sm:p-5">
      {title || actions ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title ? <h2 className="text-lg font-bold">{title}</h2> : <span />}
          {actions}
        </div>
      ) : null}
      {children}
    </section>
  );
}

const badgeTones = {
  neutral: "bg-[var(--color-paper)] text-[var(--color-ink)] border-[var(--color-mist)]",
  good: "bg-[var(--color-pine)]/10 text-[var(--color-pine)] border-[var(--color-pine)]/30",
  attention: "bg-[var(--color-saffron)]/25 text-[var(--color-ink)] border-[var(--color-saffron)]/50",
} as const;

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof badgeTones; children: ReactNode }) {
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${badgeTones[tone]}`}>{children}</span>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-[var(--radius)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-3 text-sm text-[var(--color-danger)]">
      {children}
    </p>
  );
}
