import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Clock, FileText, Eye, DollarSign, Filter, ChevronLeft, ChevronRight, RefreshCw, ClipboardList } from 'lucide-react';
import { estimatesAPI, projectsAPI } from '../utils/api';
import { cn } from '../utils/helpers';
import LoadingSpinner from '../components/common/LoadingSpinner';

const EstimatesPage = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [pagination, setPagination] = useState({ count: 0, next: null, previous: null });
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    project_type: searchParams.get('project_type') || '',
    location: searchParams.get('location') || ''
  });
  const [options, setOptions] = useState({
    projectTypes: [],
    locations: [],
    statuses: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending Review' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' }
    ]
  });

  // Load filter options on mount
  useEffect(() => {
    Promise.all([
      projectsAPI.getProjectTypes(),
      projectsAPI.getLocations()
    ]).then(([types, locations]) => {
      setOptions(prev => ({
        ...prev,
        projectTypes: types.data?.results || types.data || [],
        locations: locations.data?.results || locations.data || []
      }));
    }).catch(console.error);
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setSearchParams(prev => {
      if (value) {
        prev.set(key, value);
      } else {
        prev.delete(key);
      }
      prev.delete('page'); // Reset to first page on filter change
      return prev;
    });
  };

  // Load estimates with filters and pagination
  useEffect(() => {
    let mounted = true;
    const page = searchParams.get('page') || 1;
    const params = {
      page,
      ...filters
    };

    setLoading(true);
    estimatesAPI.getEstimates(params)
      .then((res) => {
        if (!mounted) return;
        const data = res.data;
        setPagination({
          count: data.count || 0,
          next: data.next,
          previous: data.previous
        });
        const items = Array.isArray(data) ? data : (data?.results || []);
        setEstimates(items);
      })
      .catch((err) => {
        console.error('Failed to load estimates', err);
        if (!mounted) return;
        setError(err?.response?.data || { message: err.message });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, [searchParams, filters]);

  // Auto-refresh every 30 seconds if the page is visible
  useEffect(() => {
    if (document.hidden) return;
    
    const interval = setInterval(() => {
      const page = searchParams.get('page') || 1;
      estimatesAPI.getEstimates({ page, ...filters })
        .then(res => {
          const data = res.data;
          setPagination({
            count: data.count || 0,
            next: data.next,
            previous: data.previous
          });
          setEstimates(Array.isArray(data) ? data : (data?.results || []));
        })
        .catch(console.error);
    }, 30000);

    return () => clearInterval(interval);
  }, [searchParams, filters]);

  const handlePageChange = (newPage) => {
    setSearchParams(prev => {
      prev.set('page', newPage);
      return prev;
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Estimates</h1>
          <p className="text-sm text-gray-500">All estimates you've created or uploaded.</p>
        </div>
        <div>
          <Link
            to="/estimate/new"
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" />
            New Estimate
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg border space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Filter className="w-4 h-4" />
          <span>Filter Estimates</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {options.statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
            <select
              value={filters.project_type}
              onChange={(e) => handleFilterChange('project_type', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Project Types</option>
              {options.projectTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              {options.locations.map(location => (
                <option key={location.id} value={location.id}>{location.county_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error?.message || JSON.stringify(error)}
        </div>
      ) : estimates.length === 0 ? (
        <div className="p-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 rounded-full">
              <ClipboardList className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates found</h3>
          <p className="text-gray-600 mb-4">
            {Object.values(filters).some(Boolean)
              ? "No estimates match your filters. Try adjusting your search criteria."
              : "Get started by creating your first construction cost estimate."}
          </p>
          <Link
            to="/estimate/new"
            className="inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700"
          >
            <FileText className="w-5 h-5 mr-2" />
            Create New Estimate
          </Link>
          {Object.values(filters).some(Boolean) && (
            <button
              onClick={() => {
                setFilters({ status: '', project_type: '', location: '' });
                setSearchParams({});
              }}
              className="block mx-auto mt-4 text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {estimates.map((est) => (
            <div key={est.id} className="p-4 bg-white rounded shadow-sm border">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium">{est.project_name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{est.project_description || '—'}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{new Date(est.created_at).toLocaleString()}</div>
                  <div className="mt-2 inline-flex items-center px-2 py-1 rounded bg-gray-100 text-xs font-medium">
                    {est.status}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{est.source || 'manual'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="font-semibold">Ksh {Number(est.total_estimated_cost).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Link
                    to={`/estimate/${est.id}`}
                    className="inline-flex items-center px-3 py-1 rounded-md bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && estimates.length > 0 && (
        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="flex items-center text-sm text-gray-700">
            <span>
              Showing{' '}
              <span className="font-medium">
                {((parseInt(searchParams.get('page') || '1') - 1) * 20) + 1}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(parseInt(searchParams.get('page') || '1') * 20, pagination.count)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{pagination.count}</span>{' '}
              estimates
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(parseInt(searchParams.get('page') || '1') - 1)}
              disabled={!pagination.previous}
              className={cn(
                'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium',
                pagination.previous
                  ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>
            <button
              onClick={() => handlePageChange(parseInt(searchParams.get('page') || '1') + 1)}
              disabled={!pagination.next}
              className={cn(
                'inline-flex items-center px-3 py-2 rounded-md text-sm font-medium',
                pagination.next
                  ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              )}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimatesPage;
