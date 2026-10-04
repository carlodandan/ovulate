const Header = ({
  cycles = [],
  dailyEntriesCount = 0,
  mode = 'standard',
  onToggleMode,
  onClearAllData
}) => {
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
  const hasAnyData = cycles.length > 0 || dailyEntriesCount > 0;

  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#701A75] text-white rounded-3xl shadow-lg mb-6 md:mb-8 border border-white/10">
      {/* Decorative ambient background glows */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-400/15 rounded-full blur-2xl pointer-events-none" />

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
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-rose-100 border border-white/20 backdrop-blur-xs">
                  Zero Telemetry
                </span>
              </div>
              <p className="text-rose-100/90 text-xs sm:text-sm font-medium tracking-wide mt-0.5">
                Menstrual Cycle & Fertility Intelligence
              </p>
            </div>
          </div>

          {/* Mode Switcher, Quick Metrics & Reset Button (All in 1 line on mobile & desktop) */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-nowrap overflow-x-auto sm:overflow-visible custom-scrollbar w-full lg:w-auto py-0.5">
            {/* Mode Switcher Segmented Control */}
            {onToggleMode && (
              <div 
                role="radiogroup" 
                aria-label="Tracking Mode"
                className="inline-flex items-center rounded-2xl bg-black/25 p-0.5 sm:p-1 border border-white/15 backdrop-blur-md min-h-[42px] sm:min-h-[46px] shrink-0"
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'standard'}
                  onClick={() => onToggleMode('standard')}
                  className={`cursor-pointer min-h-[34px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all touch-manipulation flex items-center gap-1 sm:gap-1.5 ${
                    mode === 'standard'
                      ? 'bg-white text-rose-900 shadow-sm scale-[1.02]'
                      : 'text-white/80 hover:text-white hover:bg-white/10 active:scale-[0.98]'
                  }`}
                  title="Standard predictive cycle tracking"
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Standard</span>
                </button>
                <button
                  type="button"
                  role="radio"
                  aria-checked={mode === 'journal'}
                  onClick={() => onToggleMode('journal')}
                  className={`cursor-pointer min-h-[34px] sm:min-h-[38px] px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs font-bold transition-all touch-manipulation flex items-center gap-1 sm:gap-1.5 ${
                    mode === 'journal'
                      ? 'bg-white text-purple-900 shadow-sm scale-[1.02]'
                      : 'text-white/80 hover:text-white hover:bg-white/10 active:scale-[0.98]'
                  }`}
                  title="Daily Journal tracking for actual flow and symptoms"
                >
                  <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Journal</span>
                  {dailyEntriesCount > 0 && (
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400 ml-0.5 shadow-2xs" />
                  )}
                </button>
              </div>
            )}

            {/* Quick Metrics */}
            {mode === 'journal' ? (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/25 backdrop-blur-md px-2.5 sm:px-4 min-h-[42px] sm:min-h-[46px] rounded-2xl border border-white/15 shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="block text-[10px] uppercase font-semibold text-purple-200/90 leading-tight whitespace-nowrap">
                  Days <span className="text-xs sm:text-sm font-bold text-white leading-none"> {dailyEntriesCount}</span>
                </span>
              </div>
            ) : stats ? (
              <>
                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/25 backdrop-blur-md px-2.5 sm:px-3.5 min-h-[42px] sm:min-h-[46px] rounded-2xl border border-white/15 shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="block text-[10px] uppercase font-semibold text-rose-200/90 leading-tight whitespace-nowrap">
                    Cycles <span className="text-xs sm:text-sm font-bold text-white leading-none"> {stats.totalCycles}</span>
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/25 backdrop-blur-md px-2.5 sm:px-3.5 min-h-[42px] sm:min-h-[46px] rounded-2xl border border-white/15 shrink-0">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="block text-[10px] uppercase font-semibold text-purple-200/90 leading-tight whitespace-nowrap">
                    Avg <span className="text-xs sm:text-sm font-bold text-white leading-none"> {stats.avgCycleLength}d</span>
                  </span>
                </div>
              </>
            ) : null}

            {/* Reset button (Circle Arrow Icon - same line on all screen sizes) */}
            {onClearAllData && hasAnyData && (
              <button
                type="button"
                onClick={onClearAllData}
                className="cursor-pointer ml-auto lg:ml-0 inline-flex items-center justify-center w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] rounded-2xl bg-black/25 hover:bg-black/40 active:scale-95 text-white/90 hover:text-white border border-white/15 backdrop-blur-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/40 shrink-0"
                title="Reset all stored cycle records"
                aria-label="Reset all stored cycle records"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;