import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, API_URL } from "../services/api";

export interface User {
  id: string;
  username?: string;
  full_name: string;
  fullName?: string;
  email: string;
  //role: "farmer" | "buyer" | "admin";
  role: "FARMER" | "BUYER" | "ADMIN";
  status?: "active" | "pending" | "rejected";
  avatar?: string;
  phone?: string;
  address?: string;
  store_name?: string;
  farm_location?: string;
  bio?: string;
  contact?: string;
  delivery_address?: string;
  city?: string;
  created_at?: string;
  rating?: number;
  province?: string   //Added province field to User interface for better location handling
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (payload: { email: string; fullName: string; password: string; role?: string }) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

//const normalizeRole = (role: string): User["role"] => role.toLowerCase() as User["role"];
// Updated normalizeRole function to handle both uppercase and lowercase role values, ensuring consistent role formatting across the application.
const normalizeRole = (role: string): User["role"] => {
  return role.toUpperCase() as User["role"];
};

const normalizeUser = (user: any): User => ({
  ...user,
  //full_name: user.fullName || user.full_name,
  fullName: user.fullName || user.full_name,
  role: normalizeRole(user.role),
  store_name: user.farmerProfile?.farmName,
  farm_location: user.farmerProfile?.farmLocation,
  bio: user.farmerProfile?.farmDescription,
  contact: user.phone,
  delivery_address: user.address,
  created_at: user.createdAt,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreAuth = async () => {
      const token = localStorage.getItem("fd_token");
      const refreshToken = localStorage.getItem("fd_refresh_token");

      // If there's no token, nothing to restore
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      // If token exists but no refresh token, it's likely expired — clear and skip calling the API
      if (!refreshToken) {
        localStorage.removeItem("fd_token");
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const me = await authApi.me();
        setUser(normalizeUser(me));
      } catch (error) {
        console.error("Auth restore failed:", error, "API URL:", API_URL);

        localStorage.removeItem("fd_token");
        localStorage.removeItem("fd_refresh_token");
        localStorage.removeItem("fd_user");

        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreAuth();
  }, []);

  useEffect(() => {
    if (user) localStorage.setItem("fd_user", JSON.stringify(user));
    else localStorage.removeItem("fd_user");
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await authApi.login(email, password);
    localStorage.setItem("fd_token", result.token);
    localStorage.setItem("fd_refresh_token", result.refreshToken);
    setUser(normalizeUser(result.user));
    return true;
  };

  const signup = async (payload: { email: string; fullName: string; password: string; role?: string }): Promise<boolean> => {
    const result = await authApi.signup(payload);
    localStorage.setItem("fd_token", result.token);
    localStorage.setItem("fd_refresh_token", result.refreshToken);
    setUser(normalizeUser(result.user));
    return true;
  };

  const logout = () => {
    authApi.logout(localStorage.getItem("fd_refresh_token") || undefined).catch(() => undefined);
    setUser(null);
    localStorage.removeItem("fd_token");
    localStorage.removeItem("fd_refresh_token");
    localStorage.removeItem("fd_user");
    localStorage.removeItem("fd_cart");
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) setUser({ ...user, ...userData });
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
