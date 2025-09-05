import React from 'react';
import LoginForm from './LoginForm';

const AuthWrapper: React.FC = () => {
  const handleLoginSuccess = () => {
    // This will be handled by the AuthContext
    // The user will be redirected to the main app
  };

  return (
    <div className="min-h-screen">
      <LoginForm onSuccess={handleLoginSuccess} />
    </div>
  );
};

export default AuthWrapper;
