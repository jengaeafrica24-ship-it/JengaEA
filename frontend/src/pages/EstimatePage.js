import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calculator, 
  Upload, 
  FileText, 
  Loader2, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  X,
  Home,
  Building,
  MapPin,
  Ruler
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { estimatesAPI, projectsAPI } from '../utils/api';
import toast from 'react-hot-toast';

// Location data comes from the backend API
  { id: 27, name: 'Uasin Gishu', code: '027' },
  { id: 28, name: 'Elgeyo-Marakwet', code: '028' },
  { id: 29, name: 'Nandi', code: '029' },
  { id: 30, name: 'Baringo', code: '030' },
  { id: 31, name: 'Laikipia', code: '031' },
  { id: 32, name: 'Nakuru', code: '032' },
  { id: 33, name: 'Narok', code: '033' },
  { id: 34, name: 'Kajiado', code: '034' },
  { id: 35, name: 'Kericho', code: '035' },
  { id: 36, name: 'Bomet', code: '036' },
  { id: 37, name: 'Kakamega', code: '037' },
  { id: 38, name: 'Vihiga', code: '038' },
  { id: 39, name: 'Bungoma', code: '039' },
  { id: 40, name: 'Busia', code: '040' },
  { id: 41, name: 'Siaya', code: '041' },
  { id: 42, name: 'Kisumu', code: '042' },
  { id: 43, name: 'Homa Bay', code: '043' },
  { id: 44, name: 'Migori', code: '044' },
  { id: 45, name: 'Kisii', code: '045' },
  { id: 46, name: 'Nyamira', code: '046' },
  { id: 47, name: 'Nairobi', code: '047' }
];

export default function EstimatePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Mode: 'manual' or 'upload'
  const [mode, setMode] = useState('manual');
  
  // Manual entry form data
  const [formData, setFormData] = useState({
    projectName: '',
    dataPeriod: 'Q1',
    buildingType: '',
    constructionType: 'new_construction',
    location: '',
    totalArea: '',
    projectDescription: ''
  });
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Common state
  const [isLoading, setIsLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [uploadError, setUploadError] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const resp = await projectsAPI.getLocations();
        let data = resp?.data;
        if (data && data.results && Array.isArray(data.results)) data = data.results;
        if (!Array.isArray(data)) data = [];
        setLocations(data);
      } catch (err) {
        console.error('Failed to load locations', err);
        setLocations([]);
      }
    };
    fetchLocations();
  }, []);

  // Find location ID from county name
  const findLocationId = (countyName) => {
    if (!countyName || !locations.length) return null;
    const location = locations.find(loc => 
      (loc.county_name || loc.name)?.toLowerCase() === countyName.toLowerCase()
    );
    return location?.id || null;
  };

  // Manual form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.projectName || !String(formData.projectName).trim()) {
      errors.projectName = 'Project name is required';
    }
    if (!formData.dataPeriod) {
      errors.dataPeriod = 'Data period is required';
    }
    if (!formData.buildingType) {
      errors.buildingType = 'Building type is required';
    }
    if (!formData.constructionType) {
      errors.constructionType = 'Project type is required';
    }
    if (!formData.location) {
      errors.location = 'Location is required';
    }
    if (!formData.totalArea || Number(formData.totalArea) <= 0) {
      errors.totalArea = 'Total area must be greater than 0';
    }
    if (formData.projectDescription && formData.projectDescription.length > 150) {
      errors.projectDescription = 'Description must be <= 150 characters';
    }
    return errors;
  };

  // Handle manual form submission
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      toast.error('Please fill in all required fields');
      return;
    }
    setValidationErrors({});
      setIsLoading(true);

    try {
      let locationId = formData.location;
      const selectedCountyName = formData.location;
      
      if (isNaN(parseInt(locationId, 10))) {
        locationId = findLocationId(selectedCountyName);
        if (!locationId) {
          const selectedCounty = KENYAN_COUNTIES.find(c => c.name === selectedCountyName);
          if (selectedCounty) {
            locationId = selectedCounty.code;
          }
        }
      } else {
        locationId = parseInt(locationId, 10);
      }

      if (!locationId) {
        toast.error('Please select a valid location');
        setIsLoading(false);
        return;
      }

      const payload = {
        project_name: formData.projectName.trim(),
        data_period: formData.dataPeriod,
        building_type: formData.buildingType,
        construction_type: formData.constructionType,
        location_id: locationId,
        total_area: parseFloat(formData.totalArea),
        project_description: formData.projectDescription.trim() || '',
        contingency_percentage: 10.0
      };

      console.log('🚀 Enqueueing background estimate job...');
      console.log('📦 Payload:', payload);

      // Use async endpoint that returns a Celery task id (202)
      const enqueueResp = await estimatesAPI.createEstimateWithGeminiAsync(payload);
      console.log('✅ Enqueue response:', enqueueResp?.data);

      const taskId = enqueueResp?.data?.task_id;
      if (!taskId) {
        throw new Error('Failed to enqueue background estimate task');
      }

      toast.success('Estimate request queued. Generating estimate in background...');

      // Poll the task status until ready
      const pollInterval = 2000; // 2s
      const maxTime = 180000; // 3 minutes
      let elapsed = 0;

      const poll = async () => {
        try {
          const statusResp = await estimatesAPI.getEstimateTaskStatus(taskId);
          console.log('🔁 Task status:', statusResp?.data);
          if (statusResp?.data?.status === 'SUCCESS' || (statusResp?.data?.result && statusResp?.data?.result.status === 'success')) {
            // Task completed successfully
            const estId = statusResp.data.result?.estimate_id || statusResp.data.result?.estimate_id;
            toast.success('Estimate generated successfully');
            setIsLoading(false);
            if (estId) navigate(`/estimate/${estId}`);
            clearInterval(interval);
          } else if (statusResp?.data?.status === 'FAILURE' || (statusResp?.data?.result && statusResp?.data?.result.status === 'failed')) {
            const err = statusResp.data?.result?.error || 'Background job failed';
            toast.error(err);
            setIsLoading(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
        elapsed += pollInterval;
        if (elapsed > maxTime) {
          toast.error('Background estimate is taking too long. You can check the Estimates page later.');
          setIsLoading(false);
          clearInterval(interval);
        }
      };

      const interval = setInterval(poll, pollInterval);
      // Run immediate first poll
      await poll();
    } catch (err) {
      console.error('❌ Estimate creation error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        code: err.code,
        response: err.response,
        request: err.request,
        config: err.config
      });
      
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          'Failed to create estimate. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setUploadError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size should not exceed 5MB');
      return;
    }

    setSelectedFile(file);
    setUploadError(null);
  };

  const onFileSelected = (e) => {
    const file = e.target.files && e.target.files[0];
    handleFileSelect(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file to upload');
      return;
    }

    setIsLoading(true);
    setUploadError(null);

    try {
      const response = await estimatesAPI.uploadEstimate(selectedFile);
      toast.success('Estimate uploaded and created successfully!');
      
      if (response?.data?.estimate?.id) {
        navigate(`/estimate/${response.data.estimate.id}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Upload error:', err);
      const errorMessage = err?.response?.data?.error || 
                          err?.response?.data?.message || 
                          'Failed to upload estimate. Please try again.';
      setUploadError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const buildingTypeOptions = [
    { value: 'residential', label: 'Residential', icon: Home },
    { value: 'commercial', label: 'Commercial', icon: Building },
    { value: 'infrastructure', label: 'Infrastructure', icon: Building },
    { value: 'industrial', label: 'Industrial', icon: Building }
  ];

  const dataPeriodOptions = [
    { value: 'Q1', label: 'Q1 (Quarter 1)' },
    { value: 'Q2', label: 'Q2 (Quarter 2)' },
    { value: 'Q3', label: 'Q3 (Quarter 3)' },
    { value: 'Q4', label: 'Q4 (Quarter 4)' }
  ];

  const constructionTypeOptions = [
    { value: 'new_construction', label: 'New Project' },
    { value: 'repair', label: 'Repair' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-blue-900/10 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          
          {/* Hero Header */}
          <div className="relative mb-8 sm:mb-12 overflow-hidden rounded-3xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-orange-500/30" />
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-20" 
              style={{ backgroundImage: "url('/images/hero-bg.svg')" }}
            />
            <div className="relative z-10 p-8 sm:p-12 md:p-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/50">
                <Calculator className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-4">
                Construction Estimate
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 max-w-2xl mx-auto">
                Create professional cost estimates with AI-powered analysis or upload your housing plan
              </p>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="mb-8">
            <div className="inline-flex rounded-xl bg-slate-800/50 p-1.5 backdrop-blur-sm border border-slate-700/50">
              <button
                onClick={() => {
                  setMode('manual');
                  setSelectedFile(null);
                  setUploadError(null);
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  mode === 'manual'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  <span>Manual Entry</span>
                </div>
              </button>
              <button
                onClick={() => {
                  setMode('upload');
                  setValidationErrors({});
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  mode === 'upload'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Plan</span>
                </div>
              </button>
            </div>
          </div>

          {/* Content Card */}
          <Card className="shadow-2xl bg-slate-800/80 backdrop-blur-sm border border-slate-700/50">
            <Card.Body className="p-6 sm:p-8 md:p-10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="w-16 h-16 animate-spin text-orange-500 mb-4" />
                  <p className="text-white text-xl font-medium">Processing your request...</p>
                  <p className="text-slate-400 text-sm mt-2">
                    {mode === 'upload' ? 'Uploading and analyzing your plan...' : 'Generating your estimate with AI...'}
                  </p>
                </div>
              ) : mode === 'manual' ? (
                /* Manual Entry Form */
                <form onSubmit={handleManualSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Project Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Building className="w-4 h-4 text-orange-400" />
                        Project Name <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="projectName"
                        value={formData.projectName}
                        onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                        placeholder="e.g., Modern Office Complex"
                        error={validationErrors.projectName}
                        className="bg-slate-700/50 text-white border-slate-600 focus:border-orange-500"
                      />
                    </div>

                    {/* Data Period */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Data Period <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="dataPeriod"
                        value={formData.dataPeriod}
                        onChange={(e) => setFormData(prev => ({ ...prev, dataPeriod: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg bg-slate-700/50 text-white border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                          validationErrors.dataPeriod ? 'border-red-400' : ''
                        }`}
                      >
                        {dataPeriodOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {validationErrors.dataPeriod && (
                        <p className="mt-1 text-sm text-red-400">{validationErrors.dataPeriod}</p>
                      )}
                    </div>

                    {/* Building Type */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Home className="w-4 h-4 text-orange-400" />
                        Building Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="buildingType"
                        value={formData.buildingType}
                        onChange={(e) => setFormData(prev => ({ ...prev, buildingType: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg bg-slate-700/50 text-white border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                          validationErrors.buildingType ? 'border-red-400' : ''
                        }`}
                      >
                        <option value="">Select building type</option>
                        {buildingTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {validationErrors.buildingType && (
                        <p className="mt-1 text-sm text-red-400">{validationErrors.buildingType}</p>
                      )}
                    </div>

                    {/* Construction Type */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2">
                        Type of Project <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="constructionType"
                        value={formData.constructionType}
                        onChange={(e) => setFormData(prev => ({ ...prev, constructionType: e.target.value }))}
                        className={`w-full px-4 py-3 border rounded-lg bg-slate-700/50 text-white border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                          validationErrors.constructionType ? 'border-red-400' : ''
                        }`}
                      >
                        {constructionTypeOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {validationErrors.constructionType && (
                        <p className="mt-1 text-sm text-red-400">{validationErrors.constructionType}</p>
                      )}
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-orange-400" />
                        County Location <span className="text-red-400">*</span>
                      </label>
                      <select
                        name="location"
                        value={formData.location}
                        onChange={(e) => {
                          const selectedCounty = e.target.value;
                          const matchingLocation = locations.find(loc => 
                            loc.county_name?.toLowerCase() === selectedCounty.toLowerCase()
                          );
                          setFormData(prev => ({ 
                            ...prev, 
                            location: matchingLocation?.id || selectedCounty 
                          }));
                        }}
                        className={`w-full px-4 py-3 border rounded-lg bg-slate-700/50 text-white border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
                          validationErrors.location ? 'border-red-400' : ''
                        }`}
                      >
                        <option value="">Select a county</option>
                        {KENYAN_COUNTIES.map(county => (
                          <option key={county.id} value={county.name}>
                            {county.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.location && (
                        <p className="mt-1 text-sm text-red-400">{validationErrors.location}</p>
                      )}
                    </div>

                    {/* Total Area */}
                    <div>
                      <label className="block text-sm font-semibold text-white mb-2 flex items-center gap-2">
                        <Ruler className="w-4 h-4 text-orange-400" />
                        Total Area (sqm) <span className="text-red-400">*</span>
                      </label>
                      <Input
                        name="totalArea"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.totalArea}
                        onChange={(e) => setFormData(prev => ({ ...prev, totalArea: e.target.value }))}
                        placeholder="e.g., 1000"
                        error={validationErrors.totalArea}
                        className="bg-slate-700/50 text-white border-slate-600 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  {/* Project Description */}
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Project Description <span className="text-slate-400 text-xs">(optional, max 150 chars)</span>
                    </label>
                    <textarea
                      name="projectDescription"
                      value={formData.projectDescription}
                      onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                      placeholder="Brief description of your project..."
                      maxLength={150}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg bg-slate-700/50 text-white border-slate-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors resize-none ${
                        validationErrors.projectDescription ? 'border-red-400' : ''
                      }`}
                    />
                    <div className="flex justify-between mt-1">
                      {validationErrors.projectDescription ? (
                        <p className="text-sm text-red-400">{validationErrors.projectDescription}</p>
                      ) : (
                        <span></span>
                      )}
                      <p className="text-sm text-slate-400">
                        {formData.projectDescription.length}/150
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => navigate('/dashboard')}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/30"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Estimate with AI
                    </Button>
                  </div>
                </form>
              ) : (
                /* Upload Form */
                <div className="space-y-6">
                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer ${
                      isDragging
                        ? 'border-orange-500 bg-orange-500/10 scale-[1.02]'
                        : uploadError
                        ? 'border-red-400 bg-red-500/10'
                        : 'border-slate-600 bg-slate-700/30 hover:border-orange-500/50 hover:bg-slate-700/50'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                        isDragging ? 'bg-orange-500/20' : 'bg-slate-700/50'
                      }`}>
                        <Upload className={`w-10 h-10 ${
                          isDragging ? 'text-orange-400' : uploadError ? 'text-red-400' : 'text-slate-400'
                        }`} />
                      </div>
                      <p className="text-xl font-semibold text-white mb-2">
                        {isDragging
                          ? 'Drop your housing plan here'
                          : selectedFile
                          ? 'File selected: ' + selectedFile.name
                          : 'Drag & drop your Excel housing plan here'}
                      </p>
                      <p className="text-sm text-slate-400">
                        or click to browse from your computer
                      </p>
                      {selectedFile && (
                        <div className="mt-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-700/50 border border-slate-600">
                          <FileText className="w-6 h-6 text-orange-400" />
                          <span className="text-sm font-medium text-white">
                            {selectedFile.name}
                          </span>
                          <span className="text-xs text-slate-400">
                            ({(selectedFile.size / 1024).toFixed(1)} KB)
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFile(null);
                              setUploadError(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                            className="ml-2 p-1.5 hover:bg-slate-600 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4 text-slate-400 hover:text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    className="hidden"
                    onChange={onFileSelected}
                  />

                  {/* Error Message */}
                  {uploadError && (
                    <div className="flex items-start p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-300">{uploadError}</p>
                    </div>
                  )}

                  {/* Upload Requirements */}
                  <div className="p-5 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <h4 className="font-semibold text-blue-300 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Excel Plan Requirements
                    </h4>
                    <ul className="list-disc list-inside space-y-2 text-sm text-blue-200/80">
                      <li>Use sheets named 'Estimate' and 'Items' for project details</li>
                      <li>Include columns: Item, Quantity, Unit, Unit Price</li>
                      <li>Maximum file size: 5MB</li>
                      <li>Supported formats: .xlsx, .xls</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setMode('manual');
                        setSelectedFile(null);
                        setUploadError(null);
                      }}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      Back to Manual Entry
                    </Button>
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || isLoading}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload & Create Estimate
                        </>
                      )}
                    </Button>
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
