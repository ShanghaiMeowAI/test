import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CurrentUser } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: CurrentUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的token
    const token = localStorage.getItem('token');
    if (token) {
      // 设置axios默认headers
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      // 获取当前用户信息
      fetchCurrentUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get('/users/me/');
      setUser(response.data);
    } catch (error) {
      // Token可能已过期，清除本地存储
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post('/login/', { username, password });
      const { token, user: userData } = response.data;
      
      // 保存token到本地存储
      localStorage.setItem('token', token);
      
      // 设置axios默认headers
      api.defaults.headers.common['Authorization'] = `Token ${token}`;
      
      // 设置用户信息
      setUser({
        ...userData,
        permissions: userData.profile || {}
      });
    } catch (error: any) {
      throw new Error(error.response?.data?.error || '登录失败');
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout/');
    } catch (error) {
      // 即使登出请求失败，也要清除本地状态
    } finally {
      // 清除本地存储和状态
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
