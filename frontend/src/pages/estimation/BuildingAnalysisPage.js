import React, { useState } from 'react';

const BuildingAnalysisPage = () => {
  const [buildingDetails, setBuildingDetails] = useState({
    type: '',
    location: '',
    totalArea: '',
    floors: '',
    finishingLevel: 'standard',
    terrain: 'flat',
    soilType: '',
  });

  const buildingTypes = [
    'Residential - Single Family',
    'Residential - Multi Family',
    'Commercial - Office',
    'Commercial - Retail',
    'Industrial',
    'Institutional',
  ];

  const counties = [
    'Nairobi',
    'Mombasa',
    'Kisumu',
    'Nakuru',
    'Eldoret',
    // Add more counties...
  ];

  const finishingLevels = [
    { value: 'basic', label: 'Basic Finishing' },
    { value: 'standard', label: 'Standard Finishing' },
    { value: 'luxury', label: 'Luxury Finishing' },
  ];

  const terrainTypes = [
    { value: 'flat', label: 'Flat' },
    { value: 'sloped', label: 'Sloped' },
    { value: 'hilly', label: 'Hilly' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBuildingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Building Analysis</h1>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Building Type
              </label>
              <select
                name="type"
                value={buildingDetails.type}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select Building Type</option>
                {buildingTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location (County)
              </label>
              <select
                name="location"
                value={buildingDetails.location}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select County</option>
                {counties.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Built-up Area (sq. meters)
              </label>
              <input
                type="number"
                name="totalArea"
                value={buildingDetails.totalArea}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Enter total area"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Floors
              </label>
              <input
                type="number"
                name="floors"
                value={buildingDetails.floors}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Enter number of floors"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Finishing Level
              </label>
              <select
                name="finishingLevel"
                value={buildingDetails.finishingLevel}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
              >
                {finishingLevels.map(level => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terrain Type
              </label>
              <select
                name="terrain"
                value={buildingDetails.terrain}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
              >
                {terrainTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Soil Type
              </label>
              <input
                type="text"
                name="soilType"
                value={buildingDetails.soilType}
                onChange={handleInputChange}
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Enter soil type"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={() => {/* TODO: Integrate with Gemini API */}}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate AI Analysis
          </button>
        </div>

        {/* AI Analysis Results Section - To be populated by Gemini API */}
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">AI Analysis Results</h2>
          <p className="text-gray-600">
            Analysis will appear here after clicking the Generate button...
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuildingAnalysisPage;