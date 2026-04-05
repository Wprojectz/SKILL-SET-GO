const REDIRECT_STORAGE_KEY = "skill-set-go:post-auth-redirect";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const isRelativePath = (value: string) => value.startsWith("/") && !value.startsWith("//");

export const getAppOrigin = () => {
  const configured =
    import.meta.env.VITE_APP_URL ||
    import.meta.env.VITE_SITE_URL ||
    "";

  if (typeof configured === "string" && configured.trim()) {
    try {
      return new URL(trimTrailingSlash(configured.trim())).origin;
    } catch {
      // Fall through to the browser origin if the configured value is malformed.
    }
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }

  return "";
};

export const getAuthRedirectUrl = (path = "/auth") => {
  const origin = getAppOrigin();
  if (!origin) return path;
  return `${origin}${path}`;
};

export const sanitizeReturnPath = (value?: string | null) => {
  if (!value) return "/dashboard";
  if (!isRelativePath(value)) return "/dashboard";
  return value;
};

export const savePostAuthRedirect = (path?: string | null) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(REDIRECT_STORAGE_KEY, sanitizeReturnPath(path));
};

export const consumePostAuthRedirect = () => {
  if (typeof window === "undefined") return "/dashboard";
  const stored = window.sessionStorage.getItem(REDIRECT_STORAGE_KEY);
  window.sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
  return sanitizeReturnPath(stored);
};
