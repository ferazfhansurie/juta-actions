import React, { useState, useEffect } from 'react';
import { Phone, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormProps {
  onSuccess: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authorizedNumbers, setAuthorizedNumbers] = useState<string[]>([]);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(true);
  const { login } = useAuth();

  // Load authorized phone numbers from API
  useEffect(() => {
    const loadAuthorizedNumbers = async () => {
      try {
        setIsLoadingNumbers(true);
        const response = await fetch('https://c4ba947d9455f026.ngrok.app/api/auth/authorized-numbers');
        const data = await response.json();
        
        if (data.success) {
          setAuthorizedNumbers(data.phoneNumbers);
        } else {
          setError('Failed to load authorized numbers');
        }
      } catch (err) {
        console.error('Error loading authorized numbers:', err);
        setError('Failed to connect to server');
      } finally {
        setIsLoadingNumbers(false);
      }
    };

    loadAuthorizedNumbers();
  }, []);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const cleaned = value.replace(/\D/g, '');
    
    // Format as international number (assuming +60 for Malaysia)
    if (cleaned.startsWith('60')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+60${cleaned.substring(1)}`;
    } else if (cleaned.length > 0) {
      return `+60${cleaned}`;
    }
    
    return cleaned;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    setError('');
  };

  const validatePhoneNumber = (phone: string) => {
    // Check if phone number is in authorized numbers list
    return authorizedNumbers.includes(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('This phone number is not authorized to access the system');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await login(phoneNumber);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="glass-card rounded-2xl compact-padding text-center">
          {/* Logo */}
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 glass-card rounded-2xl flex items-center justify-center mb-4 float">
              <img src="/logo.png" alt="Juta AI" className="w-22 h-22" />
            </div>
            <h1 className="text-2xl font-bold gradient-text mb-2">Welcome to Juta AI</h1>
            <p className="text-white/70">Enter your authorized phone number to access the system</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2 text-left">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-white/50" />
                </div>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="+60 12 345 6789"
                  className="w-full pl-10 pr-4 py-3 glass-input rounded-xl text-white placeholder-white/50 focus:outline-none transition-all"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center space-x-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {isLoadingNumbers && (
              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                <span>Loading authorized numbers...</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !phoneNumber || isLoadingNumbers}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 glass-button text-white rounded-xl hover:shadow-glass-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <CheckCircle className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
