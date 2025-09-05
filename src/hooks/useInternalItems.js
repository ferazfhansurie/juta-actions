import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = 'https://c4ba947d9455f026.ngrok.app/api';

export const useInternalItems = (type, options = {}) => {
  const { user, getAuthHeaders } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const { 
    status,
    limit = 50,
    offset = 0,
    autoFetch = true 
  } = options;

  // Fetch items
  const fetchItems = useCallback(async () => {
    if (!user || !type) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      params.append('limit', limit.toString());
      params.append('offset', offset.toString());

      const url = `${API_BASE}/internal/${type}?${params.toString()}`;
      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} items: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setItems(data.items || []);
        setTotalCount(data.count || 0);
      } else {
        throw new Error(data.error || 'Failed to fetch items');
      }
    } catch (err) {
      console.error(`Error fetching ${type} items:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [type, status, limit, offset, user, getAuthHeaders]);

  // Create item
  const createItem = useCallback(async (itemData) => {
    if (!user || !type) return null;

    try {
      const response = await fetch(`${API_BASE}/internal/${type}`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh the list
        await fetchItems();
        return data.item;
      } else {
        throw new Error(data.error || 'Failed to create item');
      }
    } catch (err) {
      console.error(`Error creating ${type} item:`, err);
      setError(err.message);
      throw err;
    }
  }, [type, user, getAuthHeaders, fetchItems]);

  // Update item
  const updateItem = useCallback(async (itemId, updates) => {
    if (!user || !type) return null;

    try {
      const response = await fetch(`${API_BASE}/internal/${type}/${itemId}`, {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (data.success) {
        // Update the local state
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? data.item : item
          )
        );
        return data.item;
      } else {
        throw new Error(data.error || 'Failed to update item');
      }
    } catch (err) {
      console.error(`Error updating ${type} item:`, err);
      setError(err.message);
      throw err;
    }
  }, [type, user, getAuthHeaders]);

  // Delete item
  const deleteItem = useCallback(async (itemId) => {
    if (!user || !type) return false;

    try {
      const response = await fetch(`${API_BASE}/internal/${type}/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (data.success) {
        // Remove from local state
        setItems(prevItems => prevItems.filter(item => item.id !== itemId));
        setTotalCount(prev => prev - 1);
        return true;
      } else {
        throw new Error(data.error || 'Failed to delete item');
      }
    } catch (err) {
      console.error(`Error deleting ${type} item:`, err);
      setError(err.message);
      throw err;
    }
  }, [type, user, getAuthHeaders]);

  // Update item status
  const updateStatus = useCallback(async (itemId, newStatus) => {
    if (!user || !type) return null;

    try {
      const response = await fetch(`${API_BASE}/internal/${type}/${itemId}/status`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();
      if (data.success) {
        // Update the local state
        setItems(prevItems =>
          prevItems.map(item =>
            item.id === itemId ? data.item : item
          )
        );
        return data.item;
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (err) {
      console.error(`Error updating ${type} item status:`, err);
      setError(err.message);
      throw err;
    }
  }, [type, user, getAuthHeaders]);

  // Auto-fetch on mount and dependencies change
  useEffect(() => {
    if (autoFetch) {
      fetchItems();
    }
  }, [fetchItems, autoFetch]);

  return {
    items,
    loading,
    error,
    totalCount,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    updateStatus,
    refresh: fetchItems,
  };
};

// Hook for dashboard data
export const useDashboard = () => {
  const { user, getAuthHeaders } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/dashboard`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};

// Hook for search functionality
export const useInternalItemsSearch = () => {
  const { user, getAuthHeaders } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (searchTerm, options = {}) => {
    if (!user || !searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('q', searchTerm);
      
      if (options.types && options.types.length > 0) {
        params.append('types', options.types.join(','));
      }
      if (options.status) {
        params.append('status', options.status);
      }
      if (options.limit) {
        params.append('limit', options.limit.toString());
      }

      const response = await fetch(`${API_BASE}/internal/search?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      const data = await response.json();
      if (data.success) {
        setResults(data.results || []);
      } else {
        throw new Error(data.error || 'Search failed');
      }
    } catch (err) {
      console.error('Error searching items:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [user, getAuthHeaders]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
};

// Hook for specific item types
export const useReminders = (options) => useInternalItems('reminder', options);
export const useEvents = (options) => useInternalItems('event', options);
export const useTasks = (options) => useInternalItems('task', options);
export const useNotes = (options) => useInternalItems('note', options);
export const useContacts = (options) => useInternalItems('contact', options);
export const useIssues = (options) => useInternalItems('issue', options);
export const useLearningItems = (options) => useInternalItems('learning', options);
export const useFinanceItems = (options) => useInternalItems('finance', options);
export const useHealthItems = (options) => useInternalItems('health', options);
export const useShoppingItems = (options) => useInternalItems('shopping', options);
export const useTravelItems = (options) => useInternalItems('travel', options);
export const useCreativeItems = (options) => useInternalItems('creative', options);
export const useAdminItems = (options) => useInternalItems('administrative', options);

// Utility functions
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'in_progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'snoozed':
      return 'bg-purple-100 text-purple-800';
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'archived':
      return 'bg-gray-100 text-gray-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getPriorityColor = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'No date set';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === -1) {
    return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (Math.abs(diffDays) < 7) {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};