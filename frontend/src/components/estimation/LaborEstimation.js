import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Clock, Calendar, Upload, Database, HardHat, Calculator } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { useDropzone } from 'react-dropzone';
import api from '../../utils/api';
import LaborCostSummary from './LaborCostSummary';
import { toast } from 'react-toastify';

const LaborEstimation = () => {
  const [estimationType, setEstimationType] = useState('manual');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [estimationResult, setEstimationResult] = useState(null);
  const [laborInput, setLaborInput] = useState({
    location: '',
    projectType: '',
    buildingType: '',
    constructionPhase: '',
    specifications: '',
    project_name: '',
    construction_type: 'new_construction',
    data_period: 'Q4',
    area: { total: '', units: 'square_m' }
  });

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'area.total') {
      setLaborInput(prev => ({
        ...prev,
        area: { ...prev.area, total: value }
      }));
    } else {
      setLaborInput(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleEstimateSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = {
      location: 'Location',
      projectType: 'Project Type',
      buildingType: 'Building Type',
      constructionPhase: 'Construction Phase'
    };

    const missingFields = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!laborInput[field]) {
        missingFields.push(label);
      }
    });

    if (estimationType === 'manual' && !laborInput.area.total) {
      missingFields.push('Total Area');
    }

    if (estimationType === 'upload' && !uploadedFile) {
      missingFields.push('Building Plan');
    }

    if (missingFields.length > 0) {
      toast.error(`Please fill in the required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);
    toast.info('Generating labor estimate...');
    
    try {
      const formData = new FormData();
      
      if (estimationType === 'upload' && uploadedFile) {
        formData.append('file', uploadedFile);
      }
      
      Object.entries(laborInput).forEach(([key, value]) => {
        if (key === 'area') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      
      formData.append('estimationType', estimationType);
      
      const response = await api.post('/api/estimates/labor/generate/', formData);
      
      if (response?.data) {
        setEstimationResult(response.data);
        toast.success('Labor estimate generated successfully');
        // Scroll to results section
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Estimation failed:', error);
      let errorMessage = 'Failed to generate labor estimate';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 max-w-7xl mx-auto w-full overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 sm:mb-6 md:mb-8"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6 px-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Labor Cost Estimation</h1>
            <p className="text-xs sm:text-sm md:text-base text-blue-300/80">AI-powered labor cost estimation for your construction project</p>
          </div>
        </div>

        <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 px-2">
          <button
            onClick={() => setEstimationType('manual')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base min-h-[44px] ${
              estimationType === 'manual'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 active:bg-blue-800/40'
            }`}
          >
            <HardHat className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Manual Entry</span>
            <span className="xs:hidden">Manual</span>
          </button>
          <button
            onClick={() => setEstimationType('upload')}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 md:px-6 py-2.5 sm:py-3 rounded-lg transition-all text-sm sm:text-base min-h-[44px] ${
              estimationType === 'upload'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-blue-900/20 text-blue-300 hover:bg-blue-800/30 active:bg-blue-800/40'
            }`}
          >
            <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden xs:inline">Upload Plan</span>
            <span className="xs:hidden">Upload</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-lg md:rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl border border-blue-800/30"
        >
          <form onSubmit={handleEstimateSubmit} className="space-y-4 sm:space-y-5">
            {estimationType === 'upload' ? (
              <div {...getRootProps()} className="border-2 border-dashed border-blue-800/30 rounded-lg p-4 sm:p-6 md:p-8 text-center cursor-pointer hover:border-blue-600/50 transition-colors min-h-[200px] flex flex-col items-center justify-center">
                <input {...getInputProps()} />
                <Upload className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 sm:mb-4 text-blue-300" />
                {isDragActive ? (
                  <p className="text-blue-300 text-sm sm:text-base">Drop the files here...</p>
                ) : (
                  <>
                    <p className="text-blue-300 mb-2 text-sm sm:text-base">Drag & drop your plan files here</p>
                    <p className="text-blue-300/60 text-xs sm:text-sm">Supported formats: PDF, XLSX, XLS, CSV</p>
                  </>
                )}
                {uploadedFile && (
                  <div className="mt-3 sm:mt-4 text-blue-300">
                    <p className="text-xs sm:text-sm break-all">Selected file: {uploadedFile.name}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-blue-300 mb-2 text-xs sm:text-sm">Location</label>
                    <Input
                      type="text"
                      name="location"
                      value={laborInput.location}
                      onChange={handleInputChange}
                      placeholder="e.g., Nairobi"
                      className="w-full bg-blue-900/20 border-blue-800/30 text-sm sm:text-base min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-2 text-xs sm:text-sm">Project Name</label>
                    <Input
                      type="text"
                      name="project_name"
                      value={laborInput.project_name}
                      onChange={handleInputChange}
                      placeholder="e.g., Commercial Complex"
                      className="w-full bg-blue-900/20 border-blue-800/30 text-sm sm:text-base min-h-[44px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-blue-300 mb-2 text-xs sm:text-sm">Project Type</label>
                    <select
                      name="projectType"
                      value={laborInput.projectType}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-blue-900/20 border border-blue-800/30 text-white focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base min-h-[44px]"
                    >
                      <option value="">Select Project Type</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                      <option value="Infrastructure">Infrastructure</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-blue-300 mb-2 text-xs sm:text-sm">Building Type</label>
                    <select
                      name="buildingType"
                      value={laborInput.buildingType}
                      onChange={handleInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-blue-900/20 border border-blue-800/30 text-white focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base min-h-[44px]"
                    >
                      <option value="">Select Building Type</option>
                      <option value="Apartment">Apartment</option>
                      <option value="Office">Office Building</option>
                      <option value="Warehouse">Warehouse</option>
                      <option value="Mall">Shopping Mall</option>
                      <option value="House">House</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-300 mb-2 text-xs sm:text-sm">Construction Phase</label>
                  <select
                    name="constructionPhase"
                    value={laborInput.constructionPhase}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-blue-900/20 border border-blue-800/30 text-white focus:ring-2 focus:ring-blue-500/20 text-sm sm:text-base min-h-[44px]"
                  >
                    <option value="">Select Construction Phase</option>
                    <option value="Foundation">Foundation</option>
                    <option value="Structural">Structural</option>
                    <option value="Interior">Interior</option>
                    <option value="Finishing">Finishing</option>
                    <option value="Complete">Complete Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-300 mb-2 text-xs sm:text-sm">Area (in square meters)</label>
                  <Input
                    type="number"
                    name="area.total"
                    value={laborInput.area.total}
                    onChange={handleInputChange}
                    placeholder="e.g., 100"
                    min="0"
                    className="w-full bg-blue-900/20 border-blue-800/30 text-sm sm:text-base min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-blue-300 mb-2 text-xs sm:text-sm">Additional Specifications</label>
                  <textarea
                    name="specifications"
                    value={laborInput.specifications}
                    onChange={handleInputChange}
                    placeholder="Any additional details or requirements..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-blue-900/20 border border-blue-800/30 text-white focus:ring-2 focus:ring-blue-500/20 min-h-[80px] text-sm sm:text-base"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-sm sm:text-base min-h-[44px] py-3 font-medium"
            >
              {isLoading ? (
                <>
                  <Database className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  Generating Estimate...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
                  Generate AI Estimate
                </>
              )}
            </Button>
          </form>
        </motion.div>

        <motion.div
          id="results-section"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-blue-900/40 to-blue-950/60 backdrop-blur-lg rounded-lg md:rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 shadow-xl border border-blue-800/30"
        >
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">AI-Generated Labor Estimate</h2>
            <p className="text-blue-300/80 text-xs sm:text-sm">Comprehensive labor cost breakdown and recommendations</p>
          </div>

          {estimationResult ? (
            <LaborCostSummary estimateData={estimationResult.data} />
          ) : (
            <div className="flex flex-col items-center justify-center h-[300px] sm:h-[400px] text-blue-300/60 px-4">
              <HardHat className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4" />
              <p className="text-center text-sm sm:text-base">Fill out the form to get your AI-powered labor cost estimate</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LaborEstimation;
