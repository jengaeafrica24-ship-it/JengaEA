import React from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Users,
  Building2,
  Calculator,
  ArrowRight,
  Eye,
  TrendingUp,
  Clock,
  Activity,
  BarChart2,
  PlusCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatCurrency, formatNumber } from '../utils/helpers';

const DashboardPage = () => {
  const { user } = useAuth();
  const { usage, getQuotaStatus } = useSubscription();

  const quotaStatus = getQuotaStatus();

  // Mock data - in real app, this would come from API
  const stats = {
    totalEstimates: 15,
    totalValue: 2500000,
    recentEstimates: 3,
    averageCost: 166667,
  };

  const recentEstimates = [
    {
      id: 1,
      name: '3-Bedroom House',
      location: 'Nairobi, Kenya',
      cost: 2500000,
      status: 'approved',
      created_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      name: 'Commercial Building',
      location: 'Kampala, Uganda',
      cost: 15000000,
      status: 'draft',
      created_at: '2024-01-14T14:20:00Z',
    },
    {
      id: 3,
      name: 'Perimeter Wall',
      location: 'Dar es Salaam, Tanzania',
      cost: 450000,
      status: 'pending',
      created_at: '2024-01-13T09:15:00Z',
    },
  ];

  const quickActions = [
    {
      title: 'New Estimate',
      description: 'Create a new construction cost estimate',
      icon: Calculator,
      href: '/estimate/new',
      color: 'bg-primary-600',
    },
    {
      title: 'Browse Projects',
      description: 'Explore predefined project templates',
      icon: Building2,
      href: '/projects',
      color: 'bg-green-600',
    },
    {
      title: 'View Reports',
      description: 'Access your generated reports',
      icon: FileText,
      href: '/reports',
      color: 'bg-blue-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero / Welcome */}
      <div 
        className="relative rounded-2xl overflow-hidden mb-8 min-h-[300px]"
        style={{
          backgroundImage: "url('/images/hero-bg.svg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
  <div className="absolute inset-0 bg-black/25" />
  <div className="absolute inset-0 bg-gradient-to-br from-sky-900/25 via-sky-900/10 to-transparent" />
        <div className="relative z-10 p-6 md:p-8 lg:p-10 flex flex-col md:flex-row items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Good to see you, {user?.first_name || 'User'}
            </h1>
            <p className="mt-2 text-sky-100 max-w-xl">Overview of your projects, estimates and recent activity.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="primary" size="md" as="a" href="/estimate/new">
                <PlusCircle className="w-4 h-4 mr-2" /> New Estimate
              </Button>
              <Link to="/projects" className="inline-flex items-center px-4 py-2 rounded-md bg-white bg-opacity-10 text-white text-sm font-medium hover:bg-opacity-20 transition-colors">
                Browse Projects
              </Link>
            </div>
          </div>

          <div className="mt-6 md:mt-0 grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 text-white">
              <div className="text-xs text-sky-100">Estimates</div>
              <div className="text-2xl font-semibold">{formatNumber(stats.totalEstimates)}</div>
              <div className="text-xs text-sky-200">Total created</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 text-white">
              <div className="text-xs text-sky-100">Portfolio Value</div>
              <div className="text-2xl font-semibold">{formatCurrency(stats.totalValue)}</div>
              <div className="text-xs text-sky-200">All projects</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left/Main - stats and charts */}
        <div className="lg:col-span-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <Card>
              <Card.Body className="flex items-center space-x-4">
                <div className="p-3 bg-sky-100 rounded-lg">
                  <Calculator className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Estimates</div>
                  <div className="text-xl font-bold text-gray-900">{formatNumber(stats.totalEstimates)}</div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Value</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body className="flex items-center space-x-4">
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Users className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg. Cost</div>
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(stats.averageCost)}</div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Estimates Over Time</h3>
                  <div className="text-xs text-gray-500">Last 12 months</div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="h-48 bg-gradient-to-b from-white to-gray-50 rounded-md flex items-center justify-center text-gray-400">
                  <BarChart2 className="w-12 h-12" />
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Cost Breakdown</h3>
                  <div className="text-xs text-gray-500">By category</div>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="h-48 bg-gradient-to-b from-white to-gray-50 rounded-md flex items-center justify-center text-gray-400">
                  <Activity className="w-12 h-12" />
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Recent Estimates table */}
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Estimates</h2>
                <Link to="/estimates" className="text-sm text-sky-600 hover:text-sky-700 font-medium">View all</Link>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3" />
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {recentEstimates.map((estimate) => (
                      <tr key={estimate.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{estimate.name}</div>
                          <div className="text-xs text-gray-500">{new Date(estimate.created_at).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{estimate.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{formatCurrency(estimate.cost)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            estimate.status === 'approved' ? 'bg-green-100 text-green-800' :
                            estimate.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>{estimate.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link to={`/estimate/${estimate.id}`} className="text-sky-600 hover:text-sky-700 font-medium inline-flex items-center">
                            View <Eye className="w-4 h-4 ml-2" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Right column - quick actions, quota, activity */}
        <aside className="lg:col-span-4 space-y-6">
          <Card>
            <Card.Header>
              <h3 className="text-sm font-medium text-gray-900">Quick Actions</h3>
            </Card.Header>
            <Card.Body className="space-y-3">
              {quickActions.map((action, idx) => {
                const Icon = action.icon;
                return (
                  <Link key={idx} to={action.href} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{action.title}</div>
                        <div className="text-xs text-gray-500">{action.description}</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </Link>
                );
              })}
            </Card.Body>
          </Card>

          {usage && (
            <Card>
              <Card.Header>
                <h3 className="text-sm font-medium text-gray-900">Usage</h3>
              </Card.Header>
              <Card.Body>
                <div className="text-sm text-gray-600 mb-3">{usage.estimates_used} used — {usage.estimates_limit || '∞'} limit</div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                  <div className={`h-2 rounded-full ${quotaStatus.percentage > 80 ? 'bg-red-500' : quotaStatus.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(quotaStatus.percentage, 100)}%` }} />
                </div>
                <div className="text-xs text-gray-500">{quotaStatus.isUnlimited ? 'Unlimited' : `${usage.estimates_remaining} remaining`}</div>
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header>
              <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
            </Card.Header>
            <Card.Body className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-gray-100 rounded-md">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">Estimate "3-Bedroom House" approved</div>
                    <div className="text-xs text-gray-500">2 days ago</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-gray-100 rounded-md">
                    <Activity className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">New project added: Commercial Building</div>
                    <div className="text-xs text-gray-500">5 days ago</div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="mt-1 p-2 bg-gray-100 rounded-md">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-900">Report generated: Monthly summary</div>
                    <div className="text-xs text-gray-500">1 week ago</div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default DashboardPage;



