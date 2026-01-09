import { useCyclePredictions } from '../../hooks/useCyclePredictions';

const Predictions = ({ cycles }) => {
  const { 
    hasData, 
    currentPredictions, 
    lastCycle,
    ovulationDay,
    cycleInfo 
  } = useCyclePredictions(cycles);

  if (!hasData) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">📅</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No Data Yet</h2>
        <p className="text-gray-600">Add your cycle details to see predictions</p>
      </div>
    );
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (date) => {
    const today = new Date();
    const target = new Date(date);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilPeriod = getDaysUntil(currentPredictions.nextPeriodStart);
  const daysUntilOvulation = getDaysUntil(currentPredictions.ovulationDate);
  const daysUntilFertileStart = getDaysUntil(currentPredictions.fertileWindow.start);

  return (
    <div>
      <h2 className="text-xl font-semibold text-purple-700 mb-6">Predictions</h2>
      
      <div className="space-y-6">
        {/* Next Period */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-pink-100">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-red-500">🩸</span>
            </div>
            <h3 className="font-semibold text-gray-800">Next Period</h3>
          </div>
          <p className="text-2xl font-bold text-red-600 mb-1">
            {formatDate(currentPredictions.nextPeriodStart)}
          </p>
          <p className="text-sm text-gray-600">
            {daysUntilPeriod > 0 
              ? `In ${daysUntilPeriod} days`
              : daysUntilPeriod === 0 
                ? 'Today' 
                : `${Math.abs(daysUntilPeriod)} days ago`}
          </p>
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            Based on: {new Date(lastCycle.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            , {cycleInfo.cycleLength}-day cycle
          </div>
        </div>

        {/* Ovulation */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-yellow-100">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-yellow-600">🥚</span>
            </div>
            <h3 className="font-semibold text-gray-800">Ovulation Day</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mb-1">
            {formatDate(currentPredictions.ovulationDate)}
          </p>
          <p className="text-sm text-gray-600">
            {daysUntilOvulation > 0 
              ? `In ${daysUntilOvulation} days`
              : daysUntilOvulation === 0 
                ? 'Today' 
                : `${Math.abs(daysUntilOvulation)} days ago`}
          </p>
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            Day {ovulationDay} of cycle ({cycleInfo.cycleLength} - {cycleInfo.lutealPhase})
          </div>
        </div>

        {/* Fertile Window */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-green-100">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-green-600">📈</span>
            </div>
            <h3 className="font-semibold text-gray-800">Fertile Window</h3>
          </div>
          <p className="font-medium text-green-600 mb-1">
            {formatDate(currentPredictions.fertileWindow.start)} - {formatDate(currentPredictions.fertileWindow.end)}
          </p>
          <p className="text-sm text-gray-600">
            {daysUntilFertileStart > 0 
              ? `Starts in ${daysUntilFertileStart} days`
              : getDaysUntil(currentPredictions.fertileWindow.end) < 0 
                ? 'Passed'
                : 'Currently active'}
          </p>
          <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
            6-day window (5 days before + ovulation day)
          </div>
        </div>

        {/* Cycle Info */}
        <div className="bg-purple-50 p-4 rounded-xl">
          <h3 className="font-semibold text-purple-800 mb-3">Cycle Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Avg Cycle</p>
              <p className="text-lg font-bold text-purple-700">
                {Math.round(cycles.reduce((acc, cycle) => acc + (cycle.cycleLength || 28), 0) / cycles.length)} days
              </p>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <p className="text-sm text-gray-600">Total Cycles</p>
              <p className="text-lg font-bold text-purple-700">{cycles.length}</p>
            </div>
          </div>
          <div className="mt-3 text-xs text-gray-600">
            <p>Last cycle: {cycleInfo.cycleLength} days, {cycleInfo.periodLength}-day period</p>
            <p className="mt-1">Luteal phase: {cycleInfo.lutealPhase} days</p>
            <p className="mt-1">Ovulation day: Day {ovulationDay}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Predictions;