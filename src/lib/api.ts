import axios, { AxiosError, AxiosInstance } from "axios";

export type Role = "admin" | "user";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8088/api";

const TOKEN_KEY: Record<Role, string> = {
  admin: "ep_admin_token",
  user: "ep_user_token",
};

const PROFILE_KEY: Record<Role, string> = {
  admin: "ep_admin_profile",
  user: "ep_user_profile",
};

export function getToken(role: Role): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY[role]);
}

export function setToken(role: Role, token: string) {
  window.localStorage.setItem(TOKEN_KEY[role], token);
}

export function clearSession(role: Role) {
  window.localStorage.removeItem(TOKEN_KEY[role]);
  window.localStorage.removeItem(PROFILE_KEY[role]);
}

export function getStoredProfile<T>(role: Role): T | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(PROFILE_KEY[role]);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function setStoredProfile<T>(role: Role, profile: T) {
  window.localStorage.setItem(PROFILE_KEY[role], JSON.stringify(profile));
}

/** Where to send a user when their session for `role` is no longer valid. */
function loginPathFor(role: Role) {
  return role === "admin" ? "/admin/login" : "/login";
}

const instances: Record<Role, AxiosInstance> = {
  admin: axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } }),
  user: axios.create({ baseURL: API_BASE_URL, headers: { "Content-Type": "application/json" } }),
};

(Object.keys(instances) as Role[]).forEach((role) => {
  const instance = instances[role];

  instance.interceptors.request.use((config) => {
    const token = getToken(role);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Let the browser set the multipart boundary for FormData payloads.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (typeof window !== "undefined" && error.response?.status === 401) {
        clearSession(role);
        if (!window.location.pathname.startsWith(loginPathFor(role))) {
          window.location.href = loginPathFor(role);
        }
      }
      return Promise.reject(error);
    }
  );
});

export function apiFor(role: Role) {
  return instances[role];
}

/** Extract a human-readable message from a failed API call. */
export function extractErrorMessage(err: unknown, fallback = "Terjadi kesalahan. Coba lagi."): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as
      | { message?: string; error?: Record<string, string[]> | Record<string, string> }
      | undefined;
    if (data?.error) {
      const values = Object.values(data.error).flat();
      if (values.length) return String(values[0]);
    }
    if (data?.message) return data.message;
  }
  return fallback;
}

export function fieldErrors(err: unknown): Record<string, string> {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: Record<string, string[]> } | undefined;
    if (data?.error) {
      const out: Record<string, string> = {};
      for (const [key, val] of Object.entries(data.error)) {
        out[key] = Array.isArray(val) ? val[0] : String(val);
      }
      return out;
    }
  }
  return {};
}
