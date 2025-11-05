import React, { useState, useEffect } from 'react';
import api from '../utils/axiosConfig';
import { useAuth } from '../contexts/AuthContext';

const DataGenerationPage = () => {
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedLocation, setSelectedLocation] = useState('');
    const [generatedData, setGeneratedData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    // ...existing code...
    const { token } = useAuth();
    
    // Construction-specific state
    const [adjustmentFactors, setAdjustmentFactors] = useState({
        labor: 1.0,
        materials: 1.0,
        equipment: 1.0,
        location: 1.0
    });

    useEffect(() => {
        fetchTemplates();
        fetchGeneratedData();
    }, []);

    const fetchTemplates = async () => {
        try {
            const response = await api.get('/api/templates/');
            setTemplates(response.data);
        } catch (error) {
            setError('Failed to fetch templates');
            console.error('Error fetching templates:', error);
        }
    };

    const fetchGeneratedData = async () => {
        try {
            const response = await api.get('/api/generated-data/');
            setGeneratedData(response.data);
        } catch (error) {
            setError('Failed to fetch generated data');
            console.error('Error fetching generated data:', error);
        }
    };

    const handleTemplateUpload = async (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);

        try {
            setIsLoading(true);
            const response = await api.post('/api/templates/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
            setTemplates([...templates, response.data]);
            setError(null);
        } catch (error) {
            setError('Failed to upload template');
            console.error('Error uploading template:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateData = async () => {
        if (!selectedTemplate) {
            setError('Please select a template');
            return;
        }
        
        if (!selectedLocation) {
            setError('Please select a location');
            return;
        }

        try {
            setIsLoading(true);
            const response = await api.post(
                `/api/templates/${selectedTemplate}/generate_data/`,
                { 
                    year: selectedYear,
                    location: selectedLocation,
                    adjustmentFactors: adjustmentFactors
                }
            );
            setGeneratedData([...generatedData, ...response.data.files]);
            setError(null);
        } catch (error) {
            setError('Failed to generate data');
            console.error('Error generating data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (fileUrl) => {
        try {
            const response = await api.get(fileUrl, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileUrl.split('/').pop());
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            setError('Failed to download file');
            console.error('Error downloading file:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Data Generation System</h1>

            {/* Template Upload Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Upload Template</h2>
                <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleTemplateUpload}
                    className="block w-full text-sm text-gray-500 mb-4
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                />
            </div>

            {/* Data Generation Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="text-xl font-semibold mb-4">Generate Construction Cost Data</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                        <select
                            value={selectedTemplate || ''}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            className="block w-full p-2 border rounded"
                        >
                            <option value="">Select Template</option>
                            {templates.map(template => (
                                <option key={template.id} value={template.id}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="block w-full p-2 border rounded"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="block w-full p-2 border rounded"
                        >
                            <option value="">Select Location</option>
                            <option value="nairobi">Nairobi</option>
                            <option value="mombasa">Mombasa</option>
                            <option value="kisumu">Kisumu</option>
                            <option value="nakuru">Nakuru</option>
                        </select>
                    </div>
                </div>
                
                {/* Cost Adjustment Factors */}
                <div className="mt-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">Cost Adjustment Factors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Labor</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.5"
                                max="2"
                                value={adjustmentFactors.labor}
                                onChange={(e) => setAdjustmentFactors({
                                    ...adjustmentFactors,
                                    labor: parseFloat(e.target.value)
                                })}
                                className="block w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Materials</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.5"
                                max="2"
                                value={adjustmentFactors.materials}
                                onChange={(e) => setAdjustmentFactors({
                                    ...adjustmentFactors,
                                    materials: parseFloat(e.target.value)
                                })}
                                className="block w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Equipment</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.5"
                                max="2"
                                value={adjustmentFactors.equipment}
                                onChange={(e) => setAdjustmentFactors({
                                    ...adjustmentFactors,
                                    equipment: parseFloat(e.target.value)
                                })}
                                className="block w-full p-2 border rounded"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location Factor</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0.5"
                                max="2"
                                value={adjustmentFactors.location}
                                onChange={(e) => setAdjustmentFactors({
                                    ...adjustmentFactors,
                                    location: parseFloat(e.target.value)
                                })}
                                className="block w-full p-2 border rounded"
                            />
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleGenerateData}
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    {isLoading ? 'Generating...' : 'Generate Data'}
                </button>
            </div>

            {/* Generated Data List */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Generated Data</h2>
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Template
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Year
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Quarter
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {generatedData.map((data) => (
                                <tr key={data.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {data.template_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {data.year}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {data.quota_period}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleDownload(data.generated_file)}
                                            className="text-blue-600 hover:text-blue-900"
                                        >
                                            Download
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DataGenerationPage;