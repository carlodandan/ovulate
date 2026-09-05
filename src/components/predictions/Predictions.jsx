import { useCyclePredictions } from '../../hooks/useCyclePredictions';

const Predictions = ({ cycles = [] }) => {
  const { 
    hasData, 
    currentPredictions, 
    ovulationDay,
    cycleInfo 
  } = useCyclePredictions(cycles);

  if (!hasData) {
    return (
      <div className="text-center py-10 px-4">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-2xs">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900 font-heading mb-1">No Cycle Data Yet</h3>
        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
          Record your last period start date in the form to generate personal cycle forecasts and safe period breakdowns.
        </p>
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
      return 'Completed';
    } else {
      const days = getDaysUntil(start);
      return `Starts in ${days} ${days === 1 ? 'day' : 'days'}`;
    }
  };

  const daysUntilPeriod = getDaysUntil(currentPredictions.nextPeriodStart);
  const earlySafe = currentPredictions.earlySafeWindow;
  const lateSafe = currentPredictions.lateSafeWindow;
  const unsafe = currentPredictions.unsafeWindow;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-1 border-b border-purple-100/60">
        <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
        <h2 className="text-lg font-bold text-gray-900 font-heading tracking-tight">
          Cycle Forecast
        </h2>
      </div>
      
      {/* Next Period Card */}
      <div className="bg-white p-4 rounded-2xl shadow-2xs border border-rose-100/80 relative overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 border border-rose-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Next Period</h3>
          </div>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            daysUntilPeriod === 0
              ? 'bg-rose-500 text-white border-rose-500'
              : daysUntilPeriod > 0
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-gray-100 text-gray-600 border-gray-200'
          }`}>
            {daysUntilPeriod > 0 
              ? `In ${daysUntilPeriod} ${daysUntilPeriod === 1 ? 'day' : 'days'}`
              : daysUntilPeriod === 0 
                ? 'Today' 
                : `${Math.abs(daysUntilPeriod)}d ago`}
          </span>
        </div>

        <p className="text-xl font-extrabold text-rose-700 font-heading">
          {formatDate(currentPredictions.nextPeriodStart)}
        </p>
      </div>

      {/* Fertile / Unsafe Sex Period Card */}
      <div className="bg-gradient-to-br from-white to-amber-50/40 p-4 rounded-2xl shadow-2xs border border-amber-200/80">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center text-amber-700 border border-amber-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Fertile Window</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
            High Risk
          </span>
        </div>
        
        <p className="text-base font-extrabold text-amber-900 font-heading">
          {formatDate(unsafe.start)} – {formatDate(unsafe.end)}
        </p>
        
        <div className="flex items-center gap-1.5 mt-1 mb-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-xs font-semibold text-amber-900">
            {getStatusText(unsafe.start, unsafe.end)}
          </span>
        </div>
        
        <div className="text-[11px] text-gray-600 border-t border-amber-100 pt-2 space-y-1">
          <p className="leading-snug">
            Sperm remains viable for up to 5 days; unfertilized egg survives up to 24 hours. Highest probability of conception.
          </p>
          <p className="text-amber-800 font-medium">
            Ovulation Day: {formatDate(currentPredictions.ovulationDate)} (Cycle Day {ovulationDay})
          </p>
        </div>
      </div>

      {/* Safe Sex Period Card */}
      <div className="bg-gradient-to-br from-white to-teal-50/40 p-4 rounded-2xl shadow-2xs border border-teal-200/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 border border-teal-200">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">Safe Windows</h3>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-900 px-2 py-0.5 rounded-full border border-teal-300">
            Low Risk
          </span>
        </div>

        <div className="space-y-2.5">
          {/* Early Safe Phase */}
          <div className="bg-white/80 p-2.5 rounded-xl border border-teal-100">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-xs font-bold text-teal-900">Pre-Ovulatory Window</span>
              {earlySafe && (
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-medium">
                  {getStatusText(earlySafe.start, earlySafe.end)}
                </span>
              )}
            </div>
            {earlySafe ? (
              <>
                <p className="text-xs font-extrabold text-teal-950 mb-0.5">
                  {formatDate(earlySafe.start)} – {formatDate(earlySafe.end)}
                </p>
                <p className="text-[10px] text-gray-500 leading-snug">
                  Lower risk phase, but early ovulation shifts can contract this window.
                </p>
              </>
            ) : (
              <p className="text-[10px] text-rose-700 italic">
                None. Because of shorter cycle length, bleeding ends right at the fertile start.
              </p>
            )}
          </div>

          {/* Late Safe Phase */}
          <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-xs font-bold text-emerald-900">Post-Ovulatory Window</span>
              {lateSafe && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                  {getStatusText(lateSafe.start, lateSafe.end)}
                </span>
              )}
            </div>
            {lateSafe ? (
              <>
                <p className="text-xs font-extrabold text-emerald-950 mb-0.5">
                  {formatDate(lateSafe.start)} – {formatDate(lateSafe.end)}
                </p>
                <p className="text-[10px] text-gray-500 leading-snug">
                  <strong>Highest Reliability:</strong> The unfertilized egg has completed its viability window.
                </p>
              </>
            ) : (
              <p className="text-[10px] text-rose-700 italic">
                None calculated. Review your cycle inputs.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Cycle Statistics Panel */}
      <div className="bg-purple-50/60 p-3.5 rounded-2xl border border-purple-100">
        <h3 className="font-bold text-purple-900 text-xs uppercase tracking-wider mb-2.5">
          Cycle Baseline
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-white rounded-xl border border-purple-100/80 shadow-2xs">
            <p className="text-[10px] text-gray-500 font-semibold uppercase">Avg Cycle</p>
            <p className="text-base font-extrabold text-purple-800">
              {Math.round(cycles.reduce((acc, cycle) => acc + (cycle.cycleLength || 28), 0) / cycles.length)}d
            </p>
          </div>
          <div className="text-center p-2 bg-white rounded-xl border border-purple-100/80 shadow-2xs">
            <p className="text-[10px] text-gray-500 font-semibold uppercase">Logged Cycles</p>
            <p className="text-base font-extrabold text-purple-800">{cycles.length}</p>
          </div>
        </div>
        <div className="mt-2 text-[11px] text-gray-600 space-y-0.5 text-center">
          <p>Last cycle: {cycleInfo.cycleLength}d length • {cycleInfo.periodLength}d period</p>
          <p>Luteal phase: {cycleInfo.lutealPhase}d (Ovulation day {ovulationDay})</p>
        </div>
      </div>

      {/* Clinical Warning */}
      <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-200/70 text-[11px] leading-relaxed text-rose-950">
        <div className="flex items-center gap-1.5 mb-1 text-rose-800 font-bold">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="uppercase tracking-wider text-[10px]">Medical Notice</span>
        </div>
        <p>
          Cycle tracking calculations are strictly for <strong>educational reference</strong>. Hormonal fluctuations can shift ovulation unexpectedly. Always use approved protection.
        </p>
      </div>
    </div>
  );
};

export default Predictions;