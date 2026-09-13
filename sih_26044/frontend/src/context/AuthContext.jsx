import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((res) => {
          setUser(res.data);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const { access_token, user_id, full_name, role } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser({ id: user_id, email, full_name, role });
    return res.data;
  };

  const register = async (fullName, email, password, role, extraFields = {}) => {
    const payload = { full_name: fullName, email, password, role, ...extraFields };
    const res = await authApi.register(payload);
    const { access_token, user_id, role: assignedRole } = res.data;
    localStorage.setItem('token', access_token);
    setToken(access_token);
    setUser({ id: user_id, email, full_name: fullName, role: assignedRole });
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
