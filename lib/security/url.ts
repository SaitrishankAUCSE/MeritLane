/**
 * Strict URL sanitizer to prevent XSS via javascript: or data: URIs.
 * Only allows valid http: and https: protocols, or safe relative paths.
 */
export function sanitizeUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "#";
  const trimmed = url.trim();
  if (!trimmed) return "#";

  // Block dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith("javascript:") ||
    lower.startsWith("data:") ||
    lower.startsWith("vbscript:") ||
    lower.startsWith("file:")
  ) {
    return "#";
  }

  // Allow relative paths starting with / (e.g. internal routes) or safe anchor #
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) {
    return trimmed;
  }

  // Validate absolute URLs
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") {
      return trimmed;
    }
    return "#";
  } catch {
    // If URL parsing fails, check if it's a domain-like string (e.g. github.com/user)
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+(\/.*)?$/.test(trimmed)) {
      return `https://${trimmed}`;
    }
  }

  return "#";
}
