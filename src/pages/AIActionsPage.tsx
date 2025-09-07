import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ActionCard from '../components/ActionCard';
import ChatMessage from '../components/ChatMessage';
import { Smartphone, Wifi, WifiOff, Brain, MessageSquare, Calendar, CheckSquare, HelpCircle, AlertTriangle, Users, BookOpen, DollarSign, Heart, ShoppingCart, Plane, Lightbulb, FileText, Phone, Filter, Plus, BarChart3, Hash, Clock, CheckCircle, XCircle } from 'lucide-react';

const AIActionsPage: React.FC = () => {
  const { connectionStatus, pendingActions, requestPairingCode, respondToAction } = useSocket();
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showActionDetails, setShowActionDetails] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedActionIndex, setSelectedActionIndex] = useState<number>(-1);
  const actionsContainerRef = useRef<HTMLDivElement>(null);

  // Track pendingActions changes for debugging
  useEffect(() => {
    console.log(`📊 PendingActions updated: ${pendingActions.length} actions`);
    if (pendingActions.length > 0) {
      console.log('📋 Current actions:', pendingActions.map(a => ({
        actionId: a.actionId,
        type: a.type,
        description: a.description.substring(0, 50) + '...'
      })));
      
      // Check for duplicates in pendingActions
      const actionIds = pendingActions.map(a => a.actionId);
      const uniqueIds = new Set(actionIds);
      if (actionIds.length !== uniqueIds.size) {
        console.error('🚨 DUPLICATE ACTIONS IN PENDING LIST:', {
          total: actionIds.length,
          unique: uniqueIds.size,
          duplicates: actionIds.filter((id, index) => actionIds.indexOf(id) !== index)
        });
      }
    }
  }, [pendingActions]);

  // Define action categories with memoization to prevent jittery renders
  const categories = useMemo(() => [
    { id: 'all', name: 'All', icon: MessageSquare, count: pendingActions.length },
    { id: 'event', name: 'Events', icon: Calendar, count: pendingActions.filter(a => a.type === 'event').length },
    { id: 'task', name: 'Tasks', icon: CheckSquare, count: pendingActions.filter(a => a.type === 'task' || a.type === 'reminder').length },
    { id: 'question', name: 'Questions', icon: HelpCircle, count: pendingActions.filter(a => a.type === 'question' || a.type === 'follow_up').length },
    { id: 'issue', name: 'Issues', icon: AlertTriangle, count: pendingActions.filter(a => a.type === 'issue').length },
    { id: 'business', name: 'Business', icon: Users, count: pendingActions.filter(a => a.type === 'contact' || a.type === 'communication').length },
    { id: 'learning', name: 'Learning', icon: BookOpen, count: pendingActions.filter(a => a.type === 'learning' || a.type === 'research').length },
    { id: 'finance', name: 'Finance', icon: DollarSign, count: pendingActions.filter(a => a.type === 'finance').length },
    { id: 'health', name: 'Health', icon: Heart, count: pendingActions.filter(a => a.type === 'health').length },
    { id: 'shopping', name: 'Shopping', icon: ShoppingCart, count: pendingActions.filter(a => a.type === 'shopping').length },
    { id: 'travel', name: 'Travel', icon: Plane, count: pendingActions.filter(a => a.type === 'travel').length },
    { id: 'creative', name: 'Creative', icon: Lightbulb, count: pendingActions.filter(a => a.type === 'creative').length },
    { id: 'admin', name: 'Admin', icon: FileText, count: pendingActions.filter(a => a.type === 'administrative').length },
  ], [pendingActions]);

  // Filter actions based on selected category
  const filteredActions = useMemo(() => {
    console.log(`🔍 Filtering actions: ${pendingActions.length} total, category: ${selectedCategory}`);
    
    if (selectedCategory === 'all') {
      console.log(`📋 Displaying all ${pendingActions.length} actions`);
      return pendingActions;
    }
    
    const filtered = pendingActions.filter(action => {
      switch (selectedCategory) {
        case 'task': return action.type === 'task' || action.type === 'reminder';
        case 'question': return action.type === 'question' || action.type === 'follow_up';
        case 'business': return action.type === 'contact' || action.type === 'communication';
        case 'learning': return action.type === 'learning' || action.type === 'research';
        default: return action.type === selectedCategory;
      }
    });
    
    console.log(`📋 Displaying ${filtered.length} filtered actions for category: ${selectedCategory}`);
    
    // Check for duplicates in filtered actions
    const actionIds = filtered.map(a => a.actionId);
    const uniqueIds = new Set(actionIds);
    if (actionIds.length !== uniqueIds.size) {
      console.error('🚨 DUPLICATE ACTIONS IN FILTERED LIST:', {
        total: actionIds.length,
        unique: uniqueIds.size,
        duplicates: actionIds.filter((id, index) => actionIds.indexOf(id) !== index),
        category: selectedCategory
      });
    }
    
    return filtered;
  }, [pendingActions, selectedCategory]);

  // Get action type color and icon
  const getActionTypeColor = (type: string) => {
    switch (type) {
      case 'event': return 'border-l-blue-400 bg-blue-500/5';
      case 'task': case 'reminder': return 'border-l-green-400 bg-green-500/5';
      case 'question': case 'follow_up': return 'border-l-purple-400 bg-purple-500/5';
      case 'issue': return 'border-l-red-400 bg-red-500/5';
      case 'contact': case 'communication': return 'border-l-orange-400 bg-orange-500/5';
      case 'learning': case 'research': return 'border-l-indigo-400 bg-indigo-500/5';
      case 'finance': return 'border-l-emerald-400 bg-emerald-500/5';
      case 'health': return 'border-l-pink-400 bg-pink-500/5';
      case 'shopping': return 'border-l-yellow-400 bg-yellow-500/5';
      case 'travel': return 'border-l-cyan-400 bg-cyan-500/5';
      case 'creative': return 'border-l-violet-400 bg-violet-500/5';
      case 'administrative': return 'border-l-gray-400 bg-gray-500/5';
      default: return 'border-l-white/30 bg-white/5';
    }
  };

  const getActionTypeIcon = (type: string) => {
    switch (type) {
      case 'event': return Calendar;
      case 'task': return CheckSquare;
      case 'reminder': return Clock;
      case 'question': case 'follow_up': return HelpCircle;
      case 'issue': return AlertTriangle;
      case 'contact': case 'communication': return Users;
      case 'learning': case 'research': return BookOpen;
      case 'finance': return DollarSign;
      case 'health': return Heart;
      case 'shopping': return ShoppingCart;
      case 'travel': return Plane;
      case 'creative': return Lightbulb;
      case 'administrative': return FileText;
      default: return MessageSquare;
    }
  };

  const handleApproveAction = (actionId: string, response: any) => {
    respondToAction(actionId, true, response);
    setSelectedActionIndex(-1);
  };

  const handleRejectAction = (actionId: string) => {
    respondToAction(actionId, false);
    setSelectedActionIndex(-1);
  };

  const handleKeyboardApprove = () => {
    if (selectedActionIndex >= 0 && selectedActionIndex < filteredActions.length) {
      const action = filteredActions[selectedActionIndex];
      const response = {
        title: action.details.title,
        content: action.details.content,
        datetime: action.details.datetime,
        priority: action.details.priority,
        category: action.details.category
      };
      handleApproveAction(action.actionId, response);
    }
  };

  const handleKeyboardReject = () => {
    if (selectedActionIndex >= 0 && selectedActionIndex < filteredActions.length) {
      const action = filteredActions[selectedActionIndex];
      handleRejectAction(action.actionId);
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedActionIndex(-1);
  };

  // Handle loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredActions.length === 0) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedActionIndex(prev => 
            prev <= 0 ? filteredActions.length - 1 : prev - 1
          );
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedActionIndex(prev => 
            prev >= filteredActions.length - 1 ? 0 : prev + 1
          );
          break;
        case 'a':
        case 'A':
          if (e.metaKey || e.ctrlKey) break; // Don't interfere with Cmd+A
          e.preventDefault();
          handleKeyboardApprove();
          break;
        case 'r':
        case 'R':
          if (e.metaKey || e.ctrlKey) break; // Don't interfere with Cmd+R
          e.preventDefault();
          handleKeyboardReject();
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedActionIndex >= 0) {
            const actionId = filteredActions[selectedActionIndex].actionId;
            setShowActionDetails(showActionDetails === actionId ? null : actionId);
          }
          break;
        case 'Escape':
          setShowActionDetails(null);
          setSelectedActionIndex(-1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredActions, selectedActionIndex, showActionDetails]);

  // Auto-select first action when list changes
  useEffect(() => {
    if (filteredActions.length > 0 && selectedActionIndex === -1) {
      setSelectedActionIndex(0);
    } else if (filteredActions.length === 0) {
      setSelectedActionIndex(-1);
    } else if (selectedActionIndex >= filteredActions.length) {
      setSelectedActionIndex(filteredActions.length - 1);
    }
  }, [filteredActions.length, selectedActionIndex]);

  return (
    <div className="min-h-screen p-3 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Ultra Compact Header & Controls */}
        <div className="flex items-center justify-between mb-3">
        
          
          {/* Enhanced Category Pills */}
          <div className="flex items-center space-x-1 lg:space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`flex items-center space-x-1 lg:space-x-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-xl text-xs lg:text-sm font-medium transition-all duration-300 whitespace-nowrap min-w-fit ${
                    selectedCategory === category.id 
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30 shadow-lg' 
                      : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                  }`}
                >
                  <IconComponent className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                  <span className="truncate max-w-[80px] lg:max-w-[120px]">{category.name}</span>
                  {category.count !== null && category.count > 0 && (
                    <span className="ml-1 px-1.5 lg:px-2 py-0.5 bg-white/10 text-white/80 text-xs rounded-full font-semibold min-w-[16px] lg:min-w-[20px] text-center">
                      {category.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions Section Header */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm lg:text-base font-bold text-white">
            {selectedCategory === 'all' ? 'All Actions' : `${categories.find(c => c.id === selectedCategory)?.name} Actions`}
          </h2>
          <div className="flex items-center space-x-3">
          
            <div className="text-xs text-white/60">
              {filteredActions.length} actions pending
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 min-h-[400px] lg:min-h-[600px]">
          {!connectionStatus.connected ? (
            <div className="p-4 lg:p-8">
              <QRCodeDisplay 
                qrCode={connectionStatus.qrCode || ''}
                pairingCode={connectionStatus.pairingCode || undefined}
                isConnected={connectionStatus.connected}
                onRequestPairingCode={requestPairingCode}
                phoneNumber={user?.phoneNumber || ''}
                status={connectionStatus.status || 'disconnected'}
                message={connectionStatus.message || 'Not connected'}
              />
            </div>
          ) : (
            <div className="p-3 lg:p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-64 lg:h-96">
                  <div className="text-center px-4">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="text-lg font-bold text-white mb-2">Loading actions...</h3>
                    <p className="text-white/70 text-sm">Please wait while we fetch your pending actions.</p>
                  </div>
                </div>
              ) : filteredActions.length === 0 ? (
                <div className="flex items-center justify-center h-64 lg:h-96">
                  <div className="text-center px-4">
                    <div className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                      <MessageSquare className="w-6 h-6 lg:w-8 lg:h-8 text-white/40" />
                    </div>
                    <h3 className="text-lg lg:text-xl font-bold text-white mb-2">
                      {selectedCategory === 'all' ? 'No actions detected yet' : `No ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} actions`}
                    </h3>
                    <p className="text-white/70 text-sm lg:text-base max-w-md">
                      {selectedCategory === 'all' 
                        ? 'Your AI assistant is listening for actionable messages on WhatsApp. Actions will appear here as they are detected.'
                        : `No actions in the ${categories.find(c => c.id === selectedCategory)?.name.toLowerCase()} category yet.`
                      }
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 lg:space-y-4" ref={actionsContainerRef}>
                  {filteredActions.map((action, index) => {
                    const isSelected = selectedActionIndex === index;
                    const ActionIcon = getActionTypeIcon(action.type);
                    return (
                    <div key={`${action.actionId}-${index}`} className={`group relative overflow-hidden rounded-xl backdrop-blur-xl border-l-4 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-white/10 ${
                      isSelected 
                        ? 'border-white/60 bg-white/20 shadow-lg scale-[1.01]' 
                        : 'border-white/20 bg-white/10 hover:border-white/40'
                    } ${getActionTypeColor(action.type)}`}>
                      {/* Enhanced gradient overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 transition-opacity duration-500 ${
                        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`} />
                      
                      <div className="relative p-3 lg:p-4">
                        {/* Compact AI Message Header */}
                        <div className="flex items-center justify-between mb-2 lg:mb-3">
                          <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                            <div className={`p-1.5 lg:p-2 rounded-lg backdrop-blur-sm border transition-all duration-300 flex-shrink-0 shadow-md ${
                              isSelected ? 'bg-white/30 border-white/50' : 'bg-white/20 border-white/30 group-hover:bg-white/25'
                            }`}>
                              <ActionIcon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-xs lg:text-sm font-bold text-white mb-1 truncate">
                                {action.type.charAt(0).toUpperCase() + action.type.slice(1)} Detected
                              </h3>
                              <p className="text-xs text-white/80 font-medium truncate">{action.description}</p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-2 flex-shrink-0">
                            <span className={`px-1.5 lg:px-2 py-0.5 lg:py-1 text-xs font-semibold rounded-md ${
                              action.details?.priority === 'urgent' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                              action.details?.priority === 'high' ? 'bg-orange-500/20 text-orange-300 border border-orange-400/30' :
                              action.details?.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                              'bg-green-500/20 text-green-300 border border-green-400/30'
                            }`}>
                              {action.details?.priority || 'medium'}
                            </span>
                          
                            <button
                              onClick={() => setShowActionDetails(showActionDetails === action.actionId ? null : action.actionId)}
                              className={`px-2 py-1 backdrop-blur-sm border rounded-md transition-all duration-300 text-xs font-medium ${
                                isSelected ? 'bg-white/20 border-white/30 text-white' : 'bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/15'
                              }`}
                            >
                              {showActionDetails === action.actionId ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </div>
                        
                        {/* Compact Message Info with Action Buttons */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-2 lg:pt-3 border-t border-white/20 space-y-2 lg:space-y-0">
                          <div className="flex items-center space-x-2 lg:space-x-3 text-xs text-white/70">
                            <div className="flex items-center space-x-1">
                              {action.originalMessage.isGroup ? (
                                <Hash className="w-3 h-3 text-blue-400" />
                              ) : (
                                <Users className="w-3 h-3" />
                              )}
                              <span className="font-medium truncate">{action.originalMessage.fromName}</span>
                              {action.originalMessage.isGroup && action.originalMessage.chatName && (
                                <>
                                  <span className="hidden lg:inline">in</span>
                                  <span className="text-blue-300 font-medium">#{action.originalMessage.chatName}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-white/60">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(action.originalMessage.timestamp * 1000).toLocaleString()}</span>
                            </div>
                          </div>
                          
                          {/* Direct Action Buttons */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleRejectAction(action.actionId)}
                              className="flex items-center space-x-1 px-2 py-1 bg-red-500/10 border border-red-400/30 rounded-md text-red-300 hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300 font-medium text-xs"
                            >
                              <XCircle className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                            <button
                              onClick={() => {
                                const response = {
                                  title: action.details.title,
                                  content: action.details.content,
                                  datetime: action.details.datetime,
                                  priority: action.details.priority,
                                  category: action.details.category
                                };
                                handleApproveAction(action.actionId, response);
                              }}
                              className="flex items-center space-x-1 px-2 py-1 bg-green-500/10 border border-green-400/30 rounded-md text-green-300 hover:bg-green-500/20 hover:border-green-400/50 transition-all duration-300 font-medium text-xs"
                            >
                              <CheckCircle className="w-3 h-3" />
                              <span>Approve</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action Details */}
                      {showActionDetails === action.actionId && (
                        <div className="px-3 lg:px-4 pb-3 lg:pb-4">
                          <ActionCard
                            action={action}
                            onApprove={handleApproveAction}
                            onReject={handleRejectAction}
                          />
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIActionsPage;