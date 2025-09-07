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
  MapPin,
  User,
  ShoppingBag
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
  
  // Additional missing fields
  repeat_type?: string;
  attendees?: any[];
  estimated_hours?: number;
  assigned_to?: string;
  doctor_name?: string;
  due_date?: string;
  destination?: string;
  quantity?: number;
  estimated_duration?: number;
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
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
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
    'active', 'completed', 'cancelled', 'in_progress', 'snoozed', 'archived', 'resolved', 'closed', 'deleted'
  ];

  // Get valid statuses for each item type
  const getValidStatusesForType = (itemType: string): string[] => {
    const validStatuses: Record<string, string[]> = {
      reminder: ['active', 'completed', 'cancelled', 'snoozed'],
      event: ['active', 'completed', 'cancelled', 'attended'],
      task: ['active', 'completed', 'cancelled', 'in_progress'],
      note: ['active', 'archived', 'deleted'],
      contact: ['active', 'completed', 'cancelled'],
      issue: ['active', 'resolved', 'closed', 'in_progress'],
      learning: ['active', 'completed', 'cancelled', 'in_progress'],
      finance: ['active', 'completed', 'cancelled'],
      health: ['active', 'completed', 'cancelled'],
      shopping: ['active', 'completed', 'cancelled'],
      travel: ['active', 'completed', 'cancelled'],
      creative: ['active', 'completed', 'cancelled', 'in_progress'],
      administrative: ['active', 'completed', 'cancelled']
    };

    return validStatuses[itemType] || ['active', 'completed', 'cancelled'];
  };

  // Map generic status to item-type specific status (for backwards compatibility)
  const getValidStatusForType = (itemType: string, genericStatus: string): string => {
    const validStatuses = getValidStatusesForType(itemType);
    
    // If the generic status is already valid for this type, use it
    if (validStatuses.includes(genericStatus)) {
      return genericStatus;
    }

    // Otherwise, map common generic statuses to type-specific ones
    const statusMappings: Record<string, Record<string, string>> = {
      note: {
        'completed': 'archived',
        'cancelled': 'deleted'
      },
      issue: {
        'completed': 'resolved',
        'cancelled': 'closed'
      }
    };

    const mapped = statusMappings[itemType]?.[genericStatus];
    return mapped && validStatuses.includes(mapped) ? mapped : genericStatus;
  };

  const priorityOptions = [
    { key: 'low', label: 'Low', color: 'text-green-400' },
    { key: 'medium', label: 'Medium', color: 'text-yellow-400' },
    { key: 'high', label: 'High', color: 'text-orange-400' },
    { key: 'urgent', label: 'Urgent', color: 'text-red-400' }
  ];

  useEffect(() => {
    if (user?.id) {
      fetchAllItems();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [items, selectedType, selectedStatus, selectedPriority, searchTerm, sortField, sortDirection]);

  const fetchAllItems = async () => {
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://c4ba947d9455f026.ngrok.app/api/internal-items/all/${user.id}`, {
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
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }
    
    // Convert generic status to item-type specific status
    const validStatus = getValidStatusForType(item.item_type, newStatus);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://c4ba947d9455f026.ngrok.app/api/internal-items/status/${item.item_type}/${item.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: validStatus, userId: user.id })
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state with the valid status
        setItems(prevItems => 
          prevItems.map(i => 
            i.id === item.id && i.item_type === item.item_type 
              ? { ...i, status: validStatus } 
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

  const deleteItemPermanently = async (item: InternalItem) => {
    if (!user?.id) {
      console.error('User ID not available');
      return;
    }
    
    const confirmDelete = window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.');
    
    if (!confirmDelete) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`https://c4ba947d9455f026.ngrok.app/api/internal-items/${item.item_type}/${item.id}?userId=${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove item from local state
        setItems(prevItems => 
          prevItems.filter(i => 
            !(i.id === item.id && i.item_type === item.item_type)
          )
        );
        closeModal();
      } else {
        setError('Failed to delete item permanently');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      setError('Failed to delete item permanently');
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

  // Get additional relevant details for each item type
  const getItemDetails = (item: InternalItem): string[] => {
    const details: string[] = [];

    switch (item.item_type) {
      case 'reminder':
        if (item.reminder_datetime) {
          details.push(`⏰ ${formatDate(item.reminder_datetime)}`);
        }
        if (item.repeat_type && item.repeat_type !== 'none') {
          details.push(`🔄 ${item.repeat_type}`);
        }
        break;

      case 'event':
        if (item.event_datetime) {
          details.push(`📅 ${formatDate(item.event_datetime)}`);
        }
        if (item.location) {
          details.push(`📍 ${item.location}`);
        }
        if (item.attendees && Array.isArray(item.attendees) && item.attendees.length > 0) {
          details.push(`👥 ${item.attendees.length} attendees`);
        }
        break;

      case 'task':
        if (item.due_datetime) {
          details.push(`📋 Due: ${formatDate(item.due_datetime)}`);
        }
        if (item.estimated_hours) {
          details.push(`⏱️ ${item.estimated_hours}h est.`);
        }
        break;

      case 'issue':
        if (item.severity) {
          details.push(`🔥 ${item.severity}`);
        }
        if (item.assigned_to) {
          details.push(`👤 ${item.assigned_to}`);
        }
        break;

      case 'health':
        if (item.appointment_datetime) {
          details.push(`🏥 ${formatDate(item.appointment_datetime)}`);
        }
        if (item.doctor_name) {
          details.push(`👨‍⚕️ Dr. ${item.doctor_name}`);
        }
        break;

      case 'finance':
        if (item.amount) {
          details.push(`💰 ${item.currency || 'USD'} ${item.amount}`);
        }
        if (item.due_date) {
          details.push(`📅 Due: ${formatDate(item.due_date)}`);
        }
        break;

      case 'travel':
        if (item.departure_date) {
          details.push(`✈️ ${formatDate(item.departure_date)}`);
        }
        if (item.destination) {
          details.push(`🎯 ${item.destination}`);
        }
        break;

      case 'shopping':
        if (item.quantity) {
          details.push(`📦 Qty: ${item.quantity}`);
        }
        if (item.estimated_price) {
          details.push(`💵 ~$${item.estimated_price}`);
        }
        break;

      case 'learning':
        if (item.estimated_duration) {
          details.push(`📚 ${item.estimated_duration} min`);
        }
        if (item.completion_percentage) {
          details.push(`📊 ${item.completion_percentage}%`);
        }
        break;

      default:
        break;
    }

    return details;
  };

  // Get comprehensive modal details for each item type
  const getModalDetails = (item: InternalItem) => {
    const sections: Array<{title: string, items: Array<{icon: any, label: string, value: string, color?: string}>}> = [];

    switch (item.item_type) {
      case 'reminder':
        sections.push({
          title: 'Reminder Details',
          items: [
            ...(item.reminder_datetime ? [{icon: Clock, label: 'Reminder Time', value: formatDate(item.reminder_datetime) || '', color: 'text-blue-400'}] : []),
            ...(item.repeat_type && item.repeat_type !== 'none' ? [{icon: Activity, label: 'Repeat', value: item.repeat_type, color: 'text-green-400'}] : [])
          ]
        });
        break;

      case 'event':
        sections.push({
          title: 'Event Details',
          items: [
            ...(item.event_datetime ? [{icon: Calendar, label: 'Event Date', value: formatDate(item.event_datetime) || '', color: 'text-green-400'}] : []),
            ...(item.end_datetime ? [{icon: Clock, label: 'End Time', value: formatDate(item.end_datetime) || '', color: 'text-orange-400'}] : []),
            ...(item.location ? [{icon: MapPin, label: 'Location', value: item.location, color: 'text-blue-400'}] : []),
            ...(item.attendees && Array.isArray(item.attendees) && item.attendees.length > 0 ? [{icon: User, label: 'Attendees', value: `${item.attendees.length} people`, color: 'text-purple-400'}] : [])
          ]
        });
        break;

      case 'task':
        sections.push({
          title: 'Task Details',
          items: [
            ...(item.due_datetime ? [{icon: AlertTriangle, label: 'Due Date', value: formatDate(item.due_datetime) || '', color: 'text-red-400'}] : []),
            ...(item.estimated_hours ? [{icon: Clock, label: 'Estimated Time', value: `${item.estimated_hours} hours`, color: 'text-yellow-400'}] : [])
          ]
        });
        break;

      case 'issue':
        sections.push({
          title: 'Issue Details',
          items: [
            ...(item.severity ? [{icon: AlertTriangle, label: 'Severity', value: item.severity, color: item.severity === 'critical' ? 'text-red-400' : item.severity === 'major' ? 'text-orange-400' : 'text-yellow-400'}] : []),
            ...(item.assigned_to ? [{icon: User, label: 'Assigned To', value: item.assigned_to, color: 'text-blue-400'}] : [])
          ]
        });
        break;

      case 'health':
        sections.push({
          title: 'Health Details',
          items: [
            ...(item.appointment_datetime ? [{icon: Calendar, label: 'Appointment', value: formatDate(item.appointment_datetime) || '', color: 'text-green-400'}] : []),
            ...(item.doctor_name ? [{icon: User, label: 'Doctor', value: `Dr. ${item.doctor_name}`, color: 'text-blue-400'}] : [])
          ]
        });
        break;

      case 'finance':
        sections.push({
          title: 'Financial Details',
          items: [
            ...(item.amount ? [{icon: DollarSign, label: 'Amount', value: `${item.currency || 'USD'} ${item.amount}`, color: 'text-green-400'}] : []),
            ...(item.due_date ? [{icon: Clock, label: 'Due Date', value: formatDate(item.due_date) || '', color: 'text-red-400'}] : [])
          ]
        });
        break;

      case 'travel':
        sections.push({
          title: 'Travel Details',
          items: [
            ...(item.departure_date ? [{icon: Plane, label: 'Departure', value: formatDate(item.departure_date) || '', color: 'text-blue-400'}] : []),
            ...(item.return_date ? [{icon: Plane, label: 'Return', value: formatDate(item.return_date) || '', color: 'text-green-400'}] : []),
            ...(item.destination ? [{icon: MapPin, label: 'Destination', value: item.destination, color: 'text-purple-400'}] : [])
          ]
        });
        break;

      case 'shopping':
        sections.push({
          title: 'Shopping Details',
          items: [
            ...(item.quantity ? [{icon: ShoppingBag, label: 'Quantity', value: item.quantity.toString(), color: 'text-blue-400'}] : []),
            ...(item.estimated_price ? [{icon: DollarSign, label: 'Est. Price', value: `$${item.estimated_price}`, color: 'text-green-400'}] : [])
          ]
        });
        break;

      case 'learning':
        sections.push({
          title: 'Learning Details',
          items: [
            ...(item.estimated_duration ? [{icon: Clock, label: 'Duration', value: `${item.estimated_duration} minutes`, color: 'text-blue-400'}] : []),
            ...(item.completion_percentage !== undefined ? [{icon: Activity, label: 'Progress', value: `${item.completion_percentage}%`, color: 'text-green-400'}] : [])
          ]
        });
        break;

      default:
        break;
    }

    return sections.filter(section => section.items.length > 0);
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
                          <div className="text-xs text-white/60 truncate max-w-xs mb-1">
                            {item.content.length > 50 ? `${item.content.substring(0, 50)}...` : item.content}
                          </div>
                          {getItemDetails(item).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {getItemDetails(item).slice(0, 2).map((detail, index) => (
                                <span key={index} className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded">
                                  {detail}
                                </span>
                              ))}
                            </div>
                          )}
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
                        item.status === 'completed' || item.status === 'resolved' || item.status === 'archived' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                        item.status === 'cancelled' || item.status === 'closed' || item.status === 'deleted' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                        item.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                        item.status === 'snoozed' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
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
                        <div className="relative">
                          <select
                            value={item.status}
                            onChange={(e) => updateItemStatus(item, e.target.value)}
                            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-1.5 text-sm text-white focus:bg-white/20 focus:border-white/40 focus:outline-none min-w-[100px]"
                            title="Change status"
                          >
                            {getValidStatusesForType(item.item_type).map((status) => (
                              <option key={status} value={status} className="bg-gray-800 text-white">
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
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
                        <p className="text-xs text-white/60 truncate mb-2">
                          {item.content.length > 60 ? `${item.content.substring(0, 60)}...` : item.content}
                        </p>
                        {getItemDetails(item).length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {getItemDetails(item).slice(0, 2).map((detail, index) => (
                              <span key={index} className="text-xs bg-white/10 text-white/80 px-2 py-0.5 rounded">
                                {detail}
                              </span>
                            ))}
                          </div>
                        )}
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
                      item.status === 'completed' || item.status === 'resolved' || item.status === 'archived' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                      item.status === 'cancelled' || item.status === 'closed' || item.status === 'deleted' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                      item.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                      item.status === 'snoozed' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
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
                      <select
                        value={item.status}
                        onChange={(e) => updateItemStatus(item, e.target.value)}
                        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded text-xs text-white focus:bg-white/20 focus:border-white/40 focus:outline-none px-2 py-1"
                        title="Change status"
                      >
                        {getValidStatusesForType(item.item_type).map((status) => (
                          <option key={status} value={status} className="bg-gray-800 text-white">
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
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
                          selectedItem.status === 'completed' || selectedItem.status === 'resolved' || selectedItem.status === 'archived' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                          selectedItem.status === 'cancelled' || selectedItem.status === 'closed' || selectedItem.status === 'deleted' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                          selectedItem.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                          selectedItem.status === 'snoozed' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
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
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                      <p className="text-white/90 leading-relaxed">{selectedItem.content}</p>
                    </div>
                  </div>

                  {/* Status Selector */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/80 mb-2">Status</h3>
                    <select
                      value={selectedItem.status}
                      onChange={(e) => updateItemStatus(selectedItem, e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white focus:bg-white/20 focus:border-white/40 focus:outline-none"
                    >
                      {getValidStatusesForType(selectedItem.item_type).map((status) => (
                        <option key={status} value={status} className="bg-gray-800 text-white">
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Type-Specific Details */}
                  {getModalDetails(selectedItem).map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h3 className="text-sm font-semibold text-white/80 mb-3">{section.title}</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {section.items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          return (
                            <div key={itemIndex} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                              <Icon className={`w-4 h-4 ${item.color || 'text-white/60'} flex-shrink-0`} />
                              <div className="min-w-0 flex-1">
                                <span className="text-white/70 text-sm">{item.label}:</span>
                                <span className="text-white font-medium ml-2">{item.value}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {/* Timeline */}
                  <div>
                    <h3 className="text-sm font-semibold text-white/80 mb-3">Timeline</h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                        <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        <div>
                          <span className="text-white/70 text-sm">Created:</span>
                          <span className="text-white font-medium ml-2">{formatDate(selectedItem.created_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/10">
                        <Activity className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <div>
                          <span className="text-white/70 text-sm">Updated:</span>
                          <span className="text-white font-medium ml-2">{formatDate(selectedItem.updated_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action ID */}
                  {selectedItem.action_id && (
                    <div>
                      <h3 className="text-sm font-semibold text-white/80 mb-2">Action ID</h3>
                      <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-white/70 font-mono text-sm">{selectedItem.action_id}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-4 lg:px-6 py-3 lg:py-4 border-t border-white/20">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between space-y-2 lg:space-y-0">
                  {/* Left side - Destructive actions */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteItemPermanently(selectedItem)}
                      className="px-4 py-2 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg text-red-300 hover:bg-red-500/30 hover:border-red-400/50 transition-all duration-300 text-sm font-medium flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Permanently</span>
                    </button>
                  </div>

                  {/* Right side - Primary actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white hover:bg-white/15 hover:border-white/30 transition-all duration-300 text-sm font-medium"
                    >
                      Close
                    </button>
                  </div>
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
