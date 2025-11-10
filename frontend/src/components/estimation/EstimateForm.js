import React, { useState, useRef } from 'react';
import { Building2, Upload, FormInput, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const dataPeriods = [
  { value: 'Q1', label: 'Q1 (Quarter 1)' },
  { value: 'Q2', label: 'Q2 (Quarter 2)' },
  { value: 'Q3', label: 'Q3 (Quarter 3)' },
  { value: 'Q4', label: 'Q4 (Quarter 4)' },
  { value: '3months', label: '3 Months' },
  { value: '6months', label: '6 Months' },
  { value: '9months', label: '9 Months' },
  { value: '12months', label: '12 Months' }
];

const buildingTypes = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'industrial', label: 'Industrial' }
];

const constructionTypes = [
  { value: 'new_construction', label: 'New Construction' },
  { value: 'repair', label: 'Repair' }
];

const EstimateForm = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [estimationType, setEstimationType] = useState('manual');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [counties, setCounties] = useState([]);
  const [formData, setFormData] = useState({
    project_name: '',
    location: '',
    building_type: '',
    data_period: 'Q1',
    project_description: '',
    construction_type: 'new_construction',
    total_area: '',
    contingency_percentage: 10,
    buildingPlan: null
  });
  const [fileError, setFileError] = useState('');

  // Fetch counties from backend when component mounts
  React.useEffect(() => {
    fetch('/api/counties')
      .then(res => res.json())
      .then(data => setCounties(data))
      .catch(err => console.error('Error fetching counties:', err));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateFile = (file) => {
    const validTypes = ['application/pdf', 'image/dwg', 'application/dxf'];
    const maxSize = 50 * 1024 * 1024; // 50MB

    if (!validTypes.includes(file.type)) {
      setFileError('Invalid file type. Please upload a PDF, DWG, or DXF file.');
      return false;
    }

    if (file.size > maxSize) {
      setFileError('File size too large. Maximum size is 50MB.');
      return false;
    }

    setFileError('');
    return true;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && validateFile(file)) {
      setFormData(prev => ({
        ...prev,
        buildingPlan: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'buildingPlan') {
          formPayload.append(key, formData[key]);
        }
      });

      if (estimationType === 'upload' && formData.buildingPlan) {
        formPayload.append('building_plan', formData.buildingPlan);
        formPayload.append('source', 'upload');
      } else {
        formPayload.append('source', 'manual');
      }

      const response = await fetch('/api/estimates/', {
        method: 'POST',
        body: formPayload,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to create estimate');
      }

      const result = await response.json();
      toast.success('Estimate created successfully');
      navigate(`/estimate/${result.id}`);
    } catch (error) {
      toast.error('Failed to create estimate: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Create New Estimate</h1>
        <p className="text-gray-600">Get an accurate cost estimation for your construction project</p>
      </div>

      {/* Estimation Type Selection */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          type="button"
          className={
            "p-6 rounded-xl border-2 transition-colors flex flex-col items-center " +
            (estimationType === 'manual' 
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-blue-400")
          }
          onClick={() => setEstimationType('manual')}
        >
          <div className="flex flex-col items-center">
            <FormInput className="w-8 h-8 mb-2 text-blue-600" />
            <span className="font-medium text-gray-900">Manual Input</span>
            <span className="text-sm text-gray-500 text-center mt-1">
              Fill out the form with your project details
            </span>
          </div>
        </button>

        <button
          className={
            "p-6 rounded-xl border-2 transition-colors flex flex-col items-center " +
            (estimationType === 'upload'
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 hover:border-blue-400")
          }
          onClick={() => setEstimationType('upload')}
        >
          <div className="flex flex-col items-center">
            <Upload className="w-8 h-8 mb-2 text-blue-600" />
            <span className="font-medium text-gray-900">Upload Plans</span>
            <span className="text-sm text-gray-500 text-center mt-1">
              Upload your building plans (PDF, DWG, DXF)
            </span>
          </div>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Basic Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium mb-4">Project Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                name="project_name"
                value={formData.project_name}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select County</option>
                {counties.map(county => (
                  <option key={county.id} value={county.id}>
                    {county.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Type
              </label>
              <select
                name="building_type"
                value={formData.building_type}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Building Type</option>
                {buildingTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Construction Type
              </label>
              <select
                name="construction_type"
                value={formData.construction_type}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {constructionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Area (sq m)
              </label>
              <input
                type="number"
                name="total_area"
                value={formData.total_area}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter total area"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Period
              </label>
              <select
                name="data_period"
                value={formData.data_period}
                onChange={handleInputChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {dataPeriods.map(period => (
                  <option key={period.value} value={period.value}>
                    {period.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Description
            </label>
            <textarea
              name="project_description"
              value={formData.project_description}
              onChange={handleInputChange}
              required
              maxLength={150}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Brief description of your project (max 150 characters)"
            />
          </div>
        </div>

        {/* File Upload Section */}
        {estimationType === 'upload' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-medium mb-4">Building Plans</h2>
            
            <div className="mt-2">
              <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="file-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept=".pdf,.dwg,.dxf"
                        ref={fileInputRef}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, DWG, DXF up to 50MB
                  </p>
                </div>
              </div>
              {formData.buildingPlan && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected file: {formData.buildingPlan.name}
                </p>
              )}
              {fileError && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {fileError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (estimationType === 'upload' && !formData.buildingPlan)}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              isSubmitting || (estimationType === 'upload' && !formData.buildingPlan)
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create Estimate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EstimateForm;