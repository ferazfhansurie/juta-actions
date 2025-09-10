import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  MessageSquare, 
  Calendar, 
  CheckSquare, 
  HelpCircle, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  DollarSign, 
  Heart, 
  ShoppingCart, 
  Plane, 
  Lightbulb, 
  FileText,
  Phone,
  ArrowRight,
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  Clock,
  Activity,
  TrendingUp,
  Database,
  Cpu,
  Wifi,
  Star,
  Shield,
  Lock,
  Smartphone,
  Bot,
  Sparkles,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Video,
  MoreVertical,
  Send
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [currentDemoAction, setCurrentDemoAction] = useState(0);

  // Demo actions for interactive showcase
  const demoActions = [
    {
      type: 'reminder',
      description: 'Team, esok meeting kul 2pm tau',
      fromName: 'Customer',
      chatName: 'Customer Support',
      isGroup: false,
      timestamp: Date.now() / 1000 - 300,
      priority: 'medium',
      details: {
        title: 'Team meeting',
        time: 'Tomorrow at 2:00 PM',
        priority: 'medium'
      }
    },
    {
      type: 'event',
      description: 'Hi, can we schedule a call next week to discuss the project proposal?',
      fromName: 'Client',
      chatName: 'Project Discussion',
      isGroup: false,
      timestamp: Date.now() / 1000 - 600,
      priority: 'high',
      details: {
        title: 'Project Call',
        time: 'Next week',
        priority: 'high'
      }
    },
    {
      type: 'task',
      description: 'Please send me the invoice for last month\'s services',
      fromName: 'Business Partner',
      chatName: null,
      isGroup: false,
      timestamp: Date.now() / 1000 - 900,
      priority: 'urgent',
      details: {
        title: 'Send Invoice',
        time: 'ASAP',
        priority: 'urgent'
      }
    },
    {
      type: 'note',
      description: 'The new product launch is scheduled for March 15th, just wanted to keep you updated',
      fromName: 'Product Manager',
      chatName: 'Product Updates',
      isGroup: true,
      timestamp: Date.now() / 1000 - 1200,
      priority: 'low',
      details: {
        title: 'Product Launch Update',
        content: 'March 15th',
        priority: 'low'
      }
    },
    {
      type: 'issue',
      description: 'I\'m having trouble accessing the dashboard, can you help?',
      fromName: 'Customer',
      chatName: 'Support',
      isGroup: false,
      timestamp: Date.now() / 1000 - 1500,
      priority: 'high',
      details: {
        title: 'Dashboard Access Issue',
        time: 'Immediate',
        priority: 'high'
      }
    }
  ];

  // Auto-rotate demo actions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDemoAction((prev) => (prev + 1) % demoActions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
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
    return phone.length >= 10 && phone.startsWith('+60');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      setError('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Malaysian phone number');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'task': case 'reminder': return <CheckSquare className="w-4 h-4" />;
      case 'question': case 'follow_up': return <HelpCircle className="w-4 h-4" />;
      case 'issue': return <AlertTriangle className="w-4 h-4" />;
      case 'contact': case 'communication': return <Users className="w-4 h-4" />;
      case 'learning': case 'research': return <BookOpen className="w-4 h-4" />;
      case 'finance': return <DollarSign className="w-4 h-4" />;
      case 'health': return <Heart className="w-4 h-4" />;
      case 'shopping': return <ShoppingCart className="w-4 h-4" />;
      case 'travel': return <Plane className="w-4 h-4" />;
      case 'creative': return <Lightbulb className="w-4 h-4" />;
      case 'administrative': return <FileText className="w-4 h-4" />;
      case 'note': return <MessageSquare className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-400/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-400/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-400/30';
      default: return 'bg-blue-500/20 text-blue-300 border-blue-400/30';
    }
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Detection',
      description: 'Advanced AI automatically identifies actionable content in your WhatsApp conversations',
      color: 'purple'
    },
    {
      icon: MessageSquare,
      title: 'Real-time Monitoring',
      description: 'Processes messages as they arrive, never missing important actions',
      color: 'blue'
    },
    {
      icon: CheckSquare,
      title: 'Smart Categorization',
      description: 'Automatically categorizes actions into reminders, events, tasks, and more',
      color: 'green'
    },
    {
      icon: Shield,
      title: 'Privacy First',
      description: 'Your conversations stay private. We only process what you approve',
      color: 'orange'
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      description: 'Get notified immediately when actions are detected in your chats',
      color: 'yellow'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track your productivity and get insights into your communication patterns',
      color: 'cyan'
    }
  ];

  const actionTypes = [
    { icon: Calendar, name: 'Events', count: 12, color: 'purple' },
    { icon: CheckSquare, name: 'Tasks', count: 8, color: 'blue' },
    { icon: MessageSquare, name: 'Notes', count: 15, color: 'green' },
    { icon: Users, name: 'Contacts', count: 3, color: 'orange' },
    { icon: HelpCircle, name: 'Questions', count: 5, color: 'yellow' },
    { icon: AlertTriangle, name: 'Issues', count: 2, color: 'red' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-8">
              <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 float">
                <img src="/logo.png" alt="Juta AI" className="w-20 h-20 object-contain rounded-2xl" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold gradient-text mb-6">
                Your AI-Powered
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Second Brain
                </span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/80 max-w-3xl mx-auto mb-8">
                Never miss important actions in your WhatsApp conversations. 
                Our AI automatically detects reminders, events, tasks, and more.
              </p>
            </div>

            {/* CTA Section */}
            <div className="max-w-md mx-auto mb-12">
              {!submitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-white/50" />
                    </div>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="+60 12 345 6789"
                      className="w-full pl-12 pr-4 py-4 glass-input rounded-xl text-white placeholder-white/50 focus:outline-none transition-all text-lg"
                    />
                  </div>
                  
                  {error && (
                    <div className="flex items-center space-x-2 text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !phoneNumber}
                    className="w-full flex items-center justify-center space-x-3 px-8 py-4 glass-button text-white rounded-xl hover:shadow-glass-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                        <span>Getting Started...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Early Access</span>
                        <ArrowRight className="w-6 h-6" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <div className="glass-card rounded-xl p-8 text-center">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                  <p className="text-white/70">
                    We'll notify you when Juta AI is ready for your phone number.
                  </p>
                </div>
              )}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4" />
                <span>100% Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Real-time</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Demo Section */}
      <div className="py-16 lg:py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Watch how Juta AI automatically detects and categorizes actions from customer messages and conversations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">
            {/* Demo Phone 1 - Meeting Reminder */}
            <div className="relative">
              <h3 className="text-lg font-bold text-white mb-4 text-center">Meeting Reminder</h3>
              
              {/* AI Detection Indicator */}
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3 mb-4 max-w-sm mx-auto">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-300 text-sm font-semibold">AI DETECTED ACTION</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="text-white text-sm">Reminder Scheduled:</span>
                </div>
                <p className="text-white text-sm ml-6">Team meeting – 2:00 PM</p>
              </div>

              <div className="glass-card rounded-3xl p-6 max-w-sm mx-auto">
                <div className="bg-gray-900 rounded-2xl relative overflow-hidden">
                  {/* WhatsApp Header */}
                  <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">Customer</h4>
                        <p className="text-green-100 text-xs">online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Phone className="w-5 h-5 text-white" />
                      <Video className="w-5 h-5 text-white" />
                      <MoreVertical className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Chat Background */}
                  <div className="bg-gray-100 p-4 min-h-64" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}>
                    {/* Chat Messages */}
                    <div className="space-y-3">
                      <div className="flex justify-start">
                        <div className="flex items-end space-x-2">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            C
                          </div>
                          <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm text-gray-800">Team, esok meeting kul 2pm tau</p>
                            <p className="text-xs text-gray-500 mt-1">2:30 PM</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="flex items-end space-x-2">
                          <div className="bg-green-500 rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm text-white">Orait bos</p>
                            <p className="text-xs text-green-100 mt-1">2:31 PM</p>
                          </div>
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            U
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="bg-white px-4 py-3 flex items-center space-x-3 border-t border-gray-200">
                    <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                      <span className="text-gray-500 text-sm">Type a message</span>
                    </div>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Phone 2 - Customer Service Issue */}
            <div className="relative">
              <h3 className="text-lg font-bold text-white mb-4 text-center">Support Issue</h3>
              
              {/* AI Detection Indicator */}
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3 mb-4 max-w-sm mx-auto">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-300 text-sm font-semibold">AI DETECTED ACTION</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-white text-sm">Support Ticket Created:</span>
                </div>
                <p className="text-white text-sm ml-6">Dashboard access issue – Priority: High</p>
              </div>

              <div className="glass-card rounded-3xl p-6 max-w-sm mx-auto">
                <div className="bg-gray-900 rounded-2xl relative overflow-hidden">
                  {/* WhatsApp Header */}
                  <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">Customer</h4>
                        <p className="text-green-100 text-xs">online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Phone className="w-5 h-5 text-white" />
                      <Video className="w-5 h-5 text-white" />
                      <MoreVertical className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Chat Background */}
                  <div className="bg-gray-100 p-4 min-h-64" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}>
                    {/* Chat Messages */}
                    <div className="space-y-3">
                      <div className="flex justify-start">
                        <div className="flex items-end space-x-2">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            C
                          </div>
                          <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm text-gray-800">I'm having trouble accessing the dashboard, can you help?</p>
                            <p className="text-xs text-gray-500 mt-1">3:45 PM</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="flex items-end space-x-2">
                          <div className="bg-green-500 rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm text-white">Ok bos lemme check</p>
                            <p className="text-xs text-green-100 mt-1">3:46 PM</p>
                          </div>
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            U
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="bg-white px-4 py-3 flex items-center space-x-3 border-t border-gray-200">
                    <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                      <span className="text-gray-500 text-sm">Type a message</span>
                    </div>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Phone 3 - Event Scheduling */}
            <div className="relative">
              <h3 className="text-lg font-bold text-white mb-4 text-center">Event Scheduling</h3>
              
              {/* AI Detection Indicator */}
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3 mb-4 max-w-sm mx-auto">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-300 text-sm font-semibold">AI DETECTED ACTION</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm">Meeting Scheduled:</span>
                </div>
                <p className="text-white text-sm ml-6">Project proposal call – Next week</p>
              </div>

              <div className="glass-card rounded-3xl p-6 max-w-sm mx-auto">
                <div className="bg-gray-900 rounded-2xl relative overflow-hidden">
                  {/* WhatsApp Header */}
                  <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">Client</h4>
                        <p className="text-green-100 text-xs">online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Phone className="w-5 h-5 text-white" />
                      <Video className="w-5 h-5 text-white" />
                      <MoreVertical className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Chat Background */}
                  <div className="bg-gray-100 p-4 min-h-64" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}>
                    {/* Chat Messages */}
                    <div className="space-y-3">
                      <div className="flex justify-start">
                        <div className="flex items-end space-x-2">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            C
                          </div>
                          <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm text-gray-800">Hi, can we schedule a call next week to discuss the project proposal?</p>
                            <p className="text-xs text-gray-500 mt-1">4:15 PM</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="flex items-end space-x-2">
                          <div className="bg-green-500 rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm text-white">Ok can bos</p>
                            <p className="text-xs text-green-100 mt-1">4:16 PM</p>
                          </div>
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            U
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="bg-white px-4 py-3 flex items-center space-x-3 border-t border-gray-200">
                    <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                      <span className="text-gray-500 text-sm">Type a message</span>
                    </div>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Phone 4 - Task Assignment */}
            <div className="relative">
              <h3 className="text-lg font-bold text-white mb-4 text-center">Task Assignment</h3>
              
              {/* AI Detection Indicator */}
              <div className="bg-purple-500/20 border border-purple-400/30 rounded-lg p-3 mb-4 max-w-sm mx-auto">
                <div className="flex items-center space-x-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-300" />
                  <span className="text-purple-300 text-sm font-semibold">AI DETECTED ACTION</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckSquare className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">Task Created:</span>
                </div>
                <p className="text-white text-sm ml-6">Send invoice – Priority: Urgent</p>
              </div>

              <div className="glass-card rounded-3xl p-6 max-w-sm mx-auto">
                <div className="bg-gray-900 rounded-2xl relative overflow-hidden">
                  {/* WhatsApp Header */}
                  <div className="bg-green-600 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="text-white font-semibold text-sm">Business Partner</h4>
                        <p className="text-green-100 text-xs">online</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Phone className="w-5 h-5 text-white" />
                      <Video className="w-5 h-5 text-white" />
                      <MoreVertical className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  
                  {/* Chat Background */}
                  <div className="bg-gray-100 p-4 min-h-64" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23f0f0f0" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}>
                    {/* Chat Messages */}
                    <div className="space-y-3">
                      <div className="flex justify-start">
                        <div className="flex items-end space-x-2">
                          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            C
                          </div>
                          <div className="bg-white rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm text-gray-800">Please send me the invoice for last month's services</p>
                            <p className="text-xs text-gray-500 mt-1">5:30 PM</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="flex items-end space-x-2">
                          <div className="bg-green-500 rounded-lg p-3 max-w-xs shadow-sm">
                            <p className="text-sm text-white">I'll get that to you right away</p>
                            <p className="text-xs text-green-100 mt-1">5:31 PM</p>
                          </div>
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            U
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="bg-white px-4 py-3 flex items-center space-x-3 border-t border-gray-200">
                    <div className="flex-1 bg-gray-100 rounded-full px-4 py-2 flex items-center">
                      <span className="text-gray-500 text-sm">Type a message</span>
                    </div>
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Send className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            </div>

            {/* Live Action Feed */}
          <div className="mt-16 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Live Action Detection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {demoActions.map((action, index) => (
                  <div 
                    key={index}
                    className={`relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 transition-all duration-500 ${
                      index === currentDemoAction 
                        ? 'scale-105 shadow-xl shadow-purple-500/20 border-purple-400/40' 
                        : 'opacity-60'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30">
                            {getActionIcon(action.type)}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">
                              {action.type.charAt(0).toUpperCase() + action.type.slice(1)} Detected
                            </h4>
                            <p className="text-xs text-white/80">{action.description}</p>
                          </div>
                        </div>
                        
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getPriorityColor(action.priority)}`}>
                          {action.priority}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-white/20">
                        <div className="flex items-center space-x-2 text-xs text-white/70">
                          {action.isGroup ? (
                            <Users className="w-3 h-3 text-blue-400" />
                          ) : (
                            <MessageSquare className="w-3 h-3" />
                          )}
                          <span>{action.fromName}</span>
                          {action.chatName && (
                            <span className="text-blue-300">#{action.chatName}</span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-white/60">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(action.timestamp * 1000).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Everything you need to turn your WhatsApp conversations into actionable insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div 
                  key={index}
                  className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/10 group"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative p-6">
                    <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/20 backdrop-blur-sm border border-${feature.color}-400/30 flex items-center justify-center mb-4`}>
                      <IconComponent className={`w-6 h-6 text-${feature.color}-300`} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                    <p className="text-white/70">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Types Section */}
      <div className="py-16 lg:py-24 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-4">
              Detects All Action Types
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              From simple reminders to complex events, our AI understands context and intent
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {actionTypes.map((actionType, index) => {
              const IconComponent = actionType.icon;
              return (
                <div 
                  key={index}
                  className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 group text-center p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-${actionType.color}-500/20 backdrop-blur-sm border border-${actionType.color}-400/30 flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className={`w-6 h-6 text-${actionType.color}-300`} />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{actionType.name}</h3>
                    <p className="text-2xl font-bold text-white">{actionType.count}</p>
                    <p className="text-xs text-white/60">detected</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">99.2%</div>
              <div className="text-white/70">Accuracy Rate</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">2.3s</div>
              <div className="text-white/70">Avg Response Time</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">24/7</div>
              <div className="text-white/70">Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-4xl lg:text-5xl font-bold gradient-text mb-2">100%</div>
              <div className="text-white/70">Private & Secure</div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="py-16 lg:py-24 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold gradient-text mb-6">
            Ready to Transform Your WhatsApp Experience?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Join the waitlist and be among the first to experience AI-powered action detection
          </p>
          
          {!submitted && (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-white/50" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="+60 12 345 6789"
                    className="w-full pl-12 pr-4 py-4 glass-input rounded-xl text-white placeholder-white/50 focus:outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !phoneNumber}
                  className="px-8 py-4 glass-button text-white rounded-xl hover:shadow-glass-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                </button>
              </div>
            </form>
          )}

          {submitted && (
            <div className="glass-card rounded-xl p-8 max-w-md mx-auto">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Welcome to the future!</h3>
              <p className="text-white/70">
                We'll notify you as soon as Juta AI is ready for your phone number.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <img src="/logo.png" alt="Juta AI" className="w-8 h-8" />
              <span className="text-white font-bold text-lg">Juta AI</span>
            </div>
            <div className="text-white/60 text-sm">
              © 2024 Juta AI. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
