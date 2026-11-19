/** Browser-side call to the platform API through the app's own /api proxy (same origin, cookie session). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: { error?: string; issues?: { path: string; message: string }[]; [k: string]: unknown },
  ) {
    super(body?.error ?? `HTTP ${status}`);
  }
}

export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: init.method ?? (init.body === undefined ? "GET" : "POST"),
    credentials: "same-origin",
    headers: init.body === undefined ? undefined : { "content-type": "application/json" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}

/** Turn a 400 response's field issues into { "path": "message" } for showing under each field. */
export function fieldErrors(err: unknown): Record<string, string> {
  if (!(err instanceof ApiError) || !err.body.issues) return {};
  return Object.fromEntries(err.body.issues.map((i) => [i.path, i.message]));
}
