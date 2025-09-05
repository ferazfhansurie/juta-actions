import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from './LoginForm';

const AuthWrapper: React.FC = () => {
  const navigate = useNavigate();
  
  const handleLoginSuccess = () => {
    // Navigate to /app after successful login
    navigate('/app');
  };

  return (
    <div className="min-h-screen">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
};

export default AuthWrapper;
