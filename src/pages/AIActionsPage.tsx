import React, { useState, useMemo } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../contexts/AuthContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ActionCard from '../components/ActionCard';
import ChatMessage from '../components/ChatMessage';
import { Smartphone, Wifi, WifiOff, Brain, MessageSquare, Calendar, CheckSquare, HelpCircle, AlertTriangle, Users, BookOpen, DollarSign, Heart, ShoppingCart, Plane, Lightbulb, FileText, Phone, Filter, Plus, BarChart3, Hash, Clock } from 'lucide-react';

const AIActionsPage: React.FC = () => {
  const { connectionStatus, pendingActions, requestPairingCode, respondToAction } = useSocket();
  const { user, logout } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showActionDetails, setShowActionDetails] = useState<string | null>(null);

  // Define action categories
  const categories = [
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
  ];

  // Filter actions based on selected category
  const filteredActions = useMemo(() => {
    if (selectedCategory === 'all') return pendingActions;
    return pendingActions.filter(action => {
      switch (selectedCategory) {
        case 'task': return action.type === 'task' || action.type === 'reminder';
        case 'question': return action.type === 'question' || action.type === 'follow_up';
        case 'business': return action.type === 'contact' || action.type === 'communication';
        case 'learning': return action.type === 'learning' || action.type === 'research';
        default: return action.type === selectedCategory;
      }
    });
  }, [pendingActions, selectedCategory]);

  const handleApproveAction = (actionId: string, response: any) => {
    respondToAction(actionId, true, response);
  };

  const handleRejectAction = (actionId: string) => {
    respondToAction(actionId, false);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

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
          <div className="text-xs text-white/60">
            {filteredActions.length} actions pending
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
              {filteredActions.length === 0 ? (
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
                <div className="space-y-3 lg:space-y-4">
                  {filteredActions.map((action, index) => (
                    <div key={`${action.actionId}-${index}`} className="group relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl hover:shadow-white/10">
                      {/* Enhanced gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="relative p-3 lg:p-4">
                        {/* Compact AI Message Header */}
                        <div className="flex items-center justify-between mb-2 lg:mb-3">
                          <div className="flex items-center space-x-2 lg:space-x-3 min-w-0 flex-1">
                            <div className="p-1.5 lg:p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 group-hover:bg-white/25 transition-all duration-300 flex-shrink-0 shadow-md">
                              <Brain className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
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
                              className="px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 text-xs font-medium"
                            >
                              {showActionDetails === action.actionId ? 'Hide' : 'Details'}
                            </button>
                          </div>
                        </div>
                        
                        {/* Compact Message Info */}
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pt-2 lg:pt-3 border-t border-white/20 space-y-1 lg:space-y-0">
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
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-white/60">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(action.originalMessage.timestamp * 1000).toLocaleString()}</span>
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
                  ))}
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