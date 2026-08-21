import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { UserRole, LoginDto, RegisterDto, AuthResponseDto } from '../types';
import { api } from '../api/axiosClient';

export interface DecodedToken {
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'?: string;
  role?: string | number;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'?: string;
  sub?: string;
  nameid?: string;
  exp?: number;
}

export interface UserState {
  login: string;
  role: UserRole;
  token: string;
  id?: number;
}

interface AuthContextType {
  user: UserState | null;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (data: RegisterDto) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('clinic_jwt_token');
    const savedUserStr = localStorage.getItem('clinic_user');

    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
        const nameClaim = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || decoded.sub || 'Пользователь';

        let parsedRole: UserRole = UserRole.Patient;
        if (roleClaim) {
          if (typeof roleClaim === 'number') {
            parsedRole = roleClaim;
          } else if (roleClaim === 'Admin' || roleClaim === '1') parsedRole = UserRole.Admin;
          else if (roleClaim === 'Doctor' || roleClaim === '2') parsedRole = UserRole.Doctor;
          else if (roleClaim === 'Registrar' || roleClaim === '3') parsedRole = UserRole.Registrar;
          else if (roleClaim === 'Patient' || roleClaim === '4') parsedRole = UserRole.Patient;
        }

        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

        setUser({
          token,
          login: savedUser?.login || nameClaim,
          role: savedUser?.role ?? parsedRole,
          id: savedUser?.id,
        });
      } catch (err) {
        console.error('Failed to parse saved token:', err);
        localStorage.removeItem('clinic_jwt_token');
        localStorage.removeItem('clinic_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginDto) => {
    const response = await api.post<AuthResponseDto>('/auth/login', credentials);
    const { token } = response.data;
    
    localStorage.setItem('clinic_jwt_token', token);

    let parsedRole: UserRole = UserRole.Patient;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const roleClaim = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded.role;
      if (roleClaim) {
        if (typeof roleClaim === 'number') parsedRole = roleClaim;
        else if (roleClaim === 'Admin' || roleClaim === '1') parsedRole = UserRole.Admin;
        else if (roleClaim === 'Doctor' || roleClaim === '2') parsedRole = UserRole.Doctor;
        else if (roleClaim === 'Registrar' || roleClaim === '3') parsedRole = UserRole.Registrar;
        else if (roleClaim === 'Patient' || roleClaim === '4') parsedRole = UserRole.Patient;
      }
    } catch {
      // Fallback
    }

    const userData: UserState = {
      login: credentials.login,
      role: parsedRole,
      token,
    };

    localStorage.setItem('clinic_user', JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (data: RegisterDto) => {
    await api.post('/auth/register', data);
  };

  const logout = () => {
    localStorage.removeItem('clinic_jwt_token');
    localStorage.removeItem('clinic_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
