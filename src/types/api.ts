export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export function getFieldErrors(e: unknown): Record<string, string> {
  if (!e || typeof e !== "object") return {};
  const data = "data" in e ? (e as { data: unknown }).data : e;
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};

  const record: Record<string, string> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      record[key] = value.map((v) => (typeof v === "string" ? v : JSON.stringify(v))).join(" ");
    } else if (typeof value === "string") {
      record[key] = value;
    } else if (value !== null && typeof value === "object") {
      record[key] = JSON.stringify(value);
    } else if (value !== null && value !== undefined) {
      record[key] = String(value);
    }
  }
  return record;
}

export function getApiError(e: unknown, fallback = "Something went wrong."): string {
  if (!e) return fallback;

  if (typeof e === "object") {
    const errorObj = e as Record<string, unknown>;

    if (errorObj.status === "FETCH_ERROR") {
      return "Cannot reach the server.";
    }

    if (errorObj.status === "PARSING_ERROR") {
      return (typeof errorObj.error === "string" && errorObj.error) || "Failed to parse server response.";
    }

    const data = errorObj.data;
    if (typeof data === "string" && data.trim()) {
      return data;
    }

    if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      if (typeof obj.detail === "string" && obj.detail.trim()) {
        return obj.detail;
      }
      if (typeof obj.message === "string" && obj.message.trim()) {
        return obj.message;
      }
      if (Array.isArray(obj.non_field_errors)) {
        return obj.non_field_errors.join(" ");
      }
      const entries = Object.entries(obj).map(([k, v]) => {
        const val = Array.isArray(v) ? v.join(" ") : typeof v === "object" ? JSON.stringify(v) : String(v);
        return `${k}: ${val}`;
      });
      if (entries.length > 0) {
        return entries.join(" | ");
      }
    }

    if (typeof errorObj.message === "string" && errorObj.message.trim()) {
      return errorObj.message;
    }

    if (typeof errorObj.status === "number") {
      if (errorObj.status === 403) return "Only admins can add students.";
      if (errorObj.status === 401) return "Session expired. Please sign in again.";
      if (errorObj.status >= 500) return "Something went wrong. Please try again.";
    }
  }

  return fallback;
}
