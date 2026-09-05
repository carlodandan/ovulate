const CycleHistory = ({ cycles = [], onDeleteCycle }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateCycleStats = () => {
    if (cycles.length < 2) return null;
    
    const lengths = cycles.map(cycle => cycle.cycleLength || 28);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    
    // Calculate standard deviation
    const variance = lengths.reduce((acc, length) => 
      acc + Math.pow(length - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate ovulation days for each cycle
    const ovulationDays = cycles.map(cycle => 
      (cycle.cycleLength || 28) - (cycle.lutealPhase || 14)
    );
    const avgOvulationDay = ovulationDays.reduce((a, b) => a + b, 0) / ovulationDays.length;
    
    return {
      avgLength: avgLength.toFixed(1),
      stdDev: stdDev.toFixed(1),
      minLength: Math.min(...lengths),
      maxLength: Math.max(...lengths),
      avgOvulationDay: avgOvulationDay.toFixed(1)
    };
  };

  const stats = calculateCycleStats();

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-heading tracking-tight">
              Cycle Records
            </h2>
            <p className="text-xs text-gray-500">Historical logs and variability analytics</p>
          </div>
        </div>
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          {cycles.length} record{cycles.length === 1 ? '' : 's'}
        </span>
      </div>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
          <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-xl">
            <p className="text-[11px] font-semibold text-purple-700 uppercase tracking-wider">Average Cycle</p>
            <p className="text-lg sm:text-xl font-extrabold text-purple-900 mt-0.5">{stats.avgLength} <span className="text-xs font-normal text-purple-600">days</span></p>
          </div>
          <div className="bg-sky-50/70 border border-sky-100 p-3 rounded-xl">
            <p className="text-[11px] font-semibold text-sky-700 uppercase tracking-wider">Variation</p>
            <p className="text-lg sm:text-xl font-extrabold text-sky-900 mt-0.5">±{stats.stdDev} <span className="text-xs font-normal text-sky-600">days</span></p>
          </div>
          <div className="bg-amber-50/70 border border-amber-100 p-3 rounded-xl">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Avg Ovulation</p>
            <p className="text-lg sm:text-xl font-extrabold text-amber-900 mt-0.5">Day {stats.avgOvulationDay}</p>
          </div>
          <div className="bg-rose-50/70 border border-rose-100 p-3 rounded-xl">
            <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Cycle Range</p>
            <p className="text-lg sm:text-xl font-extrabold text-rose-900 mt-0.5">{stats.minLength}–{stats.maxLength} <span className="text-xs font-normal text-rose-600">days</span></p>
          </div>
        </div>
      )}

      <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1.5 custom-scrollbar">
        {cycles.slice().reverse().map((cycle) => {
          const cycleLength = cycle.cycleLength || 28;
          const lutealPhase = cycle.lutealPhase || 14;
          const ovulationDay = cycleLength - lutealPhase;
          
          return (
            <div 
              key={cycle.id} 
              className="group bg-white border border-gray-100 hover:border-rose-200 rounded-xl p-3 sm:p-3.5 shadow-2xs hover:shadow-xs transition-all duration-150"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      {formatDate(cycle.startDate)}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px] font-medium">
                      Cycle: {cycleLength}d
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-100 text-[11px] font-medium">
                      Period: {cycle.periodLength || 5}d
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-100 text-[11px] font-medium">
                      Ovulation: Day {ovulationDay}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100 text-[11px] font-medium">
                      Luteal: {lutealPhase}d
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteCycle(cycle.id)}
                  className="cursor-pointer text-gray-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  title="Delete cycle record"
                  aria-label="Delete cycle record"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CycleHistory;