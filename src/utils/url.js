export function normalizeExternalUrl(url) {
  const value = (url || "").trim();
  if (!value || value === "#") return "";
  if (/^(https?:\/\/|mailto:)/i.test(value)) return value;
  return `https://${value}`;
}

function toProjectsPath(filename) {
  return `/projects/${filename.replace(/^\/+/, "").replace(/^projects\//i, "")}`;
}

export const DEFAULT_PROFILE_IMAGE = "/projects/profil.jpeg";
export const DEFAULT_ABOUT_IMAGE = "/projects/hakkimda.jpeg";

export function normalizeImageUrl(url) {
  const value = (url || "").trim();
  if (!value) return "";

  const normalized = value.replace(/\\/g, "/");

  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized;
  }

  const fromPublicFolder = normalized.match(/(?:^|\/)public\/projects\/(.+)$/i);
  if (fromPublicFolder) {
    return toProjectsPath(fromPublicFolder[1]);
  }

  const projectsSegment = normalized.match(/\/projects\/(.+)$/i);
  if (projectsSegment && !normalized.startsWith("/projects/")) {
    return toProjectsPath(projectsSegment[1]);
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

function getAppBasePath() {
  const viteBase = import.meta.env.BASE_URL;
  if (viteBase && viteBase !== "/") {
    return viteBase.endsWith("/") ? viteBase : `${viteBase}/`;
  }

  if (typeof window !== "undefined") {
    const match = window.location.pathname.match(/^(\/[^/]+)\//);
    if (match?.[1] && match[1] !== "/assets") {
      return `${match[1]}/`;
    }
  }

  return "/";
}

function joinUrl(origin, basePath, relativePath) {
  const base = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  const path = relativePath.startsWith("/") ? relativePath : `/${relativePath}`;
  return `${origin}${base}${path}`;
}

export function resolveImageUrl(url) {
  const normalized = normalizeImageUrl(url);
  if (!normalized) return "";

  if (/^https?:\/\//i.test(normalized) || normalized.startsWith("data:")) {
    return normalized;
  }

  const basePath = getAppBasePath();
  const relativePath = normalized.startsWith("/") ? normalized : `/${normalized}`;

  if (typeof window !== "undefined" && window.location?.origin) {
    return joinUrl(window.location.origin, basePath, relativePath);
  }

  const siteUrl = (import.meta.env.VITE_SITE_URL || "").replace(/\/$/, "");
  if (siteUrl) {
    return `${siteUrl}${relativePath}`;
  }

  const path = relativePath.startsWith("/") ? relativePath.slice(1) : relativePath;
  return `${basePath}${path}`;
}

export function resolveProfileImageUrl(url) {
  return resolveImageUrl(url || DEFAULT_PROFILE_IMAGE);
}

export function resolveAboutImageUrl(url) {
  return resolveImageUrl(url || DEFAULT_ABOUT_IMAGE);
}
