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
        <p className="text-gray-600 text-sm">Add your cycle details to see predictions and safe/unsafe period breakdowns.</p>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (date) => {
    if (!date) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusText = (startDate, endDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (today >= start && today <= end) {
      return 'Active today';
    } else if (today > end) {
      return 'Passed';
    } else {
      const days = getDaysUntil(start);
      return `Starts in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };

  const daysUntilPeriod = getDaysUntil(currentPredictions.nextPeriodStart);
  const daysUntilOvulation = getDaysUntil(currentPredictions.ovulationDate);
  
  const earlySafe = currentPredictions.earlySafeWindow;
  const lateSafe = currentPredictions.lateSafeWindow;
  const unsafe = currentPredictions.unsafeWindow;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-purple-700 mb-4">Predictions</h2>
      
      {/* Next Period Card */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-pink-100">
        <div className="flex items-center mb-2">
          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <span className="text-red-500">🩸</span>
          </div>
          <h3 className="font-semibold text-gray-800 text-sm">Next Period</h3>
        </div>
        <p className="text-xl font-bold text-red-600 mb-1">
          {formatDate(currentPredictions.nextPeriodStart)}
        </p>
        <p className="text-xs text-gray-500 font-medium">
          {daysUntilPeriod > 0 
            ? `In ${daysUntilPeriod} ${daysUntilPeriod === 1 ? 'day' : 'days'}`
            : daysUntilPeriod === 0 
              ? 'Today' 
              : `${Math.abs(daysUntilPeriod)} ${Math.abs(daysUntilPeriod) === 1 ? 'day' : 'days'} ago`}
        </p>
      </div>

      {/* Unsafe Sex Period Card (High Conception Risk) */}
      <div className="bg-gradient-to-br from-white to-amber-50/20 p-4 rounded-xl shadow-xs border border-amber-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-amber-600 font-bold">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Unsafe Sex Period</h3>
          </div>
          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
            High Risk
          </span>
        </div>
        
        <p className="text-base font-bold text-amber-600 mb-1">
          {formatDate(unsafe.start)} - {formatDate(unsafe.end)}
        </p>
        
        <p className="text-xs font-semibold text-amber-800/80 mb-2">
          {getStatusText(unsafe.start, unsafe.end)}
        </p>
        
        <div className="text-[11px] text-gray-600 border-t border-amber-100/50 pt-2 space-y-1">
          <p>
            <strong>Fertile Window:</strong> Sperm survives up to 5 days, egg lives up to 24 hours. Unprotected sex during this period carries a high risk of pregnancy.
          </p>
          <p className="text-gray-500 italic">
            Includes Ovulation Day: {formatDate(currentPredictions.ovulationDate)} (Day {ovulationDay})
          </p>
        </div>
      </div>

      {/* Safe Sex Period Card (Low Conception Risk) */}
      <div className="bg-gradient-to-br from-white to-teal-50/20 p-4 rounded-xl shadow-xs border border-teal-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-teal-600">🛡️</span>
            </div>
            <h3 className="font-semibold text-gray-800 text-sm">Safe Sex Periods</h3>
          </div>
          <span className="text-[10px] font-bold uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full border border-teal-200">
            Low Risk
          </span>
        </div>

        <div className="space-y-3">
          {/* Early Safe Phase */}
          <div className="bg-teal-50/30 p-2.5 rounded-lg border border-teal-100/30">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-teal-800">Early Phase (Pre-Ovulatory)</span>
              {earlySafe && (
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.2 rounded font-medium">
                  {getStatusText(earlySafe.start, earlySafe.end)}
                </span>
              )}
            </div>
            {earlySafe ? (
              <>
                <p className="text-xs font-bold text-teal-900 mb-1">
                  {formatDate(earlySafe.start)} - {formatDate(earlySafe.end)}
                </p>
                <p className="text-[10px] text-gray-600">
                  Conception probability is low. However, early ovulation (caused by stress or cycle changes) can shorten or eliminate this phase.
                </p>
              </>
            ) : (
              <p className="text-[10px] text-rose-800 italic">
                None. Because of a shorter cycle length, your period ends directly at the start of your fertile window, leaving no early safe days.
              </p>
            )}
          </div>

          {/* Late Safe Phase */}
          <div className="bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-100/30">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-emerald-800">Late Phase (Post-Ovulatory)</span>
              {lateSafe && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                  {getStatusText(lateSafe.start, lateSafe.end)}
                </span>
              )}
            </div>
            {lateSafe ? (
              <>
                <p className="text-xs font-bold text-emerald-950 mb-1">
                  {formatDate(lateSafe.start)} - {formatDate(lateSafe.end)}
                </p>
                <p className="text-[10px] text-gray-600">
                  <strong>Most Reliable Safe Window:</strong> Ovulation has successfully completed, and the egg has dissolved. Conception is biologically highly improbable.
                </p>
              </>
            ) : (
              <p className="text-[10px] text-rose-800 italic">
                None predicted. Check your cycle input lengths.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cycle Statistics Panel */}
      <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100">
        <h3 className="font-semibold text-purple-800 text-xs sm:text-sm mb-3">Cycle Information</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2.5 bg-white rounded-lg border border-purple-100">
            <p className="text-[10px] text-gray-500 font-medium">Avg Cycle</p>
            <p className="text-base font-bold text-purple-700">
              {Math.round(cycles.reduce((acc, cycle) => acc + (cycle.cycleLength || 28), 0) / cycles.length)} days
            </p>
          </div>
          <div className="text-center p-2.5 bg-white rounded-lg border border-purple-100">
            <p className="text-[10px] text-gray-500 font-medium">Total Cycles</p>
            <p className="text-base font-bold text-purple-700">{cycles.length}</p>
          </div>
        </div>
        <div className="mt-3 text-[10px] text-gray-600 space-y-1">
          <p>Last cycle: {cycleInfo.cycleLength} days, {cycleInfo.periodLength}-day period</p>
          <p>Luteal phase: {cycleInfo.lutealPhase} days (Ovulation on Day {ovulationDay})</p>
        </div>
      </div>

      {/* Medical disclaimer and Educational guide */}
      <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-100 text-[10px] leading-relaxed text-rose-950">
        <div className="flex items-center space-x-1.5 mb-1.5 text-rose-800 font-semibold">
          <span>🚨</span>
          <span className="uppercase tracking-wide text-[9px]">Clinical Contraceptive Warning</span>
        </div>
        <p className="mb-2">
          Natural cycle tracking calculations are designed for <strong>educational and conceptual reference only</strong>.
        </p>
        <p className="mb-2">
          Individual menstrual cycles are frequently irregular and are heavily influenced by stress, illness, weight changes, physical activity, and travel. <strong>Do not use this calendar as a primary form of contraception.</strong>
        </p>
        <p className="font-semibold text-rose-900">
          Always combine tracking with barrier protection (such as condoms) or FDA-approved medical birth control devices.
        </p>
      </div>
    </div>
  );
};

export default Predictions;