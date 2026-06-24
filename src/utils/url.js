export function normalizeExternalUrl(url) {
  const value = (url || "").trim();
  if (!value || value === "#") return "";
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  return `https://${value}`;
}

function toProjectsPath(filename) {
  return `/projects/${filename.replace(/^\/+/, "").replace(/^projects\//i, "")}`;
}

export function normalizeImageUrl(url) {
  const value = (url || "").trim();
  if (!value) return "";

  const normalized = value.replace(/\\/g, "/");

  const fromPublicFolder = normalized.match(/(?:^|\/)public\/projects\/(.+)$/i);
  if (fromPublicFolder) {
    return toProjectsPath(fromPublicFolder[1]);
  }

  const projectsSegment = normalized.match(/\/projects\/(.+)$/i);
  if (projectsSegment && !normalized.startsWith("/projects/")) {
    return toProjectsPath(projectsSegment[1]);
  }

  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized;
  }

  if (normalized.startsWith("/projects/")) {
    return normalized;
  }

  if (normalized.startsWith("/")) {
    const fileName = normalized.split("/").pop();
    return fileName ? toProjectsPath(fileName) : "";
  }

  return toProjectsPath(normalized);
}

export function resolveImageUrl(url) {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return "";
  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized;
  }

  const base = import.meta.env.BASE_URL || "/";
  if (normalized.startsWith(base)) {
    return normalized;
  }

  const path = normalized.startsWith("/") ? normalized.slice(1) : normalized;
  return `${base}${path}`;
}
