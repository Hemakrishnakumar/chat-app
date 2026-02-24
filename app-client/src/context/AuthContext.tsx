import axios from "axios";
import React, { createContext, useContext, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { BASE_URL } from "../config/constants";

interface User {
  userId: string;
  name?: string;
  profilePhotoUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  logout: () => void;
  setUser: Dispatch<SetStateAction<User | null>>;
  setToken: Dispatch<SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("accessToken")
  );
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!token) return;

    axios
      .get(BASE_URL + "/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("accessToken");
          setToken(null);
          setUser(null);
        }
      });
  }, [token]);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser(null);
  };

  

  return (
    <AuthContext.Provider value={{ user, token, logout, setUser, setToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used inside AuthProvider");
  }
  return ctx;
};