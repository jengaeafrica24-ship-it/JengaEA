import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Loader2, Sparkles, Upload, FileText, X } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { estimatesAPI, projectsAPI } from '../utils/api';
import { toast } from 'react-hot-toast';
import { cn } from '../utils/helpers';

export default function EstimatePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('manual'); // 'manual' or 'upload'
  const [formData, setFormData] = useState({
    projectName: '',
    dataPeriod: 'Q1',
    location: '',
    buildingType: '',
    constructionType: 'new_construction',
    totalArea: '',
    projectDescription: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [costSummary, setCostSummary] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
  const response = await projectsAPI.getLocations();
  // Debug: log the raw response so we can verify shape in the browser console
  console.debug('getLocations response:', response?.data);
  // DRF may return paginated results (object with `results`) or a plain array.
  let data = response?.data;
        if (data && data.results && Array.isArray(data.results)) data = data.results;
        if (!Array.isArray(data)) data = [];
        setLocations(data);
      } catch (error) {
        console.error('Failed to fetch locations:', error);
        toast.error('Failed to load locations');
      }
    };
    fetchLocations();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type (PDF, images, CAD formats)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/tiff', 'application/dxf'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload a PDF, image, or CAD file.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    setUploadedFile(file);
    setValidationErrors({});
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedFile) {
      toast.error('Please upload a building plan first');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadedFile);

    try {
      const response = await estimatesAPI.uploadEstimate(formData);
      // Show cost summary if backend returned estimate data
      if (response?.data) {
        setCostSummary(response.data);
      }
      toast.success('Plan uploaded and estimate created successfully!');
      navigate(`/estimate/${response.data.id}`);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to process building plan');
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const locationId = findLocationId(formData.location);
      // Convert camelCase to snake_case for backend
      const payload = {
        project_name: formData.projectName,
        data_period: formData.dataPeriod,
        location: locationId,
        building_type: formData.buildingType,
        construction_type: formData.constructionType,
        total_area: formData.totalArea,
        project_description: formData.projectDescription
      };
      
      const response = await estimatesAPI.createEstimate(payload);
      // If the API returned estimate details, show them in the summary card
      if (response?.data) setCostSummary(response.data);
      toast.success('Estimate generated successfully!');
      navigate(`/estimate/${response.data.id}`);
    } catch (error) {
      console.error('Failed to generate estimate:', error);
      toast.error(error.response?.data?.message || 'Failed to generate estimate');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.projectName?.trim()) {
      errors.projectName = 'Project name is required';
    }
    if (!formData.location) {
      errors.location = 'Location is required';
    }
    if (!formData.buildingType) {
      errors.buildingType = 'Building type is required';
    }
    if (!formData.totalArea || formData.totalArea <= 0) {
      errors.totalArea = 'Valid total area is required';
    }
    setValidationErrors(errors);
    return errors;
  };

  const findLocationId = (countyName) => {
    const location = locations.find(loc => (loc.county_name || loc.name) === countyName);
    return location ? location.id : null;
  };

  const renderTabs = () => (
    <div className="mb-6 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        <button
          onClick={() => setActiveTab('manual')}
          className={cn(
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'manual'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <Calculator className="w-5 h-5 inline-block mr-2" />
          Manual Entry
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={cn(
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'upload'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          )}
        >
          <Upload className="w-5 h-5 inline-block mr-2" />
          Upload Plan
        </button>
      </nav>
    </div>
  );

  const renderUploadTab = () => (
    <div className="space-y-6">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'border-2 border-dashed rounded-lg p-12 text-center',
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          'transition-colors duration-200'
        )}
      >
        <input
          type="file"
          id="plan-upload-hidden"
          name="plan-upload"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          accept=".pdf,.jpg,.jpeg,.png,.tiff,.dxf"
        />

        {uploadedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <FileText className="w-12 h-12 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => setUploadedFile(null)}
              className="text-sm text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4 inline-block mr-1" />
              Remove
            </button>
          </div>
        ) : (
          <div>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor="plan-upload-visible"
                className="relative cursor-pointer rounded-md font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
              >
                <span>Upload a file</span>
                <input
                  id="plan-upload-visible"
                  name="plan-upload"
                  type="file"
                  className="sr-only"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png,.tiff,.dxf"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PDF, JPG, PNG, TIFF or DXF up to 10MB
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleUploadSubmit}
          disabled={!uploadedFile || isUploading}
          className="inline-flex items-center"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload and Generate Estimate
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const renderManualTab = () => (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Project Name"
            placeholder="Enter project name"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            error={validationErrors.projectName}
            required
          />
          <Input
            label="Location"
            type="select"
            placeholder="Select location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            error={validationErrors.location}
            required
          >
            <option value="">Select a county</option>
            {Array.isArray(locations) && locations.map(location => (
              <option key={location.id} value={location.county_name || location.name}>
                {location.county_name || location.name}
              </option>
            ))}
          </Input>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Input
            label="Building Type"
            type="select"
            value={formData.buildingType}
            onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
            error={validationErrors.buildingType}
            required
          >
            <option value="">Select type</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
          </Input>

          <Input
            label="Construction Type"
            type="select"
            value={formData.constructionType}
            onChange={(e) => setFormData({ ...formData, constructionType: e.target.value })}
            error={validationErrors.constructionType}
          >
            <option value="new_construction">New Construction</option>
            <option value="repair">Repair</option>
          </Input>

          <Input
            label="Data Period"
            type="select"
            value={formData.dataPeriod}
            onChange={(e) => setFormData({ ...formData, dataPeriod: e.target.value })}
          >
            <option value="Q1">Q1 (Quarter 1)</option>
            <option value="Q2">Q2 (Quarter 2)</option>
            <option value="Q3">Q3 (Quarter 3)</option>
            <option value="Q4">Q4 (Quarter 4)</option>
          </Input>
        </div>

        <div className="mt-6">
          <Input
            label="Total Area (sq m)"
            type="number"
            placeholder="Enter total area in square meters"
            value={formData.totalArea}
            onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
            error={validationErrors.totalArea}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="mt-6">
          <Input
            label="Project Description"
            type="textarea"
            placeholder="Brief description of the project"
            value={formData.projectDescription}
            onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
            error={validationErrors.projectDescription}
            maxLength={150}
          />
        </div>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          onClick={() => navigate('/estimates')}
          variant="outline"
          className="px-4 py-2"
        >
          Cancel
        </Button>
        <Button
          onClick={handleManualSubmit}
          disabled={isLoading}
          className="inline-flex items-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating Estimate...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Estimate
            </>
          )}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold mb-2">Create New Estimate</h1>
      <p className="text-gray-600 mb-6">Generate a cost estimate for your construction project.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          {renderTabs()}

          {/* Small banner showing how many locations were loaded and a dropdown to pick any location */}
          <div className="mb-4">
        {Array.isArray(locations) && locations.length > 0 ? (
          <div className="inline-flex items-center px-3 py-1 rounded bg-green-50 text-green-800 text-sm">
            Loaded {locations.length} locations
          </div>
        ) : (
          <div className="inline-flex items-center px-3 py-1 rounded bg-yellow-50 text-yellow-800 text-sm">
            No locations loaded
          </div>
        )}

        {/* Dropdown listing all locations for quick selection */}
        <div className="mt-2">
          <label htmlFor="all-locations" className="block text-sm font-medium text-gray-700 mb-1">
            Choose location
          </label>
          <select
            id="all-locations"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="block w-full px-3 py-2 border rounded-md bg-white text-gray-900"
          >
            <option value="">-- Select location --</option>
            {Array.isArray(locations) && locations.map((loc) => (
              <option key={loc.id} value={loc.county_name || loc.name || loc.label || ''}>
                {loc.county_name || loc.name || loc.label}
              </option>
            ))}
          </select>
        </div>
      </div>

          {activeTab === 'manual' ? renderManualTab() : renderUploadTab()}
        </div>

        {/* Cost summary card on the right column */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <Card.Body className="p-6">
              <h3 className="text-lg font-semibold mb-3">Cost Summary</h3>
              {!costSummary ? (
                <div className="text-sm text-slate-500">
                  Generate an estimate (manual or upload) to see a cost summary here.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-400">Project</p>
                    <p className="font-medium">{costSummary.project_name || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Total Area</p>
                    <p className="font-medium">{costSummary.total_area || '—'} sq m</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Adjusted Cost / m²</p>
                    <p className="font-medium">{costSummary.adjusted_cost_per_sqm ? new Intl.NumberFormat(undefined, {style: 'currency', currency: 'USD'}).format(costSummary.adjusted_cost_per_sqm) : '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">Contingency ({costSummary.contingency_percentage ?? 10}%)</p>
                    <p className="font-medium">{costSummary.contingency_amount ? new Intl.NumberFormat(undefined, {style: 'currency', currency: 'USD'}).format(costSummary.contingency_amount) : '—'}</p>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-slate-400">Estimated Total</p>
                    <p className="text-2xl font-bold">{costSummary.total_estimated_cost ? new Intl.NumberFormat(undefined, {style: 'currency', currency: 'USD'}).format(costSummary.total_estimated_cost) : '—'}</p>
                  </div>

                  {/* Simple breakdown if provided */}
                  {costSummary.materials || costSummary.labor ? (
                    <div>
                      <p className="text-sm font-medium mt-3">Breakdown</p>
                      <ul className="mt-2 space-y-2 text-sm">
                        {costSummary.materials && (
                          <li className="flex justify-between"><span>Materials</span><span>{new Intl.NumberFormat(undefined, {style: 'currency', currency: 'USD'}).format(costSummary.materials)}</span></li>
                        )}
                        {costSummary.labor && (
                          <li className="flex justify-between"><span>Labor</span><span>{new Intl.NumberFormat(undefined, {style: 'currency', currency: 'USD'}).format(costSummary.labor)}</span></li>
                        )}
                        {costSummary.equipment && (
                          <li className="flex justify-between"><span>Equipment</span><span>{new Intl.NumberFormat(undefined, {style: 'currency', currency: 'USD'}).format(costSummary.equipment)}</span></li>
                        )}
                      </ul>
                    </div>
                  ) : null}

                  <div className="mt-4 flex gap-2">
                    <Button onClick={() => { if (costSummary?.id) navigate(`/estimate/${costSummary.id}`); }} className="flex-1">Open Estimate</Button>
                    <Button variant="secondary" onClick={() => setCostSummary(null)} className="flex-1">Clear</Button>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}