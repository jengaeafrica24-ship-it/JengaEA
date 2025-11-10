import React from 'react';
import { Route } from 'react-router-dom';

// Layout
import EstimationLayout from '../pages/EstimationLayout';

// Pages
import MaterialCostsPage from '../pages/estimation/MaterialCostsPage';
import LabourCostsPage from '../pages/estimation/LabourCostsPage';
import BuildingAnalysisPage from '../pages/estimation/BuildingAnalysisPage';
import MarketAnalysisPage from '../pages/estimation/MarketAnalysisPage';

const EstimationRoutes = [
  <Route key="estimation" path="/estimation" element={<EstimationLayout />}>
    <Route path="materials" element={<MaterialCostsPage />} />
    <Route path="labour" element={<LabourCostsPage />} />
    <Route path="building" element={<BuildingAnalysisPage />} />
    <Route path="market" element={<MarketAnalysisPage />} />
  </Route>
];

export default EstimationRoutes;