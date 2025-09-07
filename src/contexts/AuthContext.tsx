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
      // Simulate API call - replace with actual authentication logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo purposes, accept any email/password combination
      // In production, this would validate against a real backend
      if (email && password) {
        const userData: User = {
          id: `user_${Date.now()}`,
          email: email,
          name: email.split('@')[0]
        };
        
        const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Store in localStorage
        localStorage.setItem('cryptohide_user', JSON.stringify(userData));
        localStorage.setItem('cryptohide_token', token);
        
        setUser(userData);
        setIsLoading(false);
        
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }
    } catch {
      setIsLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
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
