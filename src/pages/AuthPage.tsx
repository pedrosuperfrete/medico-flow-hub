
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated } = useUser();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Plataforma Clínica
          </h1>
          <p className="text-muted-foreground">
            Gestão completa para sua clínica de saúde
          </p>
        </div>
        
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm 
            onSwitchToLogin={() => setIsLogin(true)}
            onRegisterSuccess={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;
