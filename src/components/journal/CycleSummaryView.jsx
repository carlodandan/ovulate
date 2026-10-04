import { useState } from 'react';
import { SYMPTOM_OPTIONS, getCycleSummaryDetails } from '../../utils/journalCalculations';
import SymptomIcon from '../common/SymptomIcon';

const CycleSummaryView = ({ actualCycles = [], onSelectCycleDate }) => {
  const [selectedCycleIndex, setSelectedCycleIndex] = useState(
    actualCycles.length > 0 ? actualCycles.length - 1 : 0
  );

  if (actualCycles.length === 0) {
    return (
      <div className="text-center py-8 px-4 bg-purple-50/40 rounded-2xl border border-purple-100">
        <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-sm font-bold text-gray-900 font-heading mb-1">No Journal Cycles Reconstructed Yet</h3>
        <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
          Log your daily period flow in the calendar to automatically build actual historical cycles, symptom correlations, and comparisons.
        </p>
      </div>
    );
  }

  const activeIndex = Math.min(selectedCycleIndex, actualCycles.length - 1);
  const currentCycle = actualCycles[activeIndex];
  const prevCycle = activeIndex > 0 ? actualCycles[activeIndex - 1] : null;
  const summaryDetails = getCycleSummaryDetails(currentCycle, prevCycle);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Compute current cycle day if it's the latest active cycle
  const isLatestCycle = activeIndex === actualCycles.length - 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(currentCycle.startDate + 'T00:00:00');
  const currentCycleDay = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;

  const symptomsList = Object.entries(currentCycle.symptoms || {})
    .sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">
      {/* Header & Cycle Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-rose-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 font-heading">
                Actual Cycle Summary
              </h3>
              {onSelectCycleDate && (
                <button
                  type="button"
                  onClick={() => onSelectCycleDate(new Date(currentCycle.startDate + 'T00:00:00'))}
                  className="cursor-pointer text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline"
                  title="Jump to cycle start date on calendar"
                >
                  View start on calendar
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500">Derived from your daily journal observations</p>
          </div>
        </div>

        {/* Cycle Tabs / Selector */}
        {actualCycles.length > 1 && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            {actualCycles.map((c, idx) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCycleIndex(idx)}
                className={`cursor-pointer px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all touch-manipulation min-h-[40px] active:scale-[0.98] ${
                  idx === activeIndex
                    ? 'bg-rose-700 text-white shadow-xs font-bold'
                    : 'bg-gray-100 text-gray-700 hover:bg-rose-50 hover:text-rose-800'
                }`}
              >
                {formatDate(c.startDate)} {idx === actualCycles.length - 1 ? '(Current)' : ''}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Cycle Length / Day */}
        <div className="bg-rose-50/70 border border-rose-100 p-3 rounded-2xl">
          <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">
            {isLatestCycle && !currentCycle.isCompleted ? 'Current Progress' : 'Cycle Duration'}
          </p>
          <p className="text-lg sm:text-xl font-extrabold text-rose-900 mt-0.5">
            {isLatestCycle && !currentCycle.isCompleted
              ? `Day ${Math.max(1, currentCycleDay)}`
              : `${currentCycle.cycleLength}d`}
            <span className="text-xs font-normal text-rose-600 ml-1">
              {isLatestCycle && !currentCycle.isCompleted ? `(est. ~${currentCycle.cycleLength}d)` : 'total'}
            </span>
          </p>
        </div>

        {/* Period Duration */}
        <div className="bg-pink-50/70 border border-pink-100 p-3 rounded-2xl">
          <p className="text-[10px] font-bold text-pink-700 uppercase tracking-wider">Period Bleeding</p>
          <p className="text-lg sm:text-xl font-extrabold text-pink-900 mt-0.5">
            {currentCycle.periodLength} <span className="text-xs font-normal text-pink-600">days logged</span>
          </p>
        </div>

        {/* Days Logged */}
        <div className="bg-purple-50/70 border border-purple-100 p-3 rounded-2xl">
          <p className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Journal Entries</p>
          <p className="text-lg sm:text-xl font-extrabold text-purple-900 mt-0.5">
            {currentCycle.totalLoggedDays} <span className="text-xs font-normal text-purple-600">recorded</span>
          </p>
        </div>

        {/* Comparison with Previous Cycle */}
        <div className="bg-teal-50/70 border border-teal-100 p-3 rounded-2xl">
          <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">Vs Previous Cycle</p>
          <p className="text-xs sm:text-sm font-extrabold text-teal-950 mt-1 leading-snug">
            {summaryDetails.comparison ? summaryDetails.comparison.text : 'Baseline cycle'}
          </p>
        </div>
      </div>

      {/* Observations: BBT, Ovulation LH, Symptoms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Symptoms Logged */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              Symptom Frequency
            </h4>
            <span className="text-[11px] text-gray-400">{symptomsList.length} distinct</span>
          </div>

          {symptomsList.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {symptomsList.map(([key, count]) => {
                const opt = SYMPTOM_OPTIONS.find(s => s.key === key);
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-purple-50 text-purple-900 border border-purple-200/70"
                  >
                    <SymptomIcon type={key} className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                    <span>{opt?.label || key}</span>
                    <span className="text-[10px] font-bold bg-purple-200/80 text-purple-950 px-1.5 py-0.5 rounded-full ml-0.5">
                      {count}d
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">No symptoms recorded during this cycle.</p>
          )}
        </div>

        {/* Biomarkers / Observations */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-2xs space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Biomarkers & Tests
          </h4>

          <div className="space-y-2 text-xs">
            {/* Average BBT */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-sky-50/60 border border-sky-100">
              <span className="text-sky-900 font-medium">Avg Basal Temperature:</span>
              <span className="font-extrabold text-sky-950">
                {currentCycle.avgBbt ? `${currentCycle.avgBbt}°` : 'Unrecorded'}
              </span>
            </div>

            {/* Peak LH Test */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/60 border border-amber-100">
              <span className="text-amber-900 font-medium">LH Ovulation Surge:</span>
              <span className="font-extrabold text-amber-950">
                {currentCycle.peakOvulationDate
                  ? formatDate(currentCycle.peakOvulationDate)
                  : 'No peak recorded'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleSummaryView;
