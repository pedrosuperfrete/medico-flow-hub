
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'professional';
  name: string;
  clinicId: string;
  professionalId?: string;
  specialty?: string;
  crm?: string;
}

export interface Clinic {
  id: string;
  name: string;
  cnpj: string;
  address: string;
  phone: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  clinic: Clinic | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isOnboardingComplete: boolean;
  completeOnboarding: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);

  const login = async (email: string, password: string) => {
    // Simulação de login - em produção seria uma chamada real para API
    console.log('Login attempt:', { email, password });
    
    // Mock user data
    const mockUser: User = {
      id: '1',
      email: email,
      role: email.includes('admin') ? 'admin' : 'professional',
      name: email.includes('admin') ? 'Dr. Admin' : 'Dr. João Silva',
      clinicId: 'clinic-1',
      professionalId: email.includes('admin') ? undefined : 'prof-1',
      specialty: email.includes('admin') ? undefined : 'Cardiologia',
      crm: email.includes('admin') ? undefined : 'CRM-12345'
    };

    const mockClinic: Clinic = {
      id: 'clinic-1',
      name: 'Clínica Saúde Mais',
      cnpj: '12.345.678/0001-90',
      address: 'Rua das Flores, 123 - Centro',
      phone: '(11) 99999-9999',
      email: 'contato@saudemais.com.br'
    };

    setUser(mockUser);
    setClinic(mockClinic);
    
    // Simula que o onboarding já foi feito para usuários existentes
    setIsOnboardingComplete(true);
  };

  const logout = () => {
    setUser(null);
    setClinic(null);
    setIsOnboardingComplete(false);
  };

  const completeOnboarding = () => {
    setIsOnboardingComplete(true);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        clinic,
        login,
        logout,
        isAuthenticated: !!user,
        isOnboardingComplete,
        completeOnboarding,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
