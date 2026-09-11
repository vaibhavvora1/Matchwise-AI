import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";
import {
  register,
  login,
  logout,
  logoutAllDevices,
  getUserProfile,
  setAuthHeader,
  setCsrfHeader,
} from "../services/auth.api.jsx";

export const useAuth = () => {
  const context = useContext(AuthContext);
  const {
    user,
    setUser,
    loading,
    setLoading,
    setAccessToken,
    setCsrfToken,
    isAuthReady,
  } = context;

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });
      if (data?.user) setUser(data.user);
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        setAuthHeader(data.accessToken);
      }
      if (data?.csrfToken) {
        setCsrfToken(data.csrfToken);
        setCsrfHeader(data.csrfToken);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });
      if (data?.user) setUser(data.user);
      if (data?.accessToken) {
        setAccessToken(data.accessToken);
        setAuthHeader(data.accessToken);
      }
      if (data?.csrfToken) {
        setCsrfToken(data.csrfToken);
        setCsrfHeader(data.csrfToken);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setAccessToken(null);
      setCsrfToken(null);
      setAuthHeader(null);
      setCsrfHeader(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setLoading(true);
    try {
      await logoutAllDevices();
      setUser(null);
      setAccessToken(null);
      setCsrfToken(null);
      setAuthHeader(null);
      setCsrfHeader(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGetUserProfile = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      if (data?.user) setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    isAuthReady,
    accessToken: context.accessToken,
    handleRegister,
    handleLogin,
    handleLogout,
    handleLogoutAllDevices,
    handleGetUserProfile,
  };
};
