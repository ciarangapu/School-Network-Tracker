import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

interface User {
  id: string;
  name: string;
  email?: string;
  macAddress?: string;
  course?: string;
  role: 'admin' | 'student';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: any, userType: 'admin' | 'student') => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (credentials: any, userType: 'admin' | 'student'): Promise<boolean> => {
    try {
      // Try API first, fallback to mock authentication if server is not running
      try {
        const response = await ApiService.login(credentials, userType);
        if (response.success) {
          setUser(response.user);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(response.user));
          return true;
        }
        return false;
      } catch (apiError) {
        console.log('API not available, using mock authentication');
        
        // Mock authentication fallback
        if (userType === 'admin') {
          if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
            const mockUser = {
              id: 'admin',
              name: 'Admin User',
              email: credentials.email,
              role: 'admin' as const
            };
            setUser(mockUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return true;
          }
        } else {
          // Student login with MAC address
          if (credentials.macAddress && isValidMacAddress(credentials.macAddress)) {
            const mockUser = {
              id: 'student-' + Date.now(),
              name: 'Student User',
              macAddress: credentials.macAddress,
              course: 'Full Stack Development',
              role: 'student' as const
            };
            setUser(mockUser);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(mockUser));
            return true;
          }
        }
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      try {
        const response = await ApiService.register(userData);
        if (response.success) {
          return true;
        }
        return false;
      } catch (apiError) {
        console.log('API not available, using mock registration');
        // Mock registration - just validate the data
        if (userData.name && userData.macAddress && userData.course && isValidMacAddress(userData.macAddress)) {
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const isValidMacAddress = (mac: string): boolean => {
    const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
    return macRegex.test(mac);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};