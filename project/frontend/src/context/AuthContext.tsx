import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
import type { UserProfile } from "../services/api";

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (fullName: string, email: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check current user from token
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setToken(storedToken);
        } catch (error) {
          console.error("Token verification failed:", error);
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem("token", data.access_token);
      setToken(data.access_token);
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, role: string) => {
    // We register the user
    await api.register(fullName, email, password, role);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.logout();
    } catch (error) {
      console.warn("Server logout failed, clearing token locally anyway:", error);
    } finally {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const updateProfile = async (fullName: string, email: string) => {
    const updatedUser = await api.updateProfile(fullName, email);
    setUser(updatedUser);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    await api.changePassword(oldPassword, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
