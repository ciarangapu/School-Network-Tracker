import React, { createContext, useContext, useState, useEffect } from 'react';

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
      // Simulate API call
      if (userType === 'admin') {
        // Mock admin login
        if (credentials.email === 'admin@example.com' && credentials.password === 'admin123') {
          const adminUser: User = {
            id: '1',
            name: 'Admin User',
            email: credentials.email,
            role: 'admin'
          };
          setUser(adminUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(adminUser));
          return true;
        }
      } else {
        // Mock student login with MAC address
        if (isValidMacAddress(credentials.macAddress)) {
          const studentUser: User = {
            id: '2',
            name: 'Student User',
            macAddress: credentials.macAddress,
            course: 'Full Stack Development',
            role: 'student'
          };
          setUser(studentUser);
          setIsAuthenticated(true);
          localStorage.setItem('user', JSON.stringify(studentUser));
          return true;
        }
      }
      return false;
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
      // Simulate API call for student registration
      if (userData.name && isValidMacAddress(userData.macAddress) && userData.course) {
        return true;
      }
      return false;
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