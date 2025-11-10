import React from 'react';
import { Outlet } from 'react-router-dom';
import EstimationSidebar from '../components/estimation/EstimationSidebar';

const EstimationLayout = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <EstimationSidebar />
      <div className="flex-1 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default EstimationLayout;