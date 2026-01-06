import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  updateUser: (user: User) => void;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/users.php?id=${user.id}`);
      if (response.ok) {
        const userData = await response.json();
        // Merge with existing user data (to keep role/email if API doesn't return everything)
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem('lms_user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  useEffect(() => {
    // Check for stored session
    const storedUser = localStorage.getItem('lms_user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Fetch fresh data from backend
      fetch(`${API_URL}/users.php?id=${parsedUser.id}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error('Failed to fetch');
        })
        .then(userData => {
          const updatedUser = { ...parsedUser, ...userData };
          setUser(updatedUser);
          localStorage.setItem('lms_user', JSON.stringify(updatedUser));
        })
        .catch(err => console.error('Background user refresh failed:', err))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('lms_user', JSON.stringify(data.user));
          setIsLoading(false);
          return true;
        }
      }
    } catch (error) {
      console.error('Login failed:', error);
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lms_user');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('lms_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'admin',
        updateUser,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
