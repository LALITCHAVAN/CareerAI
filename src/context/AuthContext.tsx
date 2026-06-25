import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types.js";

// Global fetch override to automatically attach the Authorization header if present in localStorage.
// This is essential on mobile devices and inside iframes (such as the AI Studio live preview)
// where third-party cookies are blocked by default.
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    const token = localStorage.getItem("session_token");
    if (token) {
      init = init || {};
      const headers = new Headers(init.headers || {});
      if (!headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      init.headers = headers;
    }
    return originalFetch(input, init);
  };
}

// Helper to safely parse JSON response. If the response is not JSON (e.g. HTML 404/500/crashed page),
// it will throw a readable error instead of crashing with "Unexpected token < or T in JSON".
async function safeJsonParse(res: Response) {
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    console.error("Non-JSON response from server:", text);
    throw new Error(`The server returned an unexpected response format (not JSON). Status: ${res.status}`);
  }
  return res.json();
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  checkUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check user session on mount
  useEffect(() => {
    checkUserSession();
  }, []);

  const checkUserSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await safeJsonParse(res);
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Session check error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await safeJsonParse(res);
      if (res.ok) {
        if (data.token) {
          localStorage.setItem("session_token", data.token);
        }
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Invalid credentials." };
      }
    } catch (error: any) {
      return { success: false, message: error.message || "Login failed." };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await safeJsonParse(res);
      if (res.ok) {
        if (data.token) {
          localStorage.setItem("session_token", data.token);
        }
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message || "Registration failed." };
      }
    } catch (error: any) {
      return { success: false, message: error.message || "Registration failed." };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      console.error("Logout request error:", e);
    } finally {
      localStorage.removeItem("session_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUserSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
