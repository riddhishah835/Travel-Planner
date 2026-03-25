import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Your Trips</h1>
      <div className="text-gray-600">
        You do not have any trips planned yet. Click the button below to start planning!
      </div>
      <button className="bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 shadow-md transition-all">
        Create a New Trip
      </button>
    </div>
  );
};

export default Dashboard;
