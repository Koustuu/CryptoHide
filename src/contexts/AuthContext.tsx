import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  setIntendedRoute: (route: string) => void;
  getIntendedRoute: () => string | null;
  clearIntendedRoute: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('cryptohide_user');
        const storedToken = localStorage.getItem('cryptohide_token');
        
        if (storedUser && storedToken) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        // Clear corrupted data
        localStorage.removeItem('cryptohide_user');
        localStorage.removeItem('cryptohide_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const userData: User = {
          id: data.user.id,
          email: data.user.username,
          name: data.user.username.split('@')[0]
        };

        // Store in localStorage
        localStorage.setItem('cryptohide_user', JSON.stringify(userData));
        localStorage.setItem('cryptohide_token', data.token);

        setUser(userData);
        setIsLoading(false);

        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: data.message || 'Login failed. Please check your credentials.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return { success: false, error: 'Failed to connect to the server. Please ensure the server is running.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('cryptohide_user');
    localStorage.removeItem('cryptohide_token');
    clearIntendedRoute();
  };

  // Session storage for intended route (survives page refresh but not browser close)
  const setIntendedRoute = (route: string) => {
    sessionStorage.setItem('cryptohide_intended_route', route);
  };

  const getIntendedRoute = (): string | null => {
    return sessionStorage.getItem('cryptohide_intended_route');
  };

  const clearIntendedRoute = () => {
    sessionStorage.removeItem('cryptohide_intended_route');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    setIntendedRoute,
    getIntendedRoute,
    clearIntendedRoute
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
