import React from 'react';

// A lightweight animated walkthrough using CSS animations and simple DOM
const WalkthroughPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Quick Walkthrough</h1>

      <p className="mb-6 text-gray-600">A short, in-app animated demo that shows the main flow: register → login → create estimate (form or upload) → generate report.</p>

      <div className="space-y-6">
        <div className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-2">1. Create an account</h3>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-12 bg-indigo-50 rounded flex items-center justify-center animate-pulse">✉️</div>
            <div>
              <p className="text-sm text-gray-600">Sign up with your email and phone. Verify OTP to activate your account.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-2">2. Start a new estimate</h3>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-12 bg-green-50 rounded flex items-center justify-center transform transition-transform hover:-translate-y-1">🧾</div>
            <div>
              <p className="text-sm text-gray-600">Use the manual form or upload an Excel plan. The upload parser reads a sheet named "Estimate" and an "Items" sheet for line items.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded shadow p-6">
          <h3 className="font-semibold mb-2">3. Review and generate report</h3>
          <div className="flex items-center space-x-4">
            <div className="w-20 h-12 bg-yellow-50 rounded flex items-center justify-center animate-bounce">📊</div>
            <div>
              <p className="text-sm text-gray-600">Preview calculated totals and export a report or share with a link.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">To export a short video, record this page with your favorite screen capture tool (e.g., OBS, QuickTime) while you interact with it. For a stylized, shareable animation we can create an MP4 using recorded screenshots and a quick narration script—tell me if you want that and your preferred resolution.</p>
        </div>
      </div>
    </div>
  );
};

export default WalkthroughPage;
