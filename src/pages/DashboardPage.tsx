import React from 'react';
import { useSocket } from '../hooks/useSocket';
import Dashboard from '../components/Dashboard';

const DashboardPage: React.FC = () => {
  const { connectionStatus, pendingActions } = useSocket();

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <Dashboard 
          pendingActions={pendingActions} 
          connectionStatus={connectionStatus} 
        />
      </div>
    </div>
  );
};

export default DashboardPage;
