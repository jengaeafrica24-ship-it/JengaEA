import React, { useState } from 'react';

const LabourCostsPage = () => {
  const [laborCategories, setLaborCategories] = useState([
    {
      category: 'Skilled Labor',
      roles: [
        { title: 'Mason', dailyRate: 0, days: 0 },
        { title: 'Carpenter', dailyRate: 0, days: 0 },
        { title: 'Electrician', dailyRate: 0, days: 0 },
        { title: 'Plumber', dailyRate: 0, days: 0 }
      ]
    },
    {
      category: 'Unskilled Labor',
      roles: [
        { title: 'General Worker', dailyRate: 0, days: 0 },
        { title: 'Helper', dailyRate: 0, days: 0 }
      ]
    },
    {
      category: 'Supervision',
      roles: [
        { title: 'Site Supervisor', dailyRate: 0, days: 0 },
        { title: 'Project Manager', dailyRate: 0, days: 0 }
      ]
    }
  ]);

  const calculateCategoryTotal = (roles) => {
    return roles.reduce((total, role) => total + (role.dailyRate * role.days), 0);
  };

  const calculateGrandTotal = () => {
    return laborCategories.reduce((total, category) => 
      total + calculateCategoryTotal(category.roles), 0
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Labour Cost Estimation</h1>
        
        <div className="space-y-8">
          {laborCategories.map((category, categoryIndex) => (
            <div key={category.category}>
              <h2 className="text-lg font-semibold text-gray-700 mb-4">
                {category.category}
              </h2>
              
              <div className="grid grid-cols-4 gap-4 font-medium text-gray-600 mb-2">
                <div>Role</div>
                <div>Daily Rate (KES)</div>
                <div>Days Required</div>
                <div>Total Cost</div>
              </div>

              {category.roles.map((role, roleIndex) => (
                <div key={role.title} className="grid grid-cols-4 gap-4 items-center mb-4">
                  <div>{role.title}</div>
                  <div className="flex items-center">
                    <span className="mr-2">KES</span>
                    <input
                      type="number"
                      value={role.dailyRate}
                      onChange={(e) => {
                        const newCategories = [...laborCategories];
                        newCategories[categoryIndex].roles[roleIndex].dailyRate = 
                          parseFloat(e.target.value);
                        setLaborCategories(newCategories);
                      }}
                      className="border rounded px-3 py-2 w-full"
                      min="0"
                    />
                  </div>
                  <input
                    type="number"
                    value={role.days}
                    onChange={(e) => {
                      const newCategories = [...laborCategories];
                      newCategories[categoryIndex].roles[roleIndex].days = 
                        parseFloat(e.target.value);
                      setLaborCategories(newCategories);
                    }}
                    className="border rounded px-3 py-2"
                    min="0"
                  />
                  <div>
                    KES {(role.dailyRate * role.days).toLocaleString()}
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 mt-4">
                <div className="flex justify-end items-center text-gray-700">
                  <span className="font-medium mr-4">Category Total:</span>
                  <span className="font-semibold">
                    KES {calculateCategoryTotal(category.roles).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <div className="border-t pt-6 mt-8">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Labour Cost:</span>
              <span className="text-xl font-bold text-blue-600">
                KES {calculateGrandTotal().toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => {/* TODO: Integrate with Gemini API */}}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get AI Labour Optimization
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabourCostsPage;