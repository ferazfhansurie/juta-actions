import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import DashboardPage from './pages/DashboardPage';
import AIActionsPage from './pages/AIActionsPage';
import InternalItemsPage from './pages/InternalItemsPage';
import NotesPage from './pages/NotesPage';
import LandingPage from './pages/LandingPage';
import AuthWrapper from './components/AuthWrapper';
import Navigation from './components/Navigation';

// Component to handle register route for marketing
const RegisterHandler: React.FC = () => {
  return <LandingPage />;
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="glass-card rounded-2xl compact-padding text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-4 float">
              <img src="/logo.png" alt="Juta AI" className="w-16 h-16 object-contain rounded-2xl" />
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-4"></div>
            <p className="text-white/70">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/app" : "/login"} replace />} />
          <Route path="/register" element={<RegisterHandler />} />
          {isAuthenticated ? (
            <>
              <Route path="/app" element={
                <div className="flex min-h-screen">
                  <Navigation />
                  <div className="flex-1 overflow-x-hidden lg:ml-0">
                    <div className="lg:ml-0">
                      <AIActionsPage />
                    </div>
                  </div>
                </div>
              } />
              <Route path="/actions" element={
                <div className="flex min-h-screen">
                  <Navigation />
                  <div className="flex-1 overflow-x-hidden lg:ml-0">
                    <div className="lg:ml-0">
                      <AIActionsPage />
                    </div>
                  </div>
                </div>
              } />
              <Route path="/items" element={
                <div className="flex min-h-screen">
                  <Navigation />
                  <div className="flex-1 overflow-x-hidden lg:ml-0">
                    <div className="lg:ml-0">
                      <InternalItemsPage />
                    </div>
                  </div>
                </div>
              } />
              <Route path="/notes" element={
                <div className="flex min-h-screen">
                  <Navigation />
                  <div className="flex-1 overflow-x-hidden lg:ml-0">
                    <div className="lg:ml-0">
                      <NotesPage />
                    </div>
                  </div>
                </div>
              } />
              <Route path="/dashboard" element={
                <div className="flex min-h-screen">
                  <Navigation />
                  <div className="flex-1 overflow-x-hidden lg:ml-0">
                    <div className="lg:ml-0">
                      <DashboardPage />
                    </div>
                  </div>
                </div>
              } />
            </>
          ) : (
            <Route path="/login" element={<AuthWrapper />} />
          )}
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;