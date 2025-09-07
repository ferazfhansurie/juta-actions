import React, { useState } from 'react';
import { Clock, User, MessageSquare, CheckCircle, XCircle, Calendar, StickyNote, Bell, ListTodo, UserPlus, AlertTriangle, Users, BookOpen, DollarSign, Heart, ShoppingCart, Plane, Lightbulb, FileText, Phone, Hash } from 'lucide-react';

interface ActionCardProps {
  action: {
    actionId: string;
    type: string;
    description: string;
    details: {
      title: string;
      content: string;
      datetime?: string;
      priority: string;
      category: string;
    };
    confidence: number;
    originalMessage: {
      fromName: string;
      from: string;
      chatName?: string;
      body: string;
      timestamp: number;
      isGroup?: boolean;
    };
  };
  onApprove: (actionId: string, response: any) => void;
  onReject: (actionId: string) => void;
}

const ActionCard: React.FC<ActionCardProps> = ({ action, onApprove, onReject }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedTitle, setEditedTitle] = useState(action.details.title);
  const [editedContent, setEditedContent] = useState(action.details.content);
  const [editedDatetime, setEditedDatetime] = useState(
    action.details.datetime ? new Date(action.details.datetime).toISOString().slice(0, 16) : ''
  );

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'reminder': return <Bell className="w-4 h-4" />;
      case 'note': return <StickyNote className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'task': return <ListTodo className="w-4 h-4" />;
      case 'contact': return <UserPlus className="w-4 h-4" />;
      case 'issue': return <AlertTriangle className="w-4 h-4" />;
      case 'follow_up': return <Users className="w-4 h-4" />;
      case 'learning': return <BookOpen className="w-4 h-4" />;
      case 'finance': return <DollarSign className="w-4 h-4" />;
      case 'health': return <Heart className="w-4 h-4" />;
      case 'shopping': return <ShoppingCart className="w-4 h-4" />;
      case 'travel': return <Plane className="w-4 h-4" />;
      case 'creative': return <Lightbulb className="w-4 h-4" />;
      case 'administrative': return <FileText className="w-4 h-4" />;
      case 'communication': return <Phone className="w-4 h-4" />;
      case 'question': return <MessageSquare className="w-4 h-4" />;
      case 'research': return <BookOpen className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-300 bg-red-600/30 border-red-400/50 animate-pulse';
      case 'high': return 'text-red-400 bg-red-500/20 border-red-400/30';
      case 'medium': return 'text-amber-400 bg-amber-500/20 border-amber-400/30';
      case 'low': return 'text-emerald-400 bg-emerald-500/20 border-emerald-400/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-400/30';
    }
  };

  const getActionTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'reminder': 'Reminder',
      'note': 'Note',
      'event': 'Event',
      'task': 'Task',
      'contact': 'Contact',
      'issue': 'Issue Report',
      'follow_up': 'Follow-up',
      'learning': 'Learning',
      'finance': 'Finance',
      'health': 'Health',
      'shopping': 'Shopping',
      'travel': 'Travel',
      'creative': 'Creative',
      'administrative': 'Admin Task',
      'communication': 'Response Needed',
      'question': 'Question',
      'research': 'Research'
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleApprove = () => {
    const response = {
      title: editedTitle,
      content: editedContent,
      datetime: editedDatetime || undefined,
      priority: action.details.priority,
      category: action.details.category
    };
    onApprove(action.actionId, response);
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:shadow-xl hover:shadow-white/10">
      {/* Enhanced gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 opacity-0 hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-4">
     

        {/* Compact Form Fields */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">Title</label>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-300 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/90 mb-1">Content</label>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/60 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-300 resize-none text-sm"
            />
          </div>

          {(action.type === 'reminder' || action.type === 'event') && (
            <div>
              <label className="block text-xs font-semibold text-white/90 mb-1">Date & Time</label>
              <input
                type="datetime-local"
                value={editedDatetime}
                onChange={(e) => setEditedDatetime(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-300 text-sm"
              />
            </div>
          )}
        </div>

        {/* Compact Message Info */}
        <div className={`mt-4 p-3 rounded-lg ${
          action.originalMessage.isGroup 
            ? 'bg-blue-500/10 border border-blue-400/30' 
            : 'bg-white/5 border border-white/20'
        }`}>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-white/80">
              {action.originalMessage.isGroup ? (
                <Hash className="w-3 h-3 text-blue-400" />
              ) : (
                <User className="w-3 h-3" />
              )}
              <span className="font-semibold">{action.originalMessage.fromName}</span>
              {action.originalMessage.chatName && action.originalMessage.isGroup && (
                <>
                  <span>in</span>
                  <span className="font-bold text-blue-300 flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{action.originalMessage.chatName}</span>
                  </span>
                </>
              )}
              {action.originalMessage.chatName && !action.originalMessage.isGroup && (
                <>
                  <span>via</span>
                  <span className="font-bold text-white">{action.originalMessage.chatName}</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-1 text-white/60">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{new Date(action.originalMessage.timestamp * 1000).toLocaleString()}</span>
            </div>
          </div>
          <div className="mt-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-2 py-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-md text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 text-xs font-medium"
            >
              {isExpanded ? 'Hide' : 'Show'} original message
            </button>
            {isExpanded && (
              <div className="mt-2 p-2 bg-white/5 rounded-md text-xs text-white/80 border border-white/10">
                "{action.originalMessage.body}"
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActionCard;