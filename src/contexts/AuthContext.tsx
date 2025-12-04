import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
  refreshUser?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin Master',
    email: 'admin@lms.com',
    password: 'admin123',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    name: 'João Silva',
    email: 'joao@empresa.com',
    password: 'user123',
    role: 'collaborator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=joao',
    createdAt: new Date('2024-02-15'),
    progress: 65,
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    password: 'user123',
    role: 'collaborator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria',
    createdAt: new Date('2024-03-10'),
    progress: 42,
  },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (!user) return;
    try {
      // Import api here to avoid circular dependency if possible, or just use fetch
      // But since api.ts uses simple fetch, we can use it if imported.
      // Let's use fetch directly to be safe or assume api is available.
      // Actually, we can just use the api service if we import it.
      // Let's use fetch to keep it simple and avoid import issues in this file if any.
      const response = await fetch(`http://localhost:8000/api/users.php?id=${user.id}`);
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
      fetch(`http://localhost:8000/api/users.php?id=${parsedUser.id}`)
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
      const response = await fetch('http://localhost:8000/api/login.php', {
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

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        isAdmin: user?.role === 'admin',
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
