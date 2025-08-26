import { createContext, useContext, useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("auth_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      // if (!token) {
      //   setLoading(false);
      //   return;
      // }
      // try {
      //   const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      //     headers: { Authorization: `Bearer ${token}` },
      //   });
      //   if (res.ok) {
      //     const data = await res.json();
      //     setUser(data.user);
      //   } else {
      //     setUser(null);
      //     setToken(null);
      //     localStorage.removeItem("auth_token");
      //     localStorage.removeItem("user");
      //   }
      // } catch {
      //   setUser(null);
      //   setToken(null);
      // }
       setLoading(false);
    };
    verify();
  }, [token]);

  const login = (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("auth_token", tokenData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);