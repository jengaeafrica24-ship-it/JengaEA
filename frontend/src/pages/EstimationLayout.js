import React from 'react';
import EstimationSidebar from '../components/estimation/EstimationSidebar';

const EstimationLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <EstimationSidebar />
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
};

export default EstimationLayout;