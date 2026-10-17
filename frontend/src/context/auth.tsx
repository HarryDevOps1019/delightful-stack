import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthUser, loginApi, registerApi, fetchCurrentUserApi, logoutApi } from "@/services/api";
import { toast } from "sonner";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  register: (data: { name: string; email: string; password: string }) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = "ae_auth_token_v1";
const USER_KEY = "ae_auth_user_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  });

  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === "undefined") return null;
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Sync / refresh session from backend on mount if token is present
  useEffect(() => {
    let isMounted = true;

    async function verifySession() {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const freshUser = await fetchCurrentUserApi(token);
        if (isMounted) {
          if (freshUser) {
            setUser(freshUser);
            localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
          } else {
            // Token expired or invalid
            setUser(null);
            setToken(null);
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        }
      } catch (err) {
        console.warn("Session verification warning:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    verifySession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const login = async (credentials: { email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await loginApi(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          setToken(res.token);
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        toast.success(`Welcome back, ${res.user.name}!`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { name: string; email: string; password: string }): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await registerApi(data);
      if (res.success && res.user) {
        setUser(res.user);
        if (res.token) {
          setToken(res.token);
          localStorage.setItem(TOKEN_KEY, res.token);
        }
        localStorage.setItem(USER_KEY, JSON.stringify(res.user));
        toast.success(`Account created successfully! Welcome, ${res.user.name}`);
        return true;
      }
      return false;
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutApi(token);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      toast.success("Signed out successfully");
    }
  };

  const isAdmin = user?.role === "admin" || user?.email?.toLowerCase() === "admin@gmail.com";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
