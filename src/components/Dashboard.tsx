import React, { useState, useEffect } from 'react';
import { 
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
  TrendingUp,
  Clock,
  Activity,
  BarChart3,
  Brain,
  MessageSquare,
  Hash,
  Search,
  Filter,
  Plus,
  Eye,
  Check,
  X,
  Star,
  Zap,
  Target,
  Database,
  Cpu,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardProps {
  pendingActions: any[];
  connectionStatus: {
    connected: boolean;
  };
}

const Dashboard: React.FC<DashboardProps> = ({ pendingActions, connectionStatus }) => {
  const { user } = useAuth();
  const [internalItems, setInternalItems] = useState<any[]>([]);
  const [itemCounts, setItemCounts] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('today');

  // Fetch internal items data
  useEffect(() => {
    const fetchInternalItems = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('https://c4ba947d9455f026.ngrok.app/api/internal-items/all/1', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        
        if (data.success) {
          setInternalItems(data.items);
          setItemCounts(data.counts);
        }
      } catch (error) {
        console.error('Error fetching internal items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInternalItems();
  }, []);
  // Calculate comprehensive statistics
  const totalActions = pendingActions.length;
  const urgentActions = pendingActions.filter(a => a.details?.priority === 'urgent').length;
  const highPriorityActions = pendingActions.filter(a => a.details?.priority === 'high').length;
  const completedToday = internalItems.filter(item => 
    item.status === 'completed' && 
    new Date(item.updated_at).toDateString() === new Date().toDateString()
  ).length;
  const avgResponseTime = '2.3 min';

  // Action type counts
  const actionTypeCounts = {
    event: pendingActions.filter(a => a.type === 'event').length,
    task: pendingActions.filter(a => a.type === 'task' || a.type === 'reminder').length,
    question: pendingActions.filter(a => a.type === 'question' || a.type === 'follow_up').length,
    issue: pendingActions.filter(a => a.type === 'issue').length,
    business: pendingActions.filter(a => a.type === 'contact' || a.type === 'communication').length,
    learning: pendingActions.filter(a => a.type === 'learning' || a.type === 'research').length,
    finance: pendingActions.filter(a => a.type === 'finance').length,
    health: pendingActions.filter(a => a.type === 'health').length,
    shopping: pendingActions.filter(a => a.type === 'shopping').length,
    travel: pendingActions.filter(a => a.type === 'travel').length,
    creative: pendingActions.filter(a => a.type === 'creative').length,
    admin: pendingActions.filter(a => a.type === 'administrative').length,
  };

  // Internal items statistics
  const totalItems = internalItems.length;
  const activeItems = internalItems.filter(item => item.status === 'active').length;
  const completedItems = internalItems.filter(item => item.status === 'completed').length;
  const urgentItems = internalItems.filter(item => item.priority === 'urgent').length;

  // Recent activity (actions + items)
  const recentActions = pendingActions
    .sort((a, b) => b.originalMessage.timestamp - a.originalMessage.timestamp)
    .slice(0, 3);
  
  const recentItems = internalItems
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Combined recent activity
  const recentActivity = [
    ...recentActions.map(action => ({ ...action, type: 'action', timestamp: action.originalMessage.timestamp * 1000 })),
    ...recentItems.map(item => ({ ...item, type: 'item', timestamp: new Date(item.created_at).getTime() }))
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 5);

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
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'label-hot';
      case 'high': return 'label-medium';
      case 'medium': return 'label-cold';
      case 'low': return 'label-medium';
      default: return 'label-cold';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading Second Brain</h3>
            <p className="text-white/70">Syncing your AI assistant data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Ultra Compact Header & Controls */}
    

        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3 mb-4 lg:mb-6">
          {/* AI Actions Card */}
          <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-blue-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-3 lg:p-4">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="p-1.5 lg:p-2 rounded-lg bg-purple-500/20 backdrop-blur-sm border border-purple-400/30">
                  <Brain className="w-4 h-4 lg:w-5 lg:h-5 text-purple-300" />
                </div>
                <span className="text-xs text-white/60">AI Actions</span>
              </div>
              <div className="space-y-1 lg:space-y-2">
                <div className="text-lg lg:text-2xl font-bold text-white">{totalActions}</div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-1 lg:space-y-0 text-xs text-white/70">
                  <span>{urgentActions} urgent</span>
                  <span>{highPriorityActions} high</span>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Items Card */}
          <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-3 lg:p-4">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="p-1.5 lg:p-2 rounded-lg bg-blue-500/20 backdrop-blur-sm border border-blue-400/30">
                  <Database className="w-4 h-4 lg:w-5 lg:h-5 text-blue-300" />
                </div>
                <span className="text-xs text-white/60">Internal Items</span>
              </div>
              <div className="space-y-1 lg:space-y-2">
                <div className="text-lg lg:text-2xl font-bold text-white">{totalItems}</div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-1 lg:space-y-0 text-xs text-white/70">
                  <span>{activeItems} active</span>
                  <span>{completedItems} done</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Card */}
          <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-3 lg:p-4">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="p-1.5 lg:p-2 rounded-lg bg-green-500/20 backdrop-blur-sm border border-green-400/30">
                  <TrendingUp className="w-4 h-4 lg:w-5 lg:h-5 text-green-300" />
                </div>
                <span className="text-xs text-white/60">Performance</span>
              </div>
              <div className="space-y-1 lg:space-y-2">
                <div className="text-lg lg:text-2xl font-bold text-white">{avgResponseTime}</div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-1 lg:space-y-0 text-xs text-white/70">
                  <span>94.2% accuracy</span>
                  <span>{completedToday} today</span>
                </div>
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-white/10">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-yellow-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
            <div className="relative p-3 lg:p-4">
              <div className="flex items-center justify-between mb-2 lg:mb-3">
                <div className="p-1.5 lg:p-2 rounded-lg bg-orange-500/20 backdrop-blur-sm border border-orange-400/30">
                  <Cpu className="w-4 h-4 lg:w-5 lg:h-5 text-orange-300" />
                </div>
                <span className="text-xs text-white/60">System</span>
              </div>
              <div className="space-y-1 lg:space-y-2">
                <div className="text-lg lg:text-2xl font-bold text-white">
                  {connectionStatus.connected ? 'Online' : 'Offline'}
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-1 lg:space-y-0 text-xs text-white/70">
                  <span>{urgentItems} urgent items</span>
                  <span>Real-time sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="p-3 lg:p-4 border-b border-white/20">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-white/70" />
                  <h2 className="text-base lg:text-lg font-semibold gradient-text">Recent Activity</h2>
                </div>
              </div>
              <div className="p-3 lg:p-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/60">No recent activity</p>
                    <p className="text-sm text-white/40">Activity will appear here as it happens</p>
                  </div>
                ) : (
                  <div className="space-y-2 lg:space-y-3">
                    {recentActivity.map((item, index) => (
                      <div key={`${item.type}-${index}`} className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                        <div className="p-1.5 lg:p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0">
                          {item.type === 'action' ? (
                            <Brain className="w-3 h-3 lg:w-4 lg:h-4 text-purple-300" />
                          ) : (
                            <Database className="w-3 h-3 lg:w-4 lg:h-4 text-blue-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs lg:text-sm font-medium text-white truncate">
                            {item.type === 'action' ? item.details?.title || 'AI Action' : item.title}
                          </p>
                          <p className="text-xs text-white/60 truncate">
                            {item.type === 'action' ? `From: ${item.originalMessage?.fromName}` : item.content?.substring(0, 30)}
                          </p>
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-2">
                          <span className={`px-1.5 lg:px-2 py-0.5 lg:py-1 text-xs rounded-md ${
                            item.type === 'action' 
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                          }`}>
                            {item.type}
                          </span>
                          <span className="text-xs text-white/50">
                            {new Date(item.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Insights */}
          <div>
            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
              <div className="p-3 lg:p-4 border-b border-white/20">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-white/70" />
                  <h2 className="text-base lg:text-lg font-semibold gradient-text">Quick Insights</h2>
                </div>
              </div>
              <div className="p-3 lg:p-4 space-y-3 lg:space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/70">Action Types</span>
                    <span className="text-sm font-medium text-white">{Object.values(actionTypeCounts).reduce((a, b) => a + b, 0)}</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(actionTypeCounts).slice(0, 4).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="text-white/60">{getActionIcon(type)}</div>
                          <span className="text-white/80 capitalize">{type}</span>
                        </div>
                        <span className="text-white/60">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-3 border-t border-white/20">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/70">Priority Distribution</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-red-300">Urgent</span>
                        <span className="text-white/60">{urgentActions + urgentItems}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-orange-300">High</span>
                        <span className="text-white/60">{highPriorityActions}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-300">Completed</span>
                        <span className="text-white/60">{completedToday}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Type Breakdown */}
        <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 mb-4 lg:mb-6">
          <div className="p-3 lg:p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 lg:w-5 lg:h-5 text-white/70" />
              <h2 className="text-base lg:text-lg font-semibold gradient-text">Action Type Breakdown</h2>
            </div>
          </div>
          <div className="p-3 lg:p-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 lg:gap-3">
              {Object.entries(actionTypeCounts).map(([type, count]) => (
                <div key={type} className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-2 p-2 lg:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300">
                  <div className="text-white/70 flex justify-center lg:justify-start">
                    {getActionIcon(type)}
                  </div>
                  <div className="min-w-0 text-center lg:text-left">
                    <p className="text-xs font-medium text-white capitalize truncate">{type}</p>
                    <p className="text-sm font-bold text-white">{count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20">
          <div className="p-3 lg:p-4 border-b border-white/20">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 lg:w-5 lg:h-5 text-white/70" />
              <h2 className="text-base lg:text-lg font-semibold gradient-text">Quick Actions</h2>
            </div>
          </div>
          <div className="p-3 lg:p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
              <button className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 text-center lg:text-left">
                <Calendar className="w-4 h-4 lg:w-5 lg:h-5 text-purple-300 mx-auto lg:mx-0" />
                <div>
                  <p className="text-xs lg:text-sm font-medium text-white">Schedule Event</p>
                  <p className="text-xs text-white/60 hidden lg:block">Create new event</p>
                </div>
              </button>
              <button className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 text-center lg:text-left">
                <CheckSquare className="w-4 h-4 lg:w-5 lg:h-5 text-blue-300 mx-auto lg:mx-0" />
                <div>
                  <p className="text-xs lg:text-sm font-medium text-white">Add Task</p>
                  <p className="text-xs text-white/60 hidden lg:block">Create new task</p>
                </div>
              </button>
              <button className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 text-center lg:text-left">
                <BookOpen className="w-4 h-4 lg:w-5 lg:h-5 text-green-300 mx-auto lg:mx-0" />
                <div>
                  <p className="text-xs lg:text-sm font-medium text-white">Take Note</p>
                  <p className="text-xs text-white/60 hidden lg:block">Save information</p>
                </div>
              </button>
              <button className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-3 p-2 lg:p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 text-center lg:text-left">
                <Search className="w-4 h-4 lg:w-5 lg:h-5 text-orange-300 mx-auto lg:mx-0" />
                <div>
                  <p className="text-xs lg:text-sm font-medium text-white">Search Items</p>
                  <p className="text-xs text-white/60 hidden lg:block">Find anything</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
