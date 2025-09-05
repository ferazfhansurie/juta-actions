import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckSquare, 
  BookOpen, 
  AlertTriangle, 
  Users, 
  DollarSign,
  Heart,
  ShoppingCart,
  Plane,
  Lightbulb,
  FileText,
  Activity,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Check,
  X,
  Archive,
  Edit,
  Trash2,
  Star,
  Eye,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface InternalItem {
  id: number;
  action_id?: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  item_type: string;
  created_at: string;
  updated_at: string;
  
  // Type-specific fields
  reminder_datetime?: string;
  event_datetime?: string;
  end_datetime?: string;
  due_datetime?: string;
  appointment_datetime?: string;
  departure_date?: string;
  return_date?: string;
  deadline?: string;
  location?: string;
  estimated_price?: number;
  amount?: number;
  currency?: string;
  is_pinned?: boolean;
  severity?: string;
  completion_percentage?: number;
}

interface ItemCounts {
  [key: string]: number;
}

const InternalItemsPage: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<InternalItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InternalItem[]>([]);
  const [counts, setCounts] = useState<ItemCounts>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  
  // Modal state
  const [selectedItem, setSelectedItem] = useState<InternalItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Table sorting
  const [sortField, setSortField] = useState<keyof InternalItem>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const itemTypes = [
    { key: 'reminder', label: 'Reminders', icon: Clock, color: 'text-blue-400' },
    { key: 'event', label: 'Events', icon: Calendar, color: 'text-green-400' },
    { key: 'task', label: 'Tasks', icon: CheckSquare, color: 'text-purple-400' },
    { key: 'note', label: 'Notes', icon: BookOpen, color: 'text-yellow-400' },
    { key: 'issue', label: 'Issues', icon: AlertTriangle, color: 'text-red-400' },
    { key: 'contact', label: 'Contacts', icon: Users, color: 'text-cyan-400' },
    { key: 'finance', label: 'Finance', icon: DollarSign, color: 'text-green-600' },
    { key: 'health', label: 'Health', icon: Heart, color: 'text-pink-400' },
    { key: 'shopping', label: 'Shopping', icon: ShoppingCart, color: 'text-orange-400' },
    { key: 'travel', label: 'Travel', icon: Plane, color: 'text-indigo-400' },
    { key: 'creative', label: 'Creative', icon: Lightbulb, color: 'text-amber-400' },
    { key: 'learning', label: 'Learning', icon: BookOpen, color: 'text-emerald-400' },
    { key: 'administrative', label: 'Admin', icon: FileText, color: 'text-slate-400' }
  ];

  const statusOptions = [
    'active', 'completed', 'cancelled', 'in_progress', 'snoozed', 'archived', 'resolved', 'closed'
  ];

  const priorityOptions = [
    { key: 'low', label: 'Low', color: 'text-green-400' },
    { key: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { key: 'high', label: 'High', color: 'text-orange-400' },
    { key: 'urgent', label: 'Urgent', color: 'text-red-400' }
  ];

  useEffect(() => {
    fetchAllItems();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [items, selectedType, selectedStatus, selectedPriority, searchTerm, sortField, sortDirection]);

  const fetchAllItems = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://c4ba947d9455f026.ngrok.app/api/internal-items/all/1`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setItems(data.items);
        setCounts(data.counts);
      } else {
        setError('Failed to fetch items');
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      setError('Failed to fetch items');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...items];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.item_type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === selectedStatus);
    }

    // Filter by priority
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === selectedPriority);
    }

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(search) ||
        item.content.toLowerCase().includes(search)
      );
    }

    // Sort the filtered items
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      return 0;
    });

    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  const handleSort = (field: keyof InternalItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const openModal = (item: InternalItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const updateItemStatus = async (item: InternalItem, newStatus: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://c4ba947d9455f026.ngrok.app/api/internal-items/status/${item.item_type}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, userId: 1 })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setItems(prevItems => 
          prevItems.map(i => 
            i.id === item.id && i.item_type === item.item_type 
              ? { ...i, status: newStatus } 
              : i
          )
        );
      } else {
        setError('Failed to update item status');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      setError('Failed to update item status');
    }
  };

  const getItemIcon = (type: string) => {
    const itemType = itemTypes.find(t => t.key === type);
    const Icon = itemType?.icon || Activity;
    return <Icon className={`w-5 h-5 ${itemType?.color || 'text-white'}`} />;
  };

  const getPriorityColor = (priority: string) => {
    const priorityOption = priorityOptions.find(p => p.key === priority);
    return priorityOption?.color || 'text-white';
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return null;
    }
  };

  const getRelevantDate = (item: InternalItem) => {
    const dateFields = [
      'reminder_datetime',
      'event_datetime', 
      'due_datetime',
      'appointment_datetime',
      'departure_date',
      'deadline'
    ];

    for (const field of dateFields) {
      if (item[field as keyof InternalItem]) {
        return formatDate(item[field as keyof InternalItem] as string);
      }
    }
    
    return formatDate(item.created_at);
  };


  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredItems.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5" />
          <div className="relative">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white"></div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Loading items</h3>
            <p className="text-white/70">Fetching your internal items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Ultra Compact Header & Controls */}
        <div className="flex items-center justify-between mb-3 lg:mb-4">
        
          
          {/* Compact Stats Pills */}
          <div className="flex items-center space-x-1 lg:space-x-2 overflow-x-auto pb-2">
            {itemTypes.slice(0, itemTypes.length).map(type => (
              <button
                key={type.key}
                onClick={() => setSelectedType(selectedType === type.key ? 'all' : type.key)}
                className={`flex items-center space-x-1 px-1.5 lg:px-2 py-1 rounded-lg text-xs font-medium transition-all duration-300 whitespace-nowrap ${
                  selectedType === type.key 
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' 
                    : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <type.icon className={`w-3 h-3 ${type.color}`} />
                <span>{counts[type.key] || 0}</span>
              </button>
            ))}
         
          </div>
        </div>

        {/* Compact Filters */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center space-y-2 lg:space-y-0 lg:space-x-3 mb-3 lg:mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-4 h-4" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/50 focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-300 text-sm"
            />
          </div>
          
          <div className="flex space-x-2 lg:space-x-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="flex-1 lg:flex-none px-2 lg:px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm min-w-[80px] lg:min-w-[100px]"
            >
              <option value="all" className="text-black">All Status</option>
              {statusOptions.map(status => (
                <option key={status} value={status} className="text-black">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
            
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="flex-1 lg:flex-none px-2 lg:px-3 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white focus:bg-white/15 focus:border-white/30 focus:outline-none transition-all duration-300 appearance-none cursor-pointer text-sm min-w-[80px] lg:min-w-[100px]"
            >
              <option value="all" className="text-black">All Priorities</option>
              {priorityOptions.map(priority => (
                <option key={priority.key} value={priority.key} className="text-black">
                  {priority.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Items Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3 lg:mb-4 space-y-1 lg:space-y-0">
          <h2 className="text-base lg:text-lg font-bold text-white">
            {selectedType === 'all' ? 'All Items' : itemTypes.find(t => t.key === selectedType)?.label + ' Items'}
          </h2>
          <div className="text-xs lg:text-sm text-white/60">
            Showing {currentItems.length} of {filteredItems.length} items
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="relative overflow-hidden rounded-2xl bg-red-500/10 backdrop-blur-xl border border-red-500/20 p-6 mb-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Items Table - Desktop */}
        <div className="hidden lg:block relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Item</span>
                    {sortField === 'title' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('item_type')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Type</span>
                    {sortField === 'item_type' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('priority')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Priority</span>
                    {sortField === 'priority' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Status</span>
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center space-x-2">
                    <span>Date</span>
                    {sortField === 'created_at' && (
                      sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white/80 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {currentItems.map((item) => {
                const relevantDate = getRelevantDate(item);
                return (
                  <tr 
                    key={`${item.item_type}-${item.id}`}
                    className="hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0">
                          {getItemIcon(item.item_type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-white truncate max-w-xs">
                            {item.title}
                          </div>
                          <div className="text-xs text-white/60 truncate max-w-xs">
                            {item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-md bg-white/20 text-white border border-white/30">
                        {item.item_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getPriorityColor(item.priority)} bg-white/10`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                        item.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                        item.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                        'bg-white/10 text-white/70 border border-white/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/80">
                        {relevantDate}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openModal(item)}
                          className="p-2 rounded-lg text-blue-400 hover:bg-blue-400/20 hover:scale-110 transition-all duration-200 shadow-lg"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.status === 'active' && (
                          <button
                            onClick={() => updateItemStatus(item, 'completed')}
                            className="p-2 rounded-lg text-green-400 hover:bg-green-400/20 hover:scale-110 transition-all duration-200 shadow-lg"
                            title="Mark as completed"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'active' && (
                          <button
                            onClick={() => updateItemStatus(item, 'cancelled')}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-400/20 hover:scale-110 transition-all duration-200 shadow-lg"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        {item.status === 'completed' && (
                          <button
                            onClick={() => updateItemStatus(item, 'active')}
                            className="p-2 rounded-lg text-blue-400 hover:bg-blue-400/20 hover:scale-110 transition-all duration-200 shadow-lg"
                            title="Reactivate"
                          >
                            <Activity className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="lg:hidden space-y-3">
          {currentItems.map((item) => {
            const relevantDate = getRelevantDate(item);
            return (
              <div 
                key={`${item.item_type}-${item.id}`}
                className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300"
              >
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0">
                        {getItemIcon(item.item_type)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-medium text-white truncate">
                          {item.title}
                        </h3>
                        <p className="text-xs text-white/60 truncate">
                          {item.content.length > 60 ? `${item.content.substring(0, 60)}...` : item.content}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => openModal(item)}
                      className="p-2 rounded-lg text-blue-400 hover:bg-blue-400/20 transition-all duration-200 flex-shrink-0"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="px-2 py-1 text-xs font-semibold rounded-md bg-white/20 text-white border border-white/30">
                      {item.item_type}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getPriorityColor(item.priority)} bg-white/10`}>
                      {item.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                      item.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                      item.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                      'bg-white/10 text-white/70 border border-white/20'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Date and Actions */}
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/80">
                      {relevantDate}
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.status === 'active' && (
                        <button
                          onClick={() => updateItemStatus(item, 'completed')}
                          className="p-1.5 rounded-lg text-green-400 hover:bg-green-400/20 transition-all duration-200"
                          title="Mark as completed"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                      {item.status === 'active' && (
                        <button
                          onClick={() => updateItemStatus(item, 'cancelled')}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-400/20 transition-all duration-200"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      {item.status === 'completed' && (
                        <button
                          onClick={() => updateItemStatus(item, 'active')}
                          className="p-1.5 rounded-lg text-blue-400 hover:bg-blue-400/20 transition-all duration-200"
                          title="Reactivate"
                        >
                          <Activity className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {currentItems.length === 0 && !loading && (
          <div className="relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <Activity className="w-6 h-6 text-white/40" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No items found</h3>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              {filteredItems.length === 0 && items.length > 0
                ? "Try adjusting your filters to see more results"
                : "Items will appear here when detected from your WhatsApp messages"
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col lg:flex-row justify-center items-center space-y-3 lg:space-y-0 lg:space-x-4 mt-6 lg:mt-8">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 hover:border-white/30 transition-all duration-300 text-sm font-medium"
            >
              Previous
            </button>
            
            <div className="flex flex-col lg:flex-row lg:items-center space-y-1 lg:space-y-0 lg:space-x-2 text-sm text-center lg:text-left">
              <span className="text-white/80 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <div className="hidden lg:block w-1 h-1 rounded-full bg-white/30" />
              <span className="text-white/60">
                {filteredItems.length} items
              </span>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/15 hover:border-white/30 transition-all duration-300 text-sm font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 lg:p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          
          {/* Modal Content */}
          <div className="relative w-full max-w-2xl max-h-[95vh] lg:max-h-[90vh] overflow-y-auto">
            <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
              {/* Modal Header */}
              <div className="px-4 lg:px-6 py-3 lg:py-4 border-b border-white/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 min-w-0 flex-1">
                    <div className="p-2 lg:p-2.5 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 flex-shrink-0">
                      {getItemIcon(selectedItem.item_type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg lg:text-xl font-bold text-white truncate">{selectedItem.title}</h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="px-2 py-1 text-xs font-semibold rounded-md bg-white/20 text-white border border-white/30">
                          {selectedItem.item_type}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getPriorityColor(selectedItem.priority)} bg-white/10`}>
                          {selectedItem.priority}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md ${
                          selectedItem.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                          selectedItem.status === 'completed' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                          'bg-white/10 text-white/70 border border-white/20'
                        }`}>
                          {selectedItem.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-4 lg:px-6 py-4 lg:py-6">
                <div className="space-y-4 lg:space-y-6">
                  {/* Content */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/80 mb-2">Description</h3>
                    <p className="text-white/90 leading-relaxed">{selectedItem.content}</p>
                  </div>

                  {/* Dates */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/80 mb-2 lg:mb-3">Timeline</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-white/60" />
                          <span className="text-white/70">Created:</span>
                          <span className="text-white">{formatDate(selectedItem.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Activity className="w-4 h-4 text-white/60" />
                          <span className="text-white/70">Updated:</span>
                          <span className="text-white">{formatDate(selectedItem.updated_at)}</span>
                        </div>
                      </div>
                      
                      {/* Type-specific dates */}
                      {selectedItem.reminder_datetime && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Clock className="w-4 h-4 text-blue-400" />
                          <span className="text-white/70">Reminder:</span>
                          <span className="text-white">{formatDate(selectedItem.reminder_datetime)}</span>
                        </div>
                      )}
                      {selectedItem.event_datetime && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Calendar className="w-4 h-4 text-green-400" />
                          <span className="text-white/70">Event:</span>
                          <span className="text-white">{formatDate(selectedItem.event_datetime)}</span>
                        </div>
                      )}
                      {selectedItem.due_datetime && (
                        <div className="flex items-center space-x-2 text-sm">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-white/70">Due:</span>
                          <span className="text-white">{formatDate(selectedItem.due_datetime)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Type-specific information */}
                  {(selectedItem.amount || selectedItem.estimated_price || selectedItem.location || selectedItem.completion_percentage !== undefined) && (
                    <div>
                      <h3 className="text-sm font-semibold text-white/80 mb-2 lg:mb-3">Additional Details</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 lg:gap-4">
                        {selectedItem.amount && (
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="w-4 h-4 text-green-400" />
                            <span className="text-white/70">Amount:</span>
                            <span className="text-white font-semibold">
                              {selectedItem.currency || 'USD'} {selectedItem.amount}
                            </span>
                          </div>
                        )}
                        {selectedItem.estimated_price && (
                          <div className="flex items-center space-x-2 text-sm">
                            <DollarSign className="w-4 h-4 text-orange-400" />
                            <span className="text-white/70">Estimated Price:</span>
                            <span className="text-white font-semibold">${selectedItem.estimated_price}</span>
                          </div>
                        )}
                        {selectedItem.location && (
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="w-4 h-4 text-blue-400" />
                            <span className="text-white/70">Location:</span>
                            <span className="text-white">{selectedItem.location}</span>
                          </div>
                        )}
                        {selectedItem.completion_percentage !== undefined && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Activity className="w-4 h-4 text-purple-400" />
                            <span className="text-white/70">Progress:</span>
                            <span className="text-white font-semibold">{selectedItem.completion_percentage}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action ID */}
                  {selectedItem.action_id && (
                    <div>
                      <h3 className="text-sm font-semibold text-white/80 mb-2">Action ID</h3>
                      <p className="text-white/70 font-mono text-sm">{selectedItem.action_id}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-white/20">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-end space-y-2 lg:space-y-0 lg:space-x-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300 text-sm font-medium"
                  >
                    Close
                  </button>
                  {selectedItem.status === 'active' && (
                    <button
                      onClick={() => {
                        updateItemStatus(selectedItem, 'completed');
                        closeModal();
                      }}
                      className="px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg text-green-300 hover:bg-green-500/30 hover:border-green-400/50 transition-all duration-300 text-sm font-medium"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternalItemsPage;
