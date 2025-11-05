import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, AlertCircle, X } from 'lucide-react';
import Button from './Button';

const PlanUploader = ({ onUpload, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size should not exceed 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
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

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      await onUpload(selectedFile);
      // Reset state after successful upload
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = null;
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = null;
    onCancel?.();
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : error
            ? 'border-red-300 bg-red-50'
            : 'border-gray-300 hover:border-primary-400 bg-white'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <div className="flex flex-col items-center">
          <UploadCloud
            className={`w-12 h-12 mb-4 ${
              error ? 'text-red-400' : 'text-gray-400'
            }`}
          />
          <p className="text-base font-medium text-gray-700">
            {isDragging
              ? 'Drop your file here'
              : 'Drag & drop your Excel plan here'}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            or click to browse from your computer
          </p>
          {selectedFile && (
            <div className="mt-4 flex items-center p-2 rounded-md bg-gray-50">
              <FileText className="w-5 h-5 text-primary-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {selectedFile.name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancel();
                }}
                className="ml-2 p-1 hover:bg-gray-200 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start p-3 rounded-md bg-red-50 text-red-700">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls"
        className="hidden"
        onChange={onFileSelected}
      />

      <div className="flex space-x-3">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile}
          className="flex-1"
        >
          Upload & Create Estimate
        </Button>
        <Button
          variant="secondary"
          onClick={handleCancel}
          className="flex-1"
        >
          Cancel
        </Button>
      </div>

      <div className="mt-4 p-4 rounded-md bg-blue-50 text-sm text-blue-700">
        <h4 className="font-medium mb-2">Excel Plan Requirements:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Use sheets named 'Estimate' and 'Items' for project details</li>
          <li>Include columns: Item, Quantity, Unit, Unit Price</li>
          <li>Maximum file size: 5MB</li>
          <li>Supported formats: .xlsx, .xls</li>
        </ul>
      </div>
    </div>
  );
};

export default PlanUploader;