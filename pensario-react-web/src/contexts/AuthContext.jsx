import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há token salvo no localStorage
    const token = localStorage.getItem('authToken');
    if (token) {
      // Aqui você poderia validar o token com o backend
      // Por simplicidade, vamos apenas definir que o usuário está logado
      const userData = localStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await apiService.login(username, password);
      const userData = response.user;
      
      setUser(userData);
      localStorage.setItem('userData', JSON.stringify(userData));
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (username, password) => {
    try {
      const response = await apiService.register(username, password);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    localStorage.removeItem('userData');
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

