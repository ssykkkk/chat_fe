import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const refreshAccessToken = async () => {
    try {
      const response = await axios.post(
        "https://chat-be-4lov.onrender.com/user/refresh",
        {},
        { withCredentials: true }
      );
      const { accessToken } = response.data;
      localStorage.setItem("token", accessToken);
      return accessToken;
    } catch (err) {
      console.error("Refresh token failed:", err);
      logout();
      return null;
    }
  };

  const initAuth = async () => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      localStorage.setItem("tokenG", tokenFromURL);
      const cleanURL = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanURL);
    }

    const token1 = localStorage.getItem("token");
    const token2 = localStorage.getItem("tokenG");

    if (token2) {
      try {
        const decodedUser = jwtDecode(token2);
        setUser(decodedUser);
        setIsAuthenticated(true);
      } catch (err) {
        console.error("Error decoding Google token:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    } else if (token1) {
      try {
        const response = await axios.get("https://chat-be-4lov.onrender.com/user/profile", {
          headers: { Authorization: `Bearer ${token1}` },
          withCredentials: true,
        });
        setUser(response.data);
        setIsAuthenticated(true);
      } catch (err) {
        if (err.response?.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            try {
              const retry = await axios.get("https://chat-be-4lov.onrender.com/user/profile", {
                headers: { Authorization: `Bearer ${newToken}` },
                withCredentials: true,
              });
              setUser(retry.data);
              setIsAuthenticated(true);
            } catch (e) {
              console.error("Failed to refetch profile after refresh:", e);
              setIsAuthenticated(false);
            }
          }
        } else {
          console.error("Error fetching profile:", err);
          setIsAuthenticated(false);
        }
      } finally {
        setLoading(false);
      }
    } else {
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        "https://chat-be-4lov.onrender.com/user/login",
        { email, password },
        { withCredentials: true }
      );
      localStorage.setItem("token", response.data.accessToken);
      await initAuth();
    } catch (err) {
      setError(err.response?.data?.message || "Помилка авторизації");
    }
  };

  const register = async (firstName, lastName, email, password) => {
    try {
      const response = await axios.post(
        "https://chat-be-4lov.onrender.com/user/register",
        { firstName, lastName, email, password },
        { withCredentials: true }
      );
      localStorage.setItem("token", response.data.accessToken);
      await initAuth();
    } catch (err) {
      setError(err.response?.data?.message || "Помилка реєстрації");
    }
  };

  const authGoogle = () => {
    window.location.href = "https://chat-be-4lov.onrender.com/user/google";
  };

  const logout = async () => {
    try {
      await axios.post("https://chat-be-4lov.onrender.com/user/logout", {}, { withCredentials: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("tokenG");
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    loading,
    error,
    user,
    login,
    register,
    authGoogle,
    logout,
  };
};
