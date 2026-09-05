import { useState, useEffect, useRef } from 'react';
import { useCyclePredictions } from '../../hooks/useCyclePredictions';
import {
  calculateOvulationDate,
  calculateFertileWindow
} from '../../utils/cycleCalculations';

const CalendarView = ({ cycles = [], selectedDate, onSelectDate }) => {
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
            description: 'Active bleeding phase. Pregnancy probability is biologically very low during menstruation, though not absolutely zero for short cycles.',
            colorClass: 'bg-rose-50/90 border-rose-200 text-rose-900',
            dotColor: 'bg-rose-500',
            badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
          };
        }
        
        // Fertile Window / Unsafe Period
        if (dTime >= fertile.start.getTime() && dTime <= fertile.end.getTime()) {
          return {
            type: 'unsafe',
            label: 'Fertile Window (Unsafe Period)',
            risk: 'High Conception Risk',
            riskLevel: 'high',
            description: 'Fertile window surrounding ovulation. Sperm can survive up to 5 days and the egg remains viable for 24 hours. Unprotected intercourse has a high likelihood of resulting in pregnancy.',
            colorClass: 'bg-amber-50/90 border-amber-300 text-amber-900 ring-1 ring-amber-300/40',
            dotColor: 'bg-amber-500',
            badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
          };
        }

        // Early Safe Window (post-period, pre-ovulatory fertile start)
        if (dTime > periodEnd.getTime() && dTime < fertile.start.getTime()) {
          return {
            type: 'early-safe',
            label: 'Early Safe Phase (Pre-Ovulatory)',
            risk: 'Low Conception Risk',
            riskLevel: 'low-caution',
            description: 'Post-menstrual phase is generally low risk. However, natural fluctuations or early ovulation can unpredictably narrow this window.',
            colorClass: 'bg-teal-50/90 border-teal-200 text-teal-950',
            dotColor: 'bg-teal-500',
            badgeClass: 'bg-teal-100 text-teal-800 border-teal-200'
          };
        }

        // Late Safe Window (post-ovulatory fertile end, pre-next-period)
        if (dTime > fertile.end.getTime() && dTime < nextPeriodStart.getTime()) {
          return {
            type: 'late-safe',
            label: 'Late Safe Phase (Post-Ovulatory)',
            risk: 'Very Low Conception Risk',
            riskLevel: 'very-low',
            description: 'Most reliable physiological safe window. Ovulation has passed and the egg has dissolved (viable for 12–24 hours). Conception is biologically highly improbable.',
            colorClass: 'bg-emerald-50/90 border-emerald-300 text-emerald-950 ring-1 ring-emerald-300/40',
            dotColor: 'bg-emerald-600',
            badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
          };
        }
      }
    }

    // 2. Check against future predictions (future cycles)
    if (hasData) {
      for (const prediction of futurePredictions) {
        const start = prediction.period.start;
        const periodEnd = prediction.period.end;
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
              description: 'Projected menstrual bleeding phase based on previous cycle patterns.',
              colorClass: 'bg-rose-50/60 border-rose-200 border-dashed text-rose-900',
              dotColor: 'bg-rose-400',
              badgeClass: 'bg-rose-50 text-rose-800 border-rose-200'
            };
          }
          
          // Unsafe Period
          if (dTime >= fertile.start.getTime() && dTime <= fertile.end.getTime()) {
            return {
              type: 'predicted-unsafe',
              label: 'Predicted Unsafe Period (Fertile Window)',
              risk: 'High Conception Risk',
              riskLevel: 'high',
              description: 'Predicted fertile window. Unsafe for unprotected intercourse if pregnancy is not desired.',
              colorClass: 'bg-amber-50/60 border-amber-300 border-dashed text-amber-950',
              dotColor: 'bg-amber-400',
              badgeClass: 'bg-amber-100 text-amber-900 border-amber-300'
            };
          }

          // Early Safe Period
          if (dTime > periodEnd.getTime() && dTime < fertile.start.getTime()) {
            return {
              type: 'predicted-early-safe',
              label: 'Predicted Early Safe Phase',
              risk: 'Low Conception Risk',
              riskLevel: 'low-caution',
              description: 'Projected pre-ovulatory safe days. Moderate reliability due to cycle variability.',
              colorClass: 'bg-teal-50/60 border-teal-200 border-dashed text-teal-950',
              dotColor: 'bg-teal-400',
              badgeClass: 'bg-teal-50 text-teal-800 border-teal-200'
            };
          }

          // Late Safe Period
          if (dTime > fertile.end.getTime() && dTime < nextPeriodStart.getTime()) {
            return {
              type: 'predicted-late-safe',
              label: 'Predicted Late Safe Phase',
              risk: 'Very Low Conception Risk',
              riskLevel: 'very-low',
              description: 'Projected post-ovulatory safe window. Highest physiological reliability.',
              colorClass: 'bg-emerald-50/60 border-emerald-300 border-dashed text-emerald-950',
              dotColor: 'bg-emerald-500',
              badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
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

  const dayHeaders = [
    { key: 'sun', label: 'Sun' },
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' }
  ];

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

  const getDayIndicator = (dayType) => {
    switch(dayType) {
      case 'period':
        return <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-500 rounded-full shadow-2xs" />;
      case 'predicted-period':
        return <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-rose-300 rounded-full border border-rose-400" />;
      case 'ovulation':
        return <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-500 rounded-full shadow-2xs" />;
      case 'predicted-ovulation':
        return <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full border border-amber-400" />;
      case 'fertile':
        return <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full shadow-2xs" />;
      case 'predicted-fertile':
        return <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-300 rounded-full border border-emerald-400" />;
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
      {/* Calendar Header with Month Navigation and Overlay Pill */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 font-heading tracking-tight">
              Cycle Calendar
            </h2>
            <p className="text-xs text-gray-500">Visual overview of phases & fertility window</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2">
          {hasData && (
            <button
              type="button"
              onClick={() => setShowSafetyOverlay(!showSafetyOverlay)}
              className={`cursor-pointer min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 inline-flex items-center gap-1.5 touch-manipulation active:scale-95 ${
                showSafetyOverlay 
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' 
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Safe Windows: {showSafetyOverlay ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Month Switcher with 44px+ touch targets */}
          <div className="inline-flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
            <button
              type="button"
              onClick={previousMonth}
              className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center p-2 hover:bg-white hover:shadow-xs active:scale-90 rounded-lg text-gray-700 hover:text-gray-900 transition-all focus:outline-none touch-manipulation"
              aria-label="Previous month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-xs sm:text-sm font-semibold text-gray-800 min-w-[105px] text-center px-1">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center p-2 hover:bg-white hover:shadow-xs active:scale-90 rounded-lg text-gray-700 hover:text-gray-900 transition-all focus:outline-none touch-manipulation"
              aria-label="Next month"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Legends */}
      <div className="mb-4">
        {!showSafetyOverlay ? (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-900 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <span>Period</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50/60 border border-rose-200 border-dashed text-rose-800 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-300 border border-rose-400"></span>
              <span>Predicted Period</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Ovulation</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Fertile Window</span>
            </div>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-teal-900 inline-flex items-center gap-1 mr-1">
                <svg className="w-3.5 h-3.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Safety Key:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Menstruation (Low)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-100 text-teal-900 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span> Early Safe (Low)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Late Safe (Very Low)
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Fertile (High Risk)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Month Stats Bar */}
      {(monthStats.recorded.length > 0 || monthStats.predicted.length > 0) && (
        <div className="mb-4 px-3.5 py-2 bg-purple-50/60 rounded-xl border border-purple-100 flex flex-wrap items-center gap-3 text-xs text-purple-900 font-medium">
          {monthStats.recorded.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
              {monthStats.recorded.length} recorded cycle start{monthStats.recorded.length > 1 ? 's' : ''}
            </span>
          )}
          {monthStats.predicted.length > 0 && (
            <span className="inline-flex items-center gap-1 text-pink-700">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-500"></span>
              {monthStats.predicted.length} predicted cycle start{monthStats.predicted.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {dayHeaders.map(({ key, label }) => (
          <div key={key} className="text-center font-bold text-[11px] sm:text-xs text-gray-400 py-1.5">
            <span>{label}</span>
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
                aspect-square min-h-[2.85rem] sm:min-h-22 p-1 sm:p-1.5 rounded-xl relative transition-all duration-150 border touch-manipulation
                ${date ? 'cursor-pointer hover:scale-[1.02] hover:shadow-sm active:scale-[0.96]' : 'bg-gray-50/40 border-transparent pointer-events-none'}
                ${date && !isSelected && 'bg-white border-gray-100'}
                ${isSelected ? 'ring-2 ring-rose-600 shadow-md border-transparent z-10 scale-[1.03] bg-white' : ''}
                
                ${!showSafetyOverlay && date ? `
                  ${dayType === 'period' ? '!bg-rose-50/90 !border-rose-200' : ''}
                  ${dayType === 'predicted-period' ? '!bg-rose-50/50 !border-rose-300 border-dashed' : ''}
                  ${dayType === 'ovulation' ? '!bg-amber-50/90 !border-amber-300 ring-1 ring-amber-200/50' : ''}
                  ${dayType === 'predicted-ovulation' ? '!bg-amber-50/50 !border-amber-300 border-dashed' : ''}
                  ${dayType === 'fertile' ? '!bg-emerald-50/80 !border-emerald-200' : ''}
                  ${dayType === 'predicted-fertile' ? '!bg-emerald-50/40 !border-emerald-300 border-dashed' : ''}
                ` : ''}

                ${showSafetyOverlay && safetyInfo ? `${safetyInfo.colorClass}` : ''}
              `}
              onClick={() => date && onSelectDate(date)}
            >
              {date && (
                <div className="flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start">
                    {/* Overlay small indicator tag */}
                    {showSafetyOverlay && safetyInfo ? (
                      <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${safetyInfo.dotColor}`} />
                    ) : (
                      <span />
                    )}
                    
                    <span className={`
                      inline-flex items-center justify-center 
                      w-5 h-5 sm:w-6 sm:h-6 rounded-lg text-xs font-semibold ml-auto transition-colors
                      ${isToday ? 'bg-rose-600 text-white shadow-2xs font-bold' : ''}
                      ${!isToday && isPastDate ? 'text-gray-400' : 'text-gray-800'}
                      ${isSelected && !isToday ? 'text-rose-700 font-extrabold' : ''}
                    `}>
                      {date.getDate()}
                    </span>
                  </div>
                  
                  {/* Phase Dot Indicator */}
                  <div className="mt-auto flex justify-center pb-0.5">
                    {getDayIndicator(dayType)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Day Details Card */}
      {selectedDate && (
        <div 
          ref={detailsRef}
          className="mt-6 p-4 sm:p-5 rounded-2xl border border-rose-100 bg-gradient-to-br from-white to-pink-50/40 shadow-xs animate-fadeIn"
        >
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 pb-3 border-b border-rose-100/60">
            <div className="flex items-center justify-between w-full sm:w-auto">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500">Selected Date</span>
                <h4 className="font-extrabold text-gray-900 text-base font-heading">
                  {formatSelectedDate(selectedDate)}
                </h4>
              </div>
              <button
                type="button"
                onClick={() => onSelectDate(null)}
                className="cursor-pointer sm:hidden min-w-[40px] min-h-[40px] flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-rose-50 active:scale-90 touch-manipulation"
                aria-label="Deselect date"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              {cycles.length > 0 && currentDaySafety ? (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-center shadow-2xs ${currentDaySafety.badgeClass}`}>
                  {currentDaySafety.label} ({currentDaySafety.risk})
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 self-start sm:self-center">
                  Standard Phase
                </span>
              )}
              <button
                type="button"
                onClick={() => onSelectDate(null)}
                className="cursor-pointer hidden sm:flex min-w-[32px] min-h-[32px] items-center justify-center p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-rose-50 transition-colors"
                title="Deselect date"
                aria-label="Deselect date"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {cycles.length === 0 ? (
            <p className="text-sm text-gray-600 leading-relaxed">
              No cycle data recorded yet. Use the form above to record your latest cycle and calculate your predictions.
            </p>
          ) : currentDaySafety ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                {currentDaySafety.description}
              </p>

              {/* Contraceptive Notice Banner */}
              <div className="bg-amber-50/80 p-3 rounded-xl border border-amber-200/80 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <strong className="font-semibold block text-amber-950 mb-0.5">Educational Guidance Only</strong>
                  Calendar rhythm methods have high natural variation and are not considered primary contraception. Stress, diet, or travel can cause unpredictable ovulatory shifts. Use medically approved protection.
                </div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600">
              <p>This date falls outside of currently recorded or predicted active cycle ranges.</p>
            </div>
          )}
        </div>
      )}

      {/* Predictions Mini Strip */}
      {hasData && futurePredictions.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-rose-50/60 to-purple-50/60 rounded-2xl border border-rose-100">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="font-bold text-gray-900 text-xs sm:text-sm font-heading">
              Upcoming Forecast
            </h3>
          </div>
          
          <p className="text-xs text-gray-500 mb-3">
            Anticipated periods for the next {Math.min(3, futurePredictions.length)} cycle cycles:
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {futurePredictions.slice(0, 3).map((prediction, index) => {
              const monthName = prediction.period.start.toLocaleDateString('en-US', { month: 'short' });
              const year = prediction.period.start.getFullYear();
              return (
                <div key={index} className="bg-white p-3 rounded-xl border border-gray-200/80 shadow-2xs">
                  <div className="font-bold text-gray-900 text-xs mb-1.5">
                    {monthName} {year}
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>Period: {prediction.period.start.getDate()}–{prediction.period.end.getDate()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span>Ovulation: {prediction.ovulation.getDate()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;