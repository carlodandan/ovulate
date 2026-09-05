import { useState } from 'react';

const CycleForm = ({ onAddCycle }) => {
  const [startDate, setStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [lutealPhase, setLutealPhase] = useState(14);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!startDate) {
      alert('Please select a start date');
      return;
    }

    const cycleData = {
      startDate,
      cycleLength,
      periodLength,
      lutealPhase,
      endDate: calculateEndDate(startDate, periodLength)
    };

    onAddCycle(cycleData);
    
    // Reset form
    setStartDate('');
    setCycleLength(28);
    setPeriodLength(5);
    setLutealPhase(14);
  };

  const calculateEndDate = (startDate, periodLength) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + periodLength - 1);
    return date.toISOString().split('T')[0];
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-heading tracking-tight">
              Log Period & Cycle
            </h2>
            <p className="text-xs text-gray-500">Record your last period start to generate accurate predictions</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
            Last Period Start Date <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-3 min-h-[48px] bg-gray-50/50 hover:bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 transition-all duration-150 cursor-pointer"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Cycle Length
              </label>
              <span className="text-[11px] text-gray-400 font-normal">Standard: 28d</span>
            </div>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min="20"
                max="45"
                value={cycleLength}
                onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                className="w-full pl-3.5 pr-12 py-2.5 min-h-[48px] bg-gray-50/50 hover:bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                days
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Period Duration
              </label>
              <span className="text-[11px] text-gray-400 font-normal">Standard: 5d</span>
            </div>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min="2"
                max="10"
                value={periodLength}
                onChange={(e) => setPeriodLength(parseInt(e.target.value) || 5)}
                className="w-full pl-3.5 pr-12 py-2.5 min-h-[48px] bg-gray-50/50 hover:bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                days
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Luteal Phase
              </label>
              <span className="text-[11px] text-gray-400 font-normal">Standard: 14d</span>
            </div>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min="10"
                max="16"
                value={lutealPhase}
                onChange={(e) => setLutealPhase(parseInt(e.target.value) || 14)}
                className="w-full pl-3.5 pr-12 py-2.5 min-h-[48px] bg-gray-50/50 hover:bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/25 focus:border-rose-500 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400 pointer-events-none">
                days
              </span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="cursor-pointer w-full mt-2 min-h-[48px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:from-rose-700 hover:via-pink-700 hover:to-purple-700 text-white font-semibold text-sm py-3 px-4 rounded-xl shadow-md hover:shadow-lg active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-500/50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M5 13l4 4L19 7" />
          </svg>
          <span>Save Cycle Record</span>
        </button>
      </form>
    </div>
  );
};

export default CycleForm;