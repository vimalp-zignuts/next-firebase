"use client";

import { useToast } from "@/contexts/ToastContext";
import { apiHandler } from "@/lib/apiHandler";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  refreshAuth: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();

  const checkAuthStatus = async () => {
    try {
      const { data } = await apiHandler.auth.getAuthStatus();
      setIsAuthenticated(data.isAuthenticated);
      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Auth status check error:', error);
      setIsAuthenticated(false);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiHandler.auth.logout();
    } catch (error) {
      console.error("Logout error:", error);
      showError('Logout failed');
    } finally {
      setIsAuthenticated(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        loading,
        refreshAuth: checkAuthStatus,
        logout,
      }}
    >
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
