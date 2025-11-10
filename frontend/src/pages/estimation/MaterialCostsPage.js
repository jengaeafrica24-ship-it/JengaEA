import React, { useState } from 'react';

const MaterialCostsPage = () => {
  const [materials, setMaterials] = useState([
    { name: 'Cement', unit: 'Bags', quantity: 0, pricePerUnit: 0 },
    { name: 'Sand', unit: 'Tons', quantity: 0, pricePerUnit: 0 },
    { name: 'Steel', unit: 'Tons', quantity: 0, pricePerUnit: 0 },
    { name: 'Bricks', unit: 'Pieces', quantity: 0, pricePerUnit: 0 }
  ]);

  const handleQuantityChange = (index, value) => {
    const newMaterials = [...materials];
    newMaterials[index].quantity = value;
    setMaterials(newMaterials);
  };

  const calculateTotal = () => {
    return materials.reduce((total, material) => 
      total + (material.quantity * material.pricePerUnit), 0
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-6">Material Cost Estimation</h1>
        
        <div className="space-y-6">
          <div className="grid grid-cols-5 gap-4 font-semibold text-gray-700 mb-4">
            <div>Material</div>
            <div>Unit</div>
            <div>Quantity</div>
            <div>Price/Unit (KES)</div>
            <div>Total</div>
          </div>

          {materials.map((material, index) => (
            <div key={material.name} className="grid grid-cols-5 gap-4 items-center">
              <div>{material.name}</div>
              <div>{material.unit}</div>
              <input
                type="number"
                value={material.quantity}
                onChange={(e) => handleQuantityChange(index, parseFloat(e.target.value))}
                className="border rounded px-3 py-2"
                min="0"
              />
              <div className="flex items-center">
                <span className="mr-2">KES</span>
                <input
                  type="number"
                  value={material.pricePerUnit}
                  onChange={(e) => {
                    const newMaterials = [...materials];
                    newMaterials[index].pricePerUnit = parseFloat(e.target.value);
                    setMaterials(newMaterials);
                  }}
                  className="border rounded px-3 py-2 w-full"
                  min="0"
                />
              </div>
              <div>
                KES {(material.quantity * material.pricePerUnit).toLocaleString()}
              </div>
            </div>
          ))}

          <div className="border-t pt-4 mt-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Material Cost:</span>
              <span className="text-xl font-bold text-blue-600">
                KES {calculateTotal().toLocaleString()}
              </span>
            </div>
          </div>

          <button
            onClick={() => {/* TODO: Integrate with Gemini API */}}
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get AI Recommendations
          </button>
        </div>
      </div>
    </div>
  );
};

export default MaterialCostsPage;