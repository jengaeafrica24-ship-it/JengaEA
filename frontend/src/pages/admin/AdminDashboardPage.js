import React from 'react';
import { Users, Building2, FileText, DollarSign, AlertCircle } from 'lucide-react';
import Card from '../../components/common/Card';
import { formatCurrency, formatNumber } from '../../utils/helpers';

const AdminDashboardPage = () => {
  // Mock data - in real app, this would come from API
  const stats = {
    totalUsers: 1250,
    activeUsers: 980,
    totalEstimates: 5420,
    totalRevenue: 125000,
    growthRate: 15.5,
    pendingVerifications: 23,
  };

  const recentUsers = [
    {
      id: 1,
      name: 'John Mwangi',
      email: 'john@example.com',
      role: 'contractor',
      status: 'active',
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      name: 'Sarah Ochieng',
      email: 'sarah@example.com',
      role: 'engineer',
      status: 'pending',
      created_at: '2024-01-14T14:20:00Z',
    },
    {
      id: 3,
      name: 'David Kimani',
      email: 'david@example.com',
      role: 'homeowner',
      status: 'active',
      created_at: '2024-01-13T09:15:00Z',
    },
  ];

  const recentEstimates = [
    {
      id: 1,
      project_name: '3-Bedroom House',
      user: 'John Mwangi',
      location: 'Nairobi, Kenya',
      cost: 2500000,
      status: 'approved',
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      project_name: 'Commercial Building',
      user: 'Sarah Ochieng',
      location: 'Kampala, Uganda',
      cost: 15000000,
      status: 'pending',
      created_at: '2024-01-14T14:20:00Z',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overview of platform usage and management tools.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <Card.Body className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.totalUsers)}
            </div>
            <div className="text-sm text-gray-600">Total Users</div>
            <div className="text-xs text-green-600 mt-1">
              +{formatNumber(stats.activeUsers)} active
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.totalEstimates)}
            </div>
            <div className="text-sm text-gray-600">Total Estimates</div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <div className="text-sm text-gray-600">Total Revenue</div>
            <div className="text-xs text-green-600 mt-1">
              +{stats.growthRate}% growth
            </div>
          </Card.Body>
        </Card>

        <Card>
          <Card.Body className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(stats.pendingVerifications)}
            </div>
            <div className="text-sm text-gray-600">Pending Verifications</div>
          </Card.Body>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{user.name}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.status}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.role.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* Recent Estimates */}
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold text-gray-900">Recent Estimates</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {recentEstimates.map((estimate) => (
                <div
                  key={estimate.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{estimate.project_name}</h3>
                    <p className="text-sm text-gray-600">{estimate.user}</p>
                    <p className="text-xs text-gray-500">{estimate.location}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(estimate.cost)}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      estimate.status === 'approved' ? 'bg-green-100 text-green-800' :
                      estimate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {estimate.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <Card.Header>
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left">
              <Users className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage user accounts</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left">
              <Building2 className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Project Templates</h3>
              <p className="text-sm text-gray-600">Manage project types and templates</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition-all text-left">
              <FileText className="w-6 h-6 text-primary-600 mb-2" />
              <h3 className="font-medium text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">View platform analytics and reports</p>
            </button>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;



