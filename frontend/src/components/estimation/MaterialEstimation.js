import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Calculator,
  Map,
  Building2,
  Calendar,
  Layers,
  Loader2,
  ChevronDown,
  Download,
  Share2,
  Mail,
  AlertCircle,
} from 'lucide-react';
import CostSummary from './CostSummary';
import { toast } from 'react-toastify';
import { estimatesAPI } from '../../utils/api';

const projectTypes = [
  'Residential',
  'Commercial',
  'Industrial',
  'Infrastructure',
  'Healthcare',
  'Educational',
  'Mixed-Use',
];

const buildingTypes = {
  Residential: [
    'Single Family Home',
    'Apartment Building',
    'Townhouse',
    'Villa',
    'Bungalow',
  ],
  Commercial: [
    'Office Building',
    'Retail Center',
    'Hotel',
    'Restaurant',
    'Shopping Mall',
  ],
  Industrial: [
    'Factory',
    'Warehouse',
    'Manufacturing Plant',
    'Storage Facility',
    'Research Facility',
  ],
  Infrastructure: [
    'Road',
    'Bridge',
    'Tunnel',
    'Railway',
    'Airport',
  ],
  Healthcare: [
    'Hospital',
    'Clinic',
    'Medical Center',
    'Laboratory',
    'Pharmacy',
  ],
  Educational: [
    'School',
    'University',
    'College',
    'Library',
    'Research Center',
  ],
  'Mixed-Use': [
    'Residential-Commercial',
    'Office-Retail',
    'Live-Work',
    'Mall-Hotel',
  ],
};

const constructionPhases = [
  'Foundation',
  'Structural',
  'Finishing',
  'MEP',
  'Interior',
  'Exterior',
  'Site Work',
  'Full Project',
];

const locations = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Eldoret',
  'Thika',
  'Malindi',
  'Kitale',
  'Garissa',
  'Nyeri',
];

const quarters = [
  { value: 'Q1', label: 'Q1 (Jan-Mar)' },
  { value: 'Q2', label: 'Q2 (Apr-Jun)' },
  { value: 'Q3', label: 'Q3 (Jul-Sep)' },
  { value: 'Q4', label: 'Q4 (Oct-Dec)' },
];

function MaterialEstimation() {
  const [estimationType, setEstimationType] = useState('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [formData, setFormData] = useState({
    location: '',
    projectType: '',
    buildingType: '',
    dataPeriod: '',
    constructionPhase: '',
    specifications: '',
    area: {
      total: '',
      units: 'square_km',
    },
  });
  const [estimate, setEstimate] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const parts = name.split('.');
      const parentField = parts[0];
      const childField = parts[1];
      setFormData((prev) => ({
        ...prev,
        [parentField]: {
          ...prev[parentField],
          [childField]: value
        }
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const validateForm = () => {
    const requiredFields = ['location', 'projectType', 'buildingType', 'dataPeriod', 'constructionPhase'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (estimationType === 'manual' && !formData.area.total) {
      missingFields.push('area');
    }

    if (estimationType === 'upload' && !uploadedFile) {
      missingFields.push('building plan');
    }

    if (missingFields.length > 0) {
      toast.error(`Please fill in the following fields: ${missingFields.join(', ')}`);
      return false;
    }

    return true;
  };

  const downloadEstimate = () => {
    try {
      // Create estimate summary
      const content = {
        projectInfo: {
          location: formData.location,
          projectType: formData.projectType,
          buildingType: formData.buildingType,
          constructionPhase: formData.constructionPhase,
          area: formData.area.total + ' km²',
        },
        materials: estimate.materials,
        costs: {
          subtotal: estimate.subtotal,
          vat: estimate.vat,
          total: estimate.totalCost,
        },
        recommendations: estimate.recommendations,
      };

      // Convert to string
      const estimateStr = JSON.stringify(content, null, 2);
      
      // Create blob and download
      const blob = new Blob([estimateStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `estimate-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Estimate downloaded successfully');
    } catch (error) {
      toast.error('Failed to download estimate');
    }
  };

  const shareEstimate = async () => {
    try {
      const email = prompt('Enter email address to share the estimate:');
      if (!email) return;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error('Please enter a valid email address');
        return;
      }

      setIsLoading(true);
      const response = await estimatesAPI.shareEstimate({
        email,
        estimate: {
          ...estimate,
          projectInfo: {
            location: formData.location,
            projectType: formData.projectType,
            buildingType: formData.buildingType,
            constructionPhase: formData.constructionPhase,
            area: formData.area.total + ' km²',
          },
        }
      });

      if (response.success) {
        toast.success('Estimate shared successfully');
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      toast.error('Failed to share estimate: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const generateEstimate = useCallback(async (e) => {
    if (e) e.preventDefault();
    
    // Form validation
    const requiredFields = {
      location: 'Location',
      projectType: 'Project Type',
      buildingType: 'Building Type',
      constructionPhase: 'Construction Phase'
    };

    const missingFields = [];
    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!formData[field]) {
        missingFields.push(label);
      }
    });

    if (estimationType === 'manual' && !formData.area.total) {
      missingFields.push('Total Area');
    }

    if (estimationType === 'upload' && !uploadedFile) {
      missingFields.push('Building Plan');
    }

    if (missingFields.length > 0) {
      toast.error(`Please fill in the required fields: ${missingFields.join(', ')}`);
      return;
    }

    try {
      setIsLoading(true);
      toast.info('Generating estimate...');
      
      // Create request payload
      const payload = {
        location: formData.location,
        projectType: formData.projectType,
        buildingType: formData.buildingType,
        constructionPhase: formData.constructionPhase,
        specifications: formData.specifications || '',
        project_name: `${formData.buildingType} Project - ${formData.location}`,
        construction_type: 'new_construction',
        data_period: 'Q4',  // Current quarter
        area: JSON.stringify(formData.area),  // Backend expects stringified area
        estimationType: estimationType
      };

      let response;
      
      // If there's a file, use FormData
      if (uploadedFile) {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        // Add all other fields
        Object.entries(payload).forEach(([key, value]) => {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
        });
        console.log('Sending with file:', Object.fromEntries(formData));
        response = await estimatesAPI.generateMaterialEstimate(formData);
      } else {
        // If no file, send JSON directly
        console.log('Sending JSON payload:', payload);
        response = await estimatesAPI.generateMaterialEstimate(payload);
      }

      console.log('Estimate response:', response);
      
      if (response?.data) {
        // Handle nested response structure
        const estimateData = response.data.data || response.data;
        
        // Validate the estimate data
        if (!estimateData.materials || !Array.isArray(estimateData.materials)) {
          throw new Error('Invalid estimate data received');
        }
        
        setEstimate(estimateData);
        toast.success('Estimate generated successfully');
        
        // Scroll to the results section
        document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Estimation error:', error);
      let errorMessage = 'Failed to generate estimate';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [formData, estimationType, uploadedFile]);

  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4 sm:space-y-6 md:space-y-8"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Material Cost Estimation
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Generate accurate material cost estimates using AI or manual entry
          </p>
        </div>

        {/* Estimation Type Selection */}
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setEstimationType('manual')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              estimationType === 'manual'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <FileText className="w-5 h-5" />
            Manual Entry
          </button>
          <button
            onClick={() => setEstimationType('upload')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all ${
              estimationType === 'upload'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Upload className="w-5 h-5" />
            Upload Plan
          </button>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Location Selection */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Map className="w-4 h-4 inline-block mr-2" />
                Location
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2 sm:p-2.5 md:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Location</option>
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Type Selection */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building2 className="w-4 h-4 inline-block mr-2" />
                Project Type
              </label>
              <select
                name="projectType"
                value={formData.projectType}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Project Type</option>
                {projectTypes.map(type => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Building Type Selection */}
            {formData.projectType && (
              <div className="form-group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline-block mr-2" />
                  Building Type
                </label>
                <select
                  name="buildingType"
                  value={formData.buildingType}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Building Type</option>
                  {buildingTypes[formData.projectType]?.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Data Period Selection */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Data Period
              </label>
              <select
                name="dataPeriod"
                value={formData.dataPeriod}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Period</option>
                {quarters.map(quarter => (
                  <option key={quarter.value} value={quarter.value}>
                    {quarter.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Construction Phase */}
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Layers className="w-4 h-4 inline-block mr-2" />
                Construction Phase
              </label>
              <select
                name="constructionPhase"
                value={formData.constructionPhase}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Phase</option>
                {constructionPhases.map(phase => (
                  <option key={phase} value={phase}>
                    {phase}
                  </option>
                ))}
              </select>
            </div>

            {estimationType === 'manual' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Area (square kilometers)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      name="area.total"
                      value={formData.area.total}
                      onChange={handleInputChange}
                      placeholder="Enter total area"
                      className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="text-gray-600 text-sm">km²</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the total area of your project in square kilometers
                  </p>
                </div>
              </div>
            )}

            {estimationType === 'upload' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <input
                    type="file"
                    id="planUpload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.dwg,.dxf,.ifc"
                  />
                  <label
                    htmlFor="planUpload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                    <span className="text-gray-600">
                      {uploadedFile ? uploadedFile.name : 'Upload your plan'}
                    </span>
                    <span className="text-sm text-gray-500 mt-1">
                      Supported formats: PDF, DWG, DXF, IFC
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Specifications */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Additional Specifications
          </label>
          <textarea
            name="specifications"
            value={formData.specifications}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter any additional specifications or requirements..."
          />
        </div>

        {/* Generate Button */}
        <div className="flex justify-center">
          <button
            onClick={generateEstimate}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Estimate...
              </>
            ) : (
              <>
                <Calculator className="w-5 h-5" />
                Generate Estimate
              </>
            )}
          </button>
        </div>

        {/* Results Section */}
        {estimate && (
          <motion.div
            id="results-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <div className="bg-white rounded-lg shadow-lg">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-6">Estimate Results</h2>
                <CostSummary estimateData={estimate} />
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Debug Information - Remove in production */}
        {estimate && (
          <div className="mt-4 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">Debug - Estimate Data:</p>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify(estimate, null, 2)}
            </pre>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default MaterialEstimation;