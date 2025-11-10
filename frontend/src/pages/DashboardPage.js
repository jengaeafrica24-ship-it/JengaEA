import React from 'react';
import DashboardFeatures from '../components/dashboard/DashboardFeatures';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden bg-[#1a1f2b] text-white p-12 mb-8">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">Welcome, {user?.name || 'User'}</h1>
          <p className="text-xl text-gray-300">
            Your partner in accurate construction cost estimation in Kenya.
          </p>
        </div>
        <div 
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")'
          }}
        />
      </div>

      {/* Feature Cards */}
      <DashboardFeatures />
    </div>
  );
};

export default DashboardPage;