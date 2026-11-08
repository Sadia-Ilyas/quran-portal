export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function getApiError(e: unknown, fallback = "Something went wrong."): string {
  const data = (e as { data?: unknown })?.data;
  if (!data) return fallback;
  if (typeof data === "string") return data;
  const obj = data as Record<string, unknown>;
  if (typeof obj.detail === "string") return obj.detail;
  return (
    Object.entries(obj)
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(" ") : String(v)}`)
      .join(" | ") || fallback
  );
}