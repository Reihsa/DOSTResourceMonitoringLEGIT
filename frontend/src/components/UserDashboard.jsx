import React, { useState } from 'react';
import ElectricityModal from './ElectricityUploadModal.jsx'; // Adjust path if needed

export default function UserDashboard() {
  const [screen, setScreen] = useState('main');
  const [showElectricityModal, setShowElectricityModal] = useState(false);

  // Main dashboard with Electricity and Fuel buttons
  if (screen === 'main') {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">User Dashboard</h2>
        <div className="flex gap-4">
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors" onClick={() => setScreen('electricity')}>
            Upload Electricity
          </button>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors" onClick={() => setScreen('fuel')}>
            Upload Fuel
          </button>
        </div>
      </div>
    );
  }

  // Electricity screen with Back and Upload Monthly Consumption buttons
  if (screen === 'electricity') {
    return (
      <div>
        <button className="btn mb-4" onClick={() => setScreen('main')}>Back</button>
        <h2 className="text-xl font-bold mb-2">Electricity</h2>
        <button
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors"
          onClick={() => setShowElectricityModal(true)}
        >
          Upload Monthly Consumption
        </button>
        {showElectricityModal && (
          <ElectricityModal open={showElectricityModal} onClose={() => setShowElectricityModal(false)} />
        )}
      </div>
    );
  }

  // Fuel screen placeholder
  if (screen === 'fuel') {
    return (
      <div>
        <button className="btn mb-4" onClick={() => setScreen('main')}>Back</button>
        <h2 className="text-xl font-bold mb-2">Fuel</h2>
        <button className="btn" onClick={() => alert('Fuel upload feature coming soon!')}>
          Upload Monthly Consumption
        </button>
      </div>
    );
  }

  return null;
}