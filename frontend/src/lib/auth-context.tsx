import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "./types";
import {
  api,
  getAuthToken,
  getStoredUser,
  setAuthSession,
  clearAuthSession,
} from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  switchRole: (
    role: "admin" | "hr_manager" | "manager" | "employee",
  ) => Promise<void>;
  refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS = [
  {
    role: "admin" as const,
    email: "admin@ethereal.hr",
    name: "Alex Thorne (Super Admin)",
  },
  {
    role: "hr_manager" as const,
    email: "hr@ethereal.hr",
    name: "Elena Rostova (HR Lead)",
  },
  {
    role: "manager" as const,
    email: "devlead@ethereal.hr",
    name: "Marcus Vance (Tech Lead)",
  },
  {
    role: "employee" as const,
    email: "employee@ethereal.hr",
    name: "Sarah Jenkins (Fullstack)",
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedTok = getAuthToken();
    const storedUsr = getStoredUser();

    if (storedTok && storedUsr) {
      setToken(storedTok);
      setUser(storedUsr);
      // Validate session with backend
      api
        .getMe()
        .then((fresh) => {
          setUser(fresh);
          setAuthSession(storedTok, fresh);
        })
        .catch(() => {
          // If expired, clear
          clearAuthSession();
          setUser(null);
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setToken(res.token);
    setUser(res.user);
    setAuthSession(res.token, res.user);
  };

  const logout = () => {
    clearAuthSession();
    setUser(null);
    setToken(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  };

  const refreshUser = async () => {
    try {
      const fresh = await api.getMe();
      setUser(fresh);
      const storedTok = getAuthToken();
      if (storedTok) {
        setAuthSession(storedTok, fresh);
      }
      return fresh;
    } catch {
      return null;
    }
  };

  const switchRole = async (
    targetRole: "admin" | "hr_manager" | "manager" | "employee",
  ) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === targetRole);
    if (!account) return;
    await login(account.email, "password123");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isLoading, login, logout, switchRole, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
