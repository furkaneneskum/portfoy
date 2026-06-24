export function normalizeExternalUrl(url) {
  const value = (url || "").trim();
  if (!value || value === "#") return "";
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  return `https://${value}`;
}

export function normalizeImageUrl(url) {
  const value = (url || "").trim();
  if (!value) return "";

  const normalized = value.replace(/\\/g, "/");

  // Windows / tam yol: .../public/projects/dosya.jpg -> /projects/dosya.jpg
  const fromPublicFolder = normalized.match(/(?:^|\/)public\/projects\/(.+)$/i);
  if (fromPublicFolder) {
    return `/projects/${fromPublicFolder[1]}`;
  }

  // Yanlis yol: /portfoy/public/projects/dosya.jpg -> /projects/dosya.jpg
  const projectsSegment = normalized.match(/\/projects\/(.+)$/i);
  if (projectsSegment && !normalized.startsWith("/projects/")) {
    return `/projects/${projectsSegment[1]}`;
  }

  if (
    normalized.startsWith("/") ||
    /^https?:\/\//i.test(normalized) ||
    normalized.startsWith("data:")
  ) {
    return normalized;
  }

  return `/projects/${normalized.replace(/^\/+/, "")}`;
}
