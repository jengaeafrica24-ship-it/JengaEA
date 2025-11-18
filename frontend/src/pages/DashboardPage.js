import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LogOut } from 'lucide-react';
import DashboardFeatures from '../components/dashboard/DashboardFeatures';
import { useAuth } from '../contexts/AuthContext';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Home and Logout Buttons - Responsive */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-200 shadow-lg hover:shadow-blue-500/50 text-sm sm:text-base min-h-[44px]"
        >
          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Home</span>
        </Link>
        <button
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors duration-200 shadow-lg hover:shadow-red-500/50 text-sm sm:text-base min-h-[44px]"
        >
          <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Hero Section - Responsive */}
      <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-[#1a1f2b] text-white p-6 sm:p-8 md:p-10 lg:p-12">
        <div className="relative z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 break-words">
            Welcome, {user?.name || 'User'}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 max-w-3xl">
            Your partner in accurate construction cost estimation in Kenya.
          </p>
        </div>
        <div 
          className="absolute inset-0 opacity-10 md:opacity-20 bg-cover bg-center"
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