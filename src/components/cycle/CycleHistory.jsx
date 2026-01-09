const CycleHistory = ({ cycles, onDeleteCycle }) => {
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
    const avgLength = lengths.reduce((a, b) => a + b) / lengths.length;
    
    // Calculate standard deviation
    const variance = lengths.reduce((acc, length) => 
      acc + Math.pow(length - avgLength, 2), 0) / lengths.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate ovulation days for each cycle
    const ovulationDays = cycles.map(cycle => 
      (cycle.cycleLength || 28) - (cycle.lutealPhase || 14)
    );
    const avgOvulationDay = ovulationDays.reduce((a, b) => a + b) / ovulationDays.length;
    
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-purple-700">Cycle History</h2>
        <span className="text-sm text-gray-500">{cycles.length} records</span>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 p-4 rounded-xl">
            <p className="text-sm text-purple-600">Average Cycle</p>
            <p className="text-xl font-bold text-purple-800">{stats.avgLength} days</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl">
            <p className="text-sm text-blue-600">Variation</p>
            <p className="text-xl font-bold text-blue-800">±{stats.stdDev} days</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-xl">
            <p className="text-sm text-yellow-600">Avg Ovulation</p>
            <p className="text-xl font-bold text-yellow-800">Day {stats.avgOvulationDay}</p>
          </div>
          <div className="bg-pink-50 p-4 rounded-xl">
            <p className="text-sm text-pink-600">Period Range</p>
            <p className="text-xl font-bold text-pink-800">{stats.minLength}-{stats.maxLength}</p>
          </div>
        </div>
      )}

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
        {cycles.slice().reverse().map((cycle) => {
          const cycleLength = cycle.cycleLength || 28;
          const lutealPhase = cycle.lutealPhase || 14;
          const ovulationDay = cycleLength - lutealPhase;
          
          return (
            <div 
              key={cycle.id} 
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">
                    {formatDate(cycle.startDate)}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm text-gray-600">
                    <span>Cycle: {cycleLength} days</span>
                    <span>Period: {cycle.periodLength || 5} days</span>
                    <span>Ovulation: Day {ovulationDay}</span>
                    <span>Luteal: {lutealPhase} days</span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteCycle(cycle.id)}
                  className="text-red-500 hover:text-red-700 p-1 ml-2"
                  title="Delete cycle"
                >
                  🗑️
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