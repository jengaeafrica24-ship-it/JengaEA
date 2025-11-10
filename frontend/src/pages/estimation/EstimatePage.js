import React from 'react';
import { Routes, Route } from 'react-router-dom';
import EstimateForm from '../../components/estimation/EstimateForm';
import MaterialCostPage from './MaterialCostPage';
import EstimationSidebar from '../../components/estimation/EstimationSidebar';

const EstimatePage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <EstimationSidebar />
      <div className="flex-1">
        <Routes>
          <Route path="materials" element={<MaterialCostPage />} />
          <Route path="/" element={
            <div className="max-w-7xl mx-auto py-12">
              <EstimateForm />
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
};

export default EstimatePage;