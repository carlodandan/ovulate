import React, { useState } from 'react';

const Header = ({ cycles }) => {

  const getCycleStats = () => {
    if (cycles.length === 0) {
      return {
        totalCycles: 0,
        avgCycleLength: 0,
        trackingSince: null
      };
    }

    const lengths = cycles.map(cycle => cycle.cycleLength || 28);
    const avgLength = lengths.reduce((a, b) => a + b) / lengths.length;
    
    const earliestDate = cycles.reduce((earliest, cycle) => {
      const cycleDate = new Date(cycle.startDate);
      return cycleDate < earliest ? cycleDate : earliest;
    }, new Date(cycles[0].startDate));

    return {
      totalCycles: cycles.length,
      avgCycleLength: avgLength.toFixed(1),
      trackingSince: earliestDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl mb-8 md:mb-12 overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* App Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-xl shadow-md">
              <img
                src="/icons/ms-icon-310x310.png"
                alt="Logo"
                className="w-10 h-10"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Ovulate</h1>
              <p className="text-purple-100 text-sm md:text-base">
                Menstrual Cycle Tracker
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;