import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';

interface ConnectionStatus {
  connected: boolean;
  qrCode: string | null;
  pairingCode: string | null;
  status: string;
  message: string;
}

interface DetectedAction {
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
}

export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    qrCode: null,
    pairingCode: null,
    status: 'disconnected',
    message: 'Not connected'
  });
  const [pendingActions, setPendingActions] = useState<DetectedAction[]>([]);

  // Fetch connection status
  const fetchStatus = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://c4ba947d9455f026.ngrok.app/api/status', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const status = await response.json();
      setConnectionStatus(status);
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  }, [user]);

  // Fetch pending actions
  const fetchActions = useCallback(async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://c4ba947d9455f026.ngrok.app/api/actions', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      
      if (data.success) {
        const formattedActions = data.actions.map((action: any) => ({
          actionId: action.action_id,
          type: action.type,
          description: action.description,
          details: typeof action.details === 'string' 
            ? JSON.parse(action.details) 
            : action.details || {
                title: action.description,
                content: `${action.type} action`,
                priority: 'medium',
                category: action.type
              },
          confidence: 0.8,
          originalMessage: typeof action.original_message === 'string'
            ? JSON.parse(action.original_message)
            : action.original_message
        }));
        setPendingActions(formattedActions);
      }
    } catch (error) {
      console.error('Error fetching actions:', error);
    }
  }, [user]);

  // Setup socket connection
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const newSocket = io('https://c4ba947d9455f026.ngrok.app', {
      auth: {
        token: token
      }
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('status', (status) => {
      setConnectionStatus(prev => ({ ...prev, ...status }));
    });

    newSocket.on('qrCode', (qrCode) => {
      setConnectionStatus(prev => ({ ...prev, qrCode }));
    });

    newSocket.on('pairingCode', (pairingCode) => {
      setConnectionStatus(prev => ({ ...prev, pairingCode }));
    });

    newSocket.on('connected', () => {
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: true, 
        qrCode: null, 
        pairingCode: null,
        status: 'ready',
        message: 'WhatsApp connected successfully!'
      }));
    });

    newSocket.on('disconnected', () => {
      setConnectionStatus(prev => ({ 
        ...prev, 
        connected: false, 
        qrCode: null, 
        pairingCode: null,
        status: 'disconnected',
        message: 'Disconnected from WhatsApp'
      }));
    });

    newSocket.on('newAction', (action) => {
      setPendingActions(prev => [action, ...prev]);
    });

    newSocket.on('actionProcessed', ({ actionId }) => {
      setPendingActions(prev => prev.filter(action => action.actionId !== actionId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  useEffect(() => {
    // Initial fetch
    fetchStatus();
    fetchActions();

    // Poll for updates every 5 seconds (less frequent since we have socket)
    const statusInterval = setInterval(fetchStatus, 5000);
    const actionsInterval = setInterval(fetchActions, 5000);

    return () => {
      clearInterval(statusInterval);
      clearInterval(actionsInterval);
    };
  }, [fetchStatus, fetchActions]);

  const requestPairingCode = async (phoneNumber?: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('https://c4ba947d9455f026.ngrok.app/api/pairing-code', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        // The pairing code will be updated via socket connection
        console.log('Pairing code requested successfully');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request pairing code');
      }
    } catch (error) {
      console.error('Error requesting pairing code:', error);
      throw error;
    }
  };

  const respondToAction = async (actionId: string, approved: boolean, response?: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const endpoint = approved 
        ? `https://c4ba947d9455f026.ngrok.app/api/actions/${actionId}/approve`
        : `https://c4ba947d9455f026.ngrok.app/api/actions/${actionId}/reject`;
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ response }),
      });

      // Remove the action from pending list
      setPendingActions(prev => prev.filter(action => action.actionId !== actionId));
      
    } catch (error) {
      console.error('Error responding to action:', error);
    }
  };

  return {
    socket,
    connectionStatus,
    pendingActions,
    requestPairingCode,
    respondToAction
  };
};