import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('barberpro_token'));
  const [currentUser, setCurrentUser] = useState(null);
  const [customerToken, setCustomerToken] = useState(localStorage.getItem('barberpro_customer_token'));
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync API service tokens
  useEffect(() => {
    api.setToken(token);
  }, [token]);

  useEffect(() => {
    api.setCustomerToken(customerToken);
  }, [customerToken]);

  const logout = useCallback(() => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('barberpro_token');
    api.setToken(null);
  }, []);

  const customerLogout = useCallback(() => {
    setCustomerToken(null);
    setCurrentCustomer(null);
    localStorage.removeItem('barberpro_customer_token');
    api.setCustomerToken(null);
  }, []);

  // Set up global 401 handler
  useEffect(() => {
    api.onUnauthorized = (isCustomerRoute) => {
      if (isCustomerRoute && customerToken) customerLogout();
      else if (token) logout();
    };
  }, [token, customerToken, logout, customerLogout]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const res = await api.get('/auth/me', { skipLogout: true });
          if (res.ok) {
            setCurrentUser(await res.json());
          } else {
            logout();
          }
        }

        if (customerToken) {
          const res = await api.get('/customer-auth/me', { skipLogout: true });
          if (res.ok) {
            setCurrentCustomer(await res.json());
          } else {
            customerLogout();
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [token, customerToken, logout, customerLogout]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Falha no login');
    }
    const { token: newToken, user } = await res.json();
    setToken(newToken);
    setCurrentUser(user);
    return user;
  };

  const customerLogin = async (email, password) => {
    const res = await api.post('/customer-auth/login', { email, password });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Falha no login');
    }
    const { token: newToken, user } = await res.json();
    setCustomerToken(newToken);
    setCurrentCustomer(user);
    return user;
  };

  const customerRegister = async (data) => {
    const res = await api.post('/customer-auth/register', data);
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Erro ao cadastrar');
    }
    const { token: newToken, user } = await res.json();
    setCustomerToken(newToken);
    setCurrentCustomer(user);
    return user;
  };

  const updateCustomerProfile = async (data) => {
    const res = await api.patch('/customer-auth/profile', data);
    if (res.ok) {
      const updated = await res.json();
      setCurrentCustomer(updated);
      return updated;
    }
    const err = await res.json();
    throw new Error(err.message || 'Falha ao atualizar perfil');
  };

  const getCustomerAppointments = async () => {
    const res = await api.get('/customer-auth/appointments');
    if (res.ok) return res.json();
    throw new Error('Falha ao buscar histórico');
  };

  return (
    <AuthContext.Provider value={{
      token, currentUser, customerToken, currentCustomer, loading,
      login, logout, customerLogin, customerLogout, customerRegister,
      updateCustomerProfile, getCustomerAppointments,
      isCustomerAuthenticated: !!currentCustomer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
