import { useState, useEffect, useRef } from 'react';
import { useCyclePredictions } from '../../hooks/useCyclePredictions';
import {
  calculateOvulationDate,
  calculateFertileWindow
} from '../../utils/cycleCalculations';

const CalendarView = ({ cycles, selectedDate, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  const [showSafetyOverlay, setShowSafetyOverlay] = useState(false);
  
  const { hasData, futurePredictions, lastCycle } = useCyclePredictions(cycles);

  const detailsRef = useRef(null);

  useEffect(() => {
    if (selectedDate && detailsRef.current) {
      detailsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedDate]);

  useEffect(() => {
    generateCalendar();
  }, [currentDate]);

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonthArray = [];

    // Add padding for days before first day of month
    const startDay = firstDay.getDay();
    for (let i = 0; i < startDay; i++) {
      daysInMonthArray.push(null);
    }

    // Add days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      daysInMonthArray.push(date);
    }

    setDaysInMonth(daysInMonthArray);
  };

  const getDayType = (date) => {
    if (!date) return null;

    const dateStr = date.toISOString().split('T')[0];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isPastDate = date < today;

    // Check if date is within any recorded period (past cycles)
    for (const cycle of cycles) {
      const start = new Date(cycle.startDate);
      start.setHours(0, 0, 0, 0);
      const periodEnd = new Date(start);
      periodEnd.setDate(start.getDate() + (cycle.periodLength || 5) - 1);
      
      if (date >= start && date <= periodEnd) {
        return 'period';
      }

      // Calculate ovulation date for THIS cycle
      const ovulationDate = calculateOvulationDate(
        start,
        cycle.cycleLength || 28,
        cycle.lutealPhase || 14
      );
      
      // Check if date matches ovulation date
      if (dateStr === ovulationDate.toISOString().split('T')[0]) {
        return isPastDate ? 'ovulation' : 'predicted-ovulation';
      }

      // Calculate fertile window for THIS cycle
      const fertileWindow = calculateFertileWindow(ovulationDate);
      
      // Check if date is in fertile window (but not the ovulation date itself)
      if (date >= fertileWindow.start && date <= fertileWindow.end && dateStr !== ovulationDate.toISOString().split('T')[0]) {
        return isPastDate ? 'fertile' : 'predicted-fertile';
      }
    }

    // Check predicted dates from futurePredictions (for future cycles only)
    if (!isPastDate && hasData) {
      for (const prediction of futurePredictions) {
        // Check predicted period
        if (date >= prediction.period.start && date <= prediction.period.end) {
          return 'predicted-period';
        }

        // Check predicted ovulation
        const ovulationStr = prediction.ovulation.toISOString().split('T')[0];
        if (dateStr === ovulationStr) {
          return 'predicted-ovulation';
        }

        // Check predicted fertile window (but not ovulation date)
        if (date >= prediction.fertile.start && date <= prediction.fertile.end && dateStr !== ovulationStr) {
          return 'predicted-fertile';
        }
      }
    }

    return null;
  };

  // Dedicated safety/contraceptive period categorization for educational purposes
  const getDaySafetyInfo = (date) => {
    if (!date || cycles.length === 0) return null;
    
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const dTime = d.getTime();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isPastDate = d < today;

    // 1. Check against recorded cycles (past)
    for (const cycle of cycles) {
      const start = new Date(cycle.startDate);
      start.setHours(0, 0, 0, 0);
      
      const cycleLength = cycle.cycleLength || 28;
      const periodLength = cycle.periodLength || 5;
      const lutealPhase = cycle.lutealPhase || 14;
      
      const periodEnd = new Date(start);
      periodEnd.setDate(start.getDate() + periodLength - 1);
      periodEnd.setHours(0, 0, 0, 0);

      const ovulationDate = calculateOvulationDate(start, cycleLength, lutealPhase);
      ovulationDate.setHours(0, 0, 0, 0);
      
      const fertile = calculateFertileWindow(ovulationDate);
      fertile.start.setHours(0, 0, 0, 0);
      fertile.end.setHours(0, 0, 0, 0);

      const nextPeriodStart = new Date(start);
      nextPeriodStart.setDate(start.getDate() + cycleLength);
      nextPeriodStart.setHours(0, 0, 0, 0);

      // Check if day falls within this cycle duration
      if (dTime >= start.getTime() && dTime < nextPeriodStart.getTime()) {
        // Active Menstruation
        if (dTime <= periodEnd.getTime()) {
          return {
            type: 'menstruation',
            label: 'Menstruation Phase',
            risk: 'Low Conception Risk',
            riskLevel: 'low-menstruation',
            description: 'This is the active bleeding phase. Biologically, pregnancy risk is very low during your period. However, it is not absolutely zero, especially for women with very short cycles or longer-lived sperm.',
            colorClass: 'bg-rose-50 border-rose-300 text-rose-800',
            indicatorColor: 'bg-rose-500',
            icon: '🩸'
          };
        }
        
        // Fertile Window / Unsafe Period
        if (dTime >= fertile.start.getTime() && dTime <= fertile.end.getTime()) {
          return {
            type: 'unsafe',
            label: 'Unsafe Period (Fertile Window)',
            risk: 'High Conception Risk',
            riskLevel: 'high',
            description: 'This is the fertile window surrounding ovulation. Sperm can survive inside the female body for up to 5 days, and the egg remains viable for up to 24 hours. Unprotected sex during this period has a high probability of resulting in pregnancy.',
            colorClass: 'bg-amber-50 border-amber-400 text-amber-900 ring-2 ring-amber-200/50',
            indicatorColor: 'bg-amber-500',
            icon: '⚡'
          };
        }

        // Early Safe Window (post-period, pre-ovulatory fertile start)
        if (dTime > periodEnd.getTime() && dTime < fertile.start.getTime()) {
          return {
            type: 'early-safe',
            label: 'Early Safe Period (Pre-Ovulatory)',
            risk: 'Low Conception Risk',
            riskLevel: 'low-caution',
            description: 'This post-menstrual phase is generally a safe window. However, caution is advised: natural variations in cycle lengths or early ovulation can cause this window to shrink unexpectedly.',
            colorClass: 'bg-teal-50 border-teal-300 text-teal-900',
            indicatorColor: 'bg-teal-500',
            icon: '🛡️'
          };
        }

        // Late Safe Window (post-ovulatory fertile end, pre-next-period)
        if (dTime > fertile.end.getTime() && dTime < nextPeriodStart.getTime()) {
          return {
            type: 'late-safe',
            label: 'Late Safe Period (Post-Ovulatory)',
            risk: 'Very Low Conception Risk',
            riskLevel: 'very-low',
            description: 'This is the most reliable safe window of your cycle. Ovulation has already occurred, and the egg has dissolved (it only lives for 12–24 hours). Conception is extremely unlikely.',
            colorClass: 'bg-emerald-50 border-emerald-400 text-emerald-950 ring-2 ring-emerald-200/50',
            indicatorColor: 'bg-emerald-600',
            icon: '🛡️✨'
          };
        }
      }
    }

    // 2. Check against future predictions (future cycles)
    if (hasData) {
      for (const prediction of futurePredictions) {
        const start = prediction.period.start;
        const periodEnd = prediction.period.end;
        const ovulationDate = prediction.ovulation;
        const fertile = prediction.fertile;
        
        const nextPeriodStart = new Date(start);
        nextPeriodStart.setDate(start.getDate() + (lastCycle.cycleLength || 28));
        nextPeriodStart.setHours(0, 0, 0, 0);

        if (dTime >= start.getTime() && dTime < nextPeriodStart.getTime()) {
          // Menstruation
          if (dTime <= periodEnd.getTime()) {
            return {
              type: 'predicted-menstruation',
              label: 'Predicted Menstruation',
              risk: 'Low Conception Risk',
              riskLevel: 'low-menstruation',
              description: 'Predicted active period. Biologically, conception is highly unlikely, but not impossible under rare circumstances (like short/irregular cycles).',
              colorClass: 'bg-rose-50/70 border-rose-300 border-dashed text-rose-800',
              indicatorColor: 'bg-rose-300',
              icon: '🩸'
            };
          }
          
          // Unsafe Period
          if (dTime >= fertile.start.getTime() && dTime <= fertile.end.getTime()) {
            return {
              type: 'predicted-unsafe',
              label: 'Predicted Unsafe Period (Fertile Window)',
              risk: 'High Conception Risk',
              riskLevel: 'high',
              description: 'Predicted fertile window. Highly unsafe for unprotected intercourse if pregnancy is not desired, as ovulation is anticipated soon or active.',
              colorClass: 'bg-amber-100/70 border-amber-400 border-dashed text-amber-900 ring-2 ring-amber-200/30',
              indicatorColor: 'bg-amber-400',
              icon: '⚡'
            };
          }

          // Early Safe Period
          if (dTime > periodEnd.getTime() && dTime < fertile.start.getTime()) {
            return {
              type: 'predicted-early-safe',
              label: 'Predicted Early Safe Period',
              risk: 'Low Conception Risk',
              riskLevel: 'low-caution',
              description: 'Predicted pre-ovulatory safe phase. Lower risk, but standard calendar predictions are susceptible to stress or cycle changes shifting ovulation earlier.',
              colorClass: 'bg-teal-50/70 border-teal-300 border-dashed text-teal-900',
              indicatorColor: 'bg-teal-300',
              icon: '🛡️'
            };
          }

          // Late Safe Period
          if (dTime > fertile.end.getTime() && dTime < nextPeriodStart.getTime()) {
            return {
              type: 'predicted-late-safe',
              label: 'Predicted Late Safe Period',
              risk: 'Very Low Conception Risk',
              riskLevel: 'very-low',
              description: 'Predicted post-ovulatory safe window. This is highly reliable because the egg has dissolved, meaning fertilization is not biologically possible.',
              colorClass: 'bg-emerald-50/70 border-emerald-400 border-dashed text-emerald-950 ring-2 ring-emerald-200/30',
              indicatorColor: 'bg-emerald-400',
              icon: '🛡️✨'
            };
          }
        }
      }
    }

    return null;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Fixed day headers with unique keys
  const dayHeaders = [
    { key: 'sun', label: 'S' },
    { key: 'mon', label: 'M' },
    { key: 'tue', label: 'T' },
    { key: 'wed', label: 'W' },
    { key: 'thu', label: 'T' },
    { key: 'fri', label: 'F' },
    { key: 'sat', label: 'S' }
  ];

  // Get current month's recorded and predicted periods
  const getCurrentMonthStats = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const recordedPeriods = cycles.filter(cycle => {
      const cycleDate = new Date(cycle.startDate);
      return cycleDate.getMonth() === currentMonth && 
             cycleDate.getFullYear() === currentYear;
    });

    const predictedPeriods = hasData ? futurePredictions.filter(prediction => {
      return prediction.period.start.getMonth() === currentMonth &&
             prediction.period.start.getFullYear() === currentYear;
    }) : [];

    return {
      recorded: recordedPeriods,
      predicted: predictedPeriods
    };
  };

  const monthStats = getCurrentMonthStats();

  // Mobile-optimized day indicators
  const getDayIndicator = (dayType) => {
    switch(dayType) {
      case 'period':
        return <div className="w-2 h-2 bg-red-500 rounded-full"></div>;
      case 'predicted-period':
        return <div className="w-2 h-2 bg-red-300 rounded-full border border-red-400"></div>;
      case 'ovulation':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>;
      case 'predicted-ovulation':
        return <div className="w-2 h-2 bg-yellow-300 rounded-full border border-yellow-400"></div>;
      case 'fertile':
        return <div className="w-2 h-2 bg-green-400 rounded-full"></div>;
      case 'predicted-fertile':
        return <div className="w-2 h-2 bg-green-300 rounded-full border border-green-400"></div>;
      default:
        return null;
    }
  };

  const formatSelectedDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const currentDaySafety = selectedDate ? getDaySafetyInfo(selectedDate) : null;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-semibold text-purple-700">Calendar</h2>
          {hasData && (
            <button
              onClick={() => setShowSafetyOverlay(!showSafetyOverlay)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all duration-300 flex items-center gap-1 ${
                showSafetyOverlay 
                  ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm' 
                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
              }`}
            >
              <span>🛡️ Safe periods: {showSafetyOverlay ? 'ON' : 'OFF'}</span>
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Previous month"
          >
            <span className="text-lg">◀</span>
          </button>
          <span className="text-md font-medium min-w-[140px] text-center">
            {monthNames[currentDate.getMonth()].substring(0, 3)} {currentDate.getFullYear()}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Next month"
          >
            <span className="text-lg">▶</span>
          </button>
        </div>
      </div>

      {/* Legend Tab */}
      <div className="mb-4 sm:mb-6">
        {!showSafetyOverlay ? (
          <>
            <div className="hidden sm:flex flex-wrap gap-3 text-sm mb-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span className="text-xs">Recorded Period</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-300 rounded mr-2 border border-red-400"></div>
                <span className="text-xs">Predicted Period</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-400 rounded mr-2"></div>
                <span className="text-xs">Ovulation</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-200 rounded mr-2 border border-yellow-300"></div>
                <span className="text-xs">Predicted Ovulation</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-300 rounded mr-2"></div>
                <span className="text-xs">Fertile Window</span>
              </div>
            </div>
            
            <div className="sm:hidden grid grid-cols-3 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-500 rounded mr-1"></div>
                <span>Period</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded mr-1"></div>
                <span>Ovulation</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded mr-1"></div>
                <span>Fertile</span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-teal-50/50 p-2.5 rounded-lg border border-teal-100/50">
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              <span className="font-semibold text-teal-800 flex items-center">🛡️ Educational Safety Legend:</span>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-rose-50 border border-rose-300 rounded mr-1"></div>
                <span className="text-rose-900 font-medium">Menstruation (Low Risk)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-teal-50 border border-teal-300 rounded mr-1"></div>
                <span className="text-teal-900 font-medium">Early Safe Phase (Low Risk)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-emerald-50 border border-emerald-400 rounded mr-1"></div>
                <span className="text-emerald-950 font-bold">Late Safe Phase (Very Low)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-amber-50 border border-amber-400 rounded mr-1"></div>
                <span className="text-amber-900 font-bold">Unsafe / Fertile (High Risk)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Current Month Stats */}
      {(monthStats.recorded.length > 0 || monthStats.predicted.length > 0) && (
        <div className="mb-4 p-3 bg-blue-50/70 rounded-lg border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            {monthStats.recorded.length > 0 && (
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">📅</span>
                <span className="text-xs sm:text-sm text-blue-700 font-medium">
                  {monthStats.recorded.length} recorded cycle starts
                </span>
              </div>
            )}
            {monthStats.predicted.length > 0 && (
              <div className="flex items-center">
                <span className="text-pink-600 mr-2">🔮</span>
                <span className="text-xs sm:text-sm text-pink-700 font-medium">
                  {monthStats.predicted.length} predicted periods
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dayHeaders.map(({ key, label }) => (
          <div key={key} className="text-center font-semibold text-gray-400 py-1 sm:py-2">
            <span className="text-xs sm:text-sm">{label}</span>
          </div>
        ))}

        {daysInMonth.map((date, index) => {
          const dayType = getDayType(date);
          const isToday = date?.toDateString() === new Date().toDateString();
          const isPastDate = date && date < new Date().setHours(0, 0, 0, 0);
          const isSelected = selectedDate && date && date.toDateString() === selectedDate.toDateString();

          const safetyInfo = showSafetyOverlay ? getDaySafetyInfo(date) : null;
          
          return (
            <div
              key={index}
              className={`
                aspect-square min-h-[2.5rem] sm:min-h-24 
                p-1 sm:p-2 border rounded-md sm:rounded-xl relative transition-all duration-200
                ${date ? 'bg-white border-gray-100 hover:border-purple-300 hover:shadow-sm cursor-pointer' : 'bg-gray-50/60 border-gray-100'}
                ${isSelected ? 'ring-2 ring-purple-600 shadow-md border-transparent scale-102 z-10' : ''}
                
                ${!showSafetyOverlay ? `
                  ${dayType === 'period' ? 'bg-red-50 border-red-200' : ''}
                  ${dayType === 'predicted-period' ? 'bg-red-50/70 border-red-300 border-dashed' : ''}
                  ${dayType === 'ovulation' ? 'bg-yellow-50 border-yellow-200' : ''}
                  ${dayType === 'predicted-ovulation' ? 'bg-yellow-50/70 border-yellow-300 border-dashed' : ''}
                  ${dayType === 'fertile' ? 'bg-green-50 border-green-200' : ''}
                  ${dayType === 'predicted-fertile' ? 'bg-green-50/70 border-green-300 border-dashed' : ''}
                ` : `
                  ${safetyInfo ? safetyInfo.colorClass : 'border-gray-100'}
                `}
              `}
              onClick={() => date && onSelectDate(date)}
            >
              {date && (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    {/* Corner Phase Icon */}
                    {showSafetyOverlay && safetyInfo?.icon && (
                      <span className="text-[10px] sm:text-xs text-opacity-80">
                        {safetyInfo.icon.split(' ')[0]}
                      </span>
                    )}
                    
                    <span className={`
                      inline-flex items-center justify-center 
                      w-5 h-5 sm:w-6 sm:h-6 rounded-full text-xs sm:text-sm font-medium ml-auto
                      ${isToday ? 'bg-purple-600 text-white shadow-sm' : ''}
                      ${!isToday && isPastDate ? 'text-gray-400' : 'text-gray-800'}
                    `}>
                      {date.getDate()}
                    </span>
                  </div>
                  
                  {/* Phase Dot Indicator */}
                  <div className="mt-auto flex justify-center">
                    {getDayIndicator(dayType)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Card (Educational Concept Card) */}
      {selectedDate && (
        <div 
          ref={detailsRef}
          className="mt-6 p-4 rounded-xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/30 shadow-sm animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 pb-2 border-b border-purple-50">
            <div>
              <p className="text-xs text-gray-500 font-medium">SELECTED DATE</p>
              <h4 className="font-semibold text-purple-900 text-sm sm:text-base">
                {formatSelectedDate(selectedDate)}
              </h4>
            </div>
            
            {/* Risk Badge */}
            {cycles.length > 0 && currentDaySafety ? (
              <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-center shadow-2xs ${
                currentDaySafety.riskLevel === 'high'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : currentDaySafety.riskLevel === 'very-low'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : currentDaySafety.riskLevel === 'low-caution'
                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}>
                {currentDaySafety.icon ? currentDaySafety.icon + ' ' : ''}{currentDaySafety.label} ({currentDaySafety.risk})
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200 self-start sm:self-center">
                ℹ️ Standard Day
              </span>
            )}
          </div>

          {cycles.length === 0 ? (
            <p className="text-sm text-gray-600 leading-relaxed">
              No menstrual cycle data recorded yet. Fill out the cycle form above to generate predictions and view your educational safety window breakdown.
            </p>
          ) : currentDaySafety ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentDaySafety.description}
              </p>

              {/* Contraceptive warning details */}
              <div className="bg-yellow-50/80 p-3 rounded-lg border border-yellow-200 text-[11px] sm:text-xs text-yellow-800 leading-normal flex items-start space-x-2">
                <span className="text-base leading-none">⚠️</span>
                <div>
                  <strong className="block mb-0.5">Educational Purpose Only</strong>
                  The calendar (rhythm) method is statistically unreliable for primary birth control. Individual cycles are subject to hormonal, stress-induced, or health variations that can shift ovulation unexpectedly. Always use barrier methods (such as condoms) or consult a clinician for robust pregnancy prevention.
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-700 leading-relaxed">
                This date falls outside of your currently active or predicted cycles.
              </p>
              <p className="text-xs text-gray-500">
                Tip: Add your most recent menstrual cycle dates to see updated projections for this date range!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Predictions Info */}
      {hasData && futurePredictions.length > 0 && (
        <div className="mt-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border border-purple-100">
          <div className="flex items-center mb-2">
            <span className="text-purple-600 mr-2">🔮</span>
            <h3 className="font-semibold text-purple-800 text-sm sm:text-base">
              Future Predictions
            </h3>
          </div>
          
          <p className="text-xs sm:text-sm text-gray-600 mb-3">
            Based on your last cycle, next {Math.min(3, futurePredictions.length)} months:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
            {futurePredictions.slice(0, 3).map((prediction, index) => {
              const monthName = prediction.period.start.toLocaleDateString('en-US', { month: 'short' });
              const year = prediction.period.start.getFullYear();
              return (
                <div key={index} className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200">
                  <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <span className="font-medium text-gray-700 text-xs sm:text-sm">
                      {monthName} {year}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs sm:text-sm">
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-300 rounded-full mr-1.5 sm:mr-2"></div>
                      <span className="text-gray-600 truncate">
                        Period: {prediction.period.start.getDate()}-{prediction.period.end.getDate()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-yellow-300 rounded-full mr-1.5 sm:mr-2"></div>
                      <span className="text-gray-600">
                        Ovulation: {prediction.ovulation.getDate()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {futurePredictions.length > 3 && (
            <p className="text-xs text-gray-500 mt-2 sm:mt-3 text-center">
              + {futurePredictions.length - 3} more months predicted
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CalendarView;