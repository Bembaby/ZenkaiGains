"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/contexts/ToastProvider";
import { API_URL } from "@/lib/config";

interface AuthContextType {
  isAuthenticated: boolean | null;
  isLogout: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { showError, showSuccess } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLogout, setIsLogout] = useState(false);
  const router = useRouter();

  const login = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include" // important
      });
      if (response.ok) {
        setIsAuthenticated(true);
        setIsLogout(false);
      } else {
        throw new Error("Failed to verify login state");
      }
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include" // important
      });
      if (!response.ok) {
        throw new Error("Failed to logout");
      } else {
        // Immediately update local auth state
        setIsAuthenticated(false);
        setIsLogout(true);
        showSuccess("Successfully logged out");
        // Optionally force navigate to home/landing
        router.replace("/");
      }
    } catch (error) {
      if (error instanceof Error) {
        showError(error.message);
      } else {
        showError("An unknown error occurred");
      }
    }
  };

  const checkAuth = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        credentials: "include"
      });
      if (response.ok) {
        setIsAuthenticated(true);
        setIsLogout(false);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      showError("Failed to check authentication");
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLogout, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
