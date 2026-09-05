import React from 'react';

const Header = ({ cycles = [], onClearAllData }) => {
  const getCycleStats = () => {
    if (cycles.length === 0) {
      return null;
    }

    const lengths = cycles.map(cycle => cycle.cycleLength || 28);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    
    const earliestDate = cycles.reduce((earliest, cycle) => {
      const cycleDate = new Date(cycle.startDate);
      return cycleDate < earliest ? cycleDate : earliest;
    }, new Date(cycles[0].startDate));

    return {
      totalCycles: cycles.length,
      avgCycleLength: avgLength.toFixed(0),
      trackingSince: earliestDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    };
  };

  const stats = getCycleStats();

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-rose-700 via-pink-600 to-purple-700 text-white rounded-3xl shadow-xl mb-6 md:mb-10 border border-white/15">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 px-5 py-5 sm:px-8 sm:py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* App Brand */}
          <div className="flex items-center gap-3.5">
            <div className="relative p-2.5 bg-white/95 rounded-2xl shadow-md ring-1 ring-black/5 flex items-center justify-center shrink-0">
              <img
                src="/logos/ovulate@512x512-nobg.png"
                alt="Ovulate Logo"
                className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <svg 
                className="w-9 h-9 sm:w-11 sm:h-11 text-rose-600 hidden" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-heading">
                  Ovulate
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white border border-white/25">
                  Privacy First
                </span>
              </div>
              <p className="text-rose-100/90 text-xs sm:text-sm font-medium tracking-wide mt-0.5">
                Menstrual Cycle & Fertility Intelligence
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {stats && (
              <>
                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20">
                  <svg className="w-4 h-4 text-rose-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] uppercase font-semibold text-rose-200/90 leading-tight">Cycles</span>
                    <span className="text-sm font-bold text-white leading-none">{stats.totalCycles}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20">
                  <svg className="w-4 h-4 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <span className="block text-[10px] uppercase font-semibold text-purple-200/90 leading-tight">Avg Length</span>
                    <span className="text-sm font-bold text-white leading-none">{stats.avgCycleLength}d</span>
                  </div>
                </div>
              </>
            )}

            {onClearAllData && cycles.length > 0 && (
              <button
                type="button"
                onClick={onClearAllData}
                className="cursor-pointer ml-auto lg:ml-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white border border-white/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40"
                title="Reset all stored cycle records"
              >
                <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;