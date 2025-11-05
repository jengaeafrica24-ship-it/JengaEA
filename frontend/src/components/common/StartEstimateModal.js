import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';

// Lightweight modal implementation to avoid external dependency
const StartEstimateModal = ({ isOpen, onRequestClose, template, locations = [], defaultLocationId = null, onConfirm, loading }) => {
  const [locationId, setLocationId] = useState(defaultLocationId || '');
  const [totalArea, setTotalArea] = useState(template?.total_area || 100);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    setLocationId(defaultLocationId || (locations[0]?.id ?? ''));
  }, [defaultLocationId, locations, isOpen]);

  useEffect(() => {
    setTotalArea(template?.total_area || 100);
  }, [template]);

  useEffect(() => {
    if (isOpen) {
      // prevent background scroll when modal open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleConfirm = () => {
    setLocalError(null);
    if (!locationId) {
      setLocalError('Please select a location');
      return;
    }
    if (!totalArea || Number(totalArea) <= 0) {
      setLocalError('Total area must be greater than zero');
      return;
    }

    onConfirm({ location: locationId, total_area: Number(totalArea) });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={onRequestClose} />

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-xl mx-4 p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold">Start Estimate</h3>
          <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
            <div className="p-3 bg-gray-50 rounded">{template?.name}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (County)</label>
            <select
              className="input w-full"
              value={locationId || ''}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="">Select county</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.county_name || loc.name || loc.county}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Area (sqm)</label>
            <Input type="number" value={totalArea} onChange={(e) => setTotalArea(e.target.value)} />
          </div>

          {localError && <p className="text-sm text-red-600">{localError}</p>}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <Button variant="ghost" onClick={onRequestClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading ? 'Starting...' : 'Start Estimate'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StartEstimateModal;
