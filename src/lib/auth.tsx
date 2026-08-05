"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  apiFor,
  clearSession,
  getStoredProfile,
  getToken,
  setStoredProfile,
  setToken,
} from "./api";
import type { Admin, AppUser } from "./types";

interface AuthState<T> {
  profile: T | null;
  ready: boolean;
  isAuthenticated: boolean;
  setProfile: (p: T) => void;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AuthState<Admin> | null>(null);
const UserAuthContext = createContext<AuthState<AppUser> | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Admin | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setProfileState(getStoredProfile<Admin>("admin"));
    setReady(true);
  }, []);

  const setProfile = (p: Admin) => {
    setStoredProfile("admin", p);
    setProfileState(p);
  };

  const logout = async () => {
    try {
      await apiFor("admin").post("/auth/admin/logout");
    } catch {
      // ignore network errors on logout — clear local session regardless
    }
    clearSession("admin");
    setProfileState(null);
    router.push("/admin/login");
  };

  return (
    <AdminAuthContext.Provider
      value={{ profile, ready, isAuthenticated: !!getToken("admin"), setProfile, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setProfileState(getStoredProfile<AppUser>("user"));
    setReady(true);
  }, []);

  const setProfile = (p: AppUser) => {
    setStoredProfile("user", p);
    setProfileState(p);
  };

  const logout = async () => {
    try {
      await apiFor("user").post("/auth/user/logout");
    } catch {
      // ignore network errors on logout — clear local session regardless
    }
    clearSession("user");
    setProfileState(null);
    router.push("/login");
  };

  return (
    <UserAuthContext.Provider
      value={{ profile, ready, isAuthenticated: !!getToken("user"), setProfile, logout }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
}

export { setToken };
