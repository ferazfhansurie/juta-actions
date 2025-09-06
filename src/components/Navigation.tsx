import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Archive, 
  LogOut, 
  Bot,
  Folder,
  Settings,
  Home,
  BarChart3,
  Brain,
  Database,
  TrendingUp,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { 
      to: '/actions', 
      icon: Brain, 
      label: 'AI Actions',
      description: 'WhatsApp message actions' 
    },
    { 
      to: '/notes', 
      icon: Archive, 
      label: 'Brain Dump',
      description: 'Notes & thoughts' 
    },
    { 
      to: '/items', 
      icon: Database, 
      label: 'Internal Items',
      description: 'All your items' 
    },
   
    { 
      to: '/dashboard', 
      icon: TrendingUp, 
      label: 'Dashboard',
      description: 'Overview & analytics' 
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Navigation Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 min-h-screen flex flex-col bg-white/5 backdrop-blur-xl border-r border-white/10
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Modern Logo/Header */}
        <div className="p-4 lg:p-6 border-b border-white/10">
          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="relative">
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <img 
                  src="/logo.png" 
                  alt="Juta AI Logo" 
                  className="w-6 h-6 lg:w-16 lg:h-16 object-contain"
                  onError={(e) => {
                    // Fallback to icon if logo fails to load
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const nextElement = target.nextElementSibling as HTMLElement;
                    if (nextElement) {
                      nextElement.style.display = 'block';
                    }
                  }}
                />
                <Brain className="w-6 h-6 lg:w-8 lg:h-8 text-white hidden" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Second Brain
              </h1>
              <p className="text-xs text-white/60 font-medium">By Juta Teknologi Sdn Bhd</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 lg:px-4 py-4 lg:py-6">
          <div className="space-y-1 lg:space-y-2">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => `
                  group relative flex items-center space-x-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all duration-300 overflow-hidden
                  ${isActive 
                    ? 'bg-white/15 text-white shadow-lg shadow-white/10 border border-white/20' 
                    : 'text-white/70 hover:text-white hover:bg-white/10 hover:shadow-md hover:shadow-white/5 border border-transparent'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-r-full"></div>
                    )}
                    
                    <div className={`p-1.5 lg:p-2 rounded-lg transition-all duration-300 ${
                      isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                    }`}>
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{item.label}</p>
                      <p className="text-xs opacity-75 truncate hidden lg:block">{item.description}</p>
                    </div>
                    
                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-white/10 p-3 lg:p-4">
          <div className="flex items-center space-x-3 mb-3 lg:mb-4">
            <div className="relative">
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs lg:text-sm font-bold text-white">
                  {user?.phoneNumber?.slice(-2) || 'U'}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-400 rounded-full border-2 border-white/10"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-white/60 truncate hidden lg:block">
                {user?.phoneNumber}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-sm bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/70 hover:text-white rounded-xl transition-all duration-300 group"
          >
            <div className="p-1 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors duration-300">
              <LogOut className="w-4 h-4" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Navigation;