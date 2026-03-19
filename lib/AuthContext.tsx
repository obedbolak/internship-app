import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type UserRole = "STUDENT" | "COMPANY";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profileId: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.multiGet(["token", "user"])
      .then(([[, t], [, u]]) => {
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (newToken: string, newUser: AuthUser) => {
    await AsyncStorage.multiSet([
      ["token", newToken],
      ["user", JSON.stringify(newUser)],
    ]);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "user"]);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
