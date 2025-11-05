import React from 'react';
import { FileText, Download, Share, Eye, Calendar, BarChart2, PieChart, DownloadCloud } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatDate, formatNumber } from '../utils/helpers';

const ReportsPage = () => {
  // Mock data - in real app, this would come from API
  const reports = [
    {
      id: 1,
      title: '3-Bedroom House Cost Estimate',
      project: '3-Bedroom House',
      type: 'estimate',
      format: 'pdf',
      size: '2.4 MB',
      created_at: '2024-01-15T10:30:00Z',
      downloads: 3,
    },
    {
      id: 2,
      title: 'Commercial Building Report',
      project: 'Commercial Building',
      type: 'detailed',
      format: 'excel',
      size: '1.8 MB',
      created_at: '2024-01-14T14:20:00Z',
      downloads: 1,
    },
    {
      id: 3,
      title: 'Perimeter Wall Summary',
      project: 'Perimeter Wall',
      type: 'summary',
      format: 'pdf',
      size: '1.2 MB',
      created_at: '2024-01-13T09:15:00Z',
      downloads: 5,
    },
  ];

  // derived stats
  const totalReports = reports.length;
  const totalDownloads = reports.reduce((sum, r) => sum + (r.downloads || 0), 0);
  const totalSizeMB = reports.reduce((sum, r) => {
    const size = parseFloat(r.size.replace(/[^0-9.]/g, '')) || 0;
    return sum + size;
  }, 0).toFixed(1);

  const getTypeColor = (type) => {
    const colors = {
      estimate: 'bg-blue-100 text-blue-800',
      detailed: 'bg-green-100 text-green-800',
      summary: 'bg-yellow-100 text-yellow-800',
      comparison: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getFormatIcon = (format) => {
    return format === 'pdf' ? '📄' : '📊';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Reports</h1>
          <p className="mt-2 text-gray-600 max-w-xl">Generate, manage and export your construction cost reports.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="secondary" className="flex items-center">
            <DownloadCloud className="w-4 h-4 mr-2" /> Export All
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" /> Generate New Report
          </Button>
        </div>
      </div>

      {/* Top stats + chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <Card.Body className="flex items-center space-x-4">
              <div className="p-3 bg-sky-100 rounded-lg">
                <FileText className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Reports</div>
                <div className="text-xl font-bold text-gray-900">{formatNumber(totalReports)}</div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Downloads</div>
                <div className="text-xl font-bold text-gray-900">{formatNumber(totalDownloads)}</div>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Body className="flex items-center space-x-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <PieChart className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Total Size</div>
                <div className="text-xl font-bold text-gray-900">{totalSizeMB} MB</div>
              </div>
            </Card.Body>
          </Card>
        </div>

        <div className="lg:col-span-4">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Activity</h3>
                <span className="text-xs text-gray-500">Last 7 days</span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="h-36 bg-gradient-to-b from-white to-gray-50 rounded-md flex items-center justify-center text-gray-400">
                <BarChart2 className="w-12 h-12" />
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <Card>
          <Card.Body>
            <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 gap-4">
              <div className="flex-1 max-w-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input type="text" className="input" placeholder="Search reports by title or project..." />
              </div>

              <div className="flex items-center space-x-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select className="input">
                    <option value="">All Types</option>
                    <option value="estimate">Cost Estimate</option>
                    <option value="detailed">Detailed</option>
                    <option value="summary">Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                  <select className="input">
                    <option value="">All Formats</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>

                <Button variant="ghost">Apply</Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        <Card>
          <Card.Body>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3" />
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{getFormatIcon(report.format)}</div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{report.title}</div>
                            <div className="text-xs text-gray-500">{report.format.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.project}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>{report.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">{report.size}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(report.created_at)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="sm"><Eye className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm"><Download className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm"><Share className="w-4 h-4" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;



