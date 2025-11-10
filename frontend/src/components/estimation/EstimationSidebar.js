import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package2,
  Users,
  Building2,
  Calculator,
  Bot,
  TrendingUp,
  Clock
} from 'lucide-react';

const EstimationSidebar = () => {
  const location = useLocation();

  const menuItems = [
    {
      title: 'Project Overview',
      path: '/estimation/overview',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      title: 'Material Estimation',
      path: '/estimation/materials',
      icon: <Package2 className="w-5 h-5" />
    },
    {
      title: 'Labour Cost Estimation',
      path: '/estimation/labour',
      icon: <Users className="w-5 h-5" />
    },
    {
      title: 'Building Analysis',
      path: '/estimation/building',
      icon: <Building2 className="w-5 h-5" />
    },
    {
      title: 'Project Cost Summary',
      path: '/estimation/summary',
      icon: <Calculator className="w-5 h-5" />
    },
    {
      title: 'AI Recommendations',
      path: '/estimation/recommendations',
      icon: <Bot className="w-5 h-5" />
    },
    {
      title: 'Market Trends',
      path: '/estimation/market',
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen py-6 border-r border-gray-200">
      <div className="px-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900">Cost Estimation</h2>
        <p className="text-sm text-gray-600 mt-1">AI-Powered Analysis</p>
      </div>
      
      <nav className="px-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={
              'flex items-center px-4 py-3 rounded-lg mb-1 ' + 
              (location.pathname === item.path
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600') +
              ' transition-all duration-200'
            }
          >
            <span className="mr-3 text-current">{item.icon}</span>
            <span className="text-sm font-medium">{item.title}</span>
          </Link>
        ))}
      </nav>

      <div className="px-6 mt-8">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="flex items-center space-x-2 mb-3">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-900">Data Period</h3>
          </div>
          <select
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            defaultValue="q3"
          >
            <option value="q1">Quarter 1 - 2025</option>
            <option value="q2">Quarter 2 - 2025</option>
            <option value="q3">Quarter 3 - 2025</option>
            <option value="q4">Quarter 4 - 2025</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default EstimationSidebar;