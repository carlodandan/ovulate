import { useState, useEffect } from 'react';
import { useCyclePredictions } from '../../hooks/useCyclePredictions';
import {
  calculateOvulationDate,
  calculateFertileWindow
} from '../../utils/cycleCalculations';

const CalendarView = ({ cycles, selectedDate, onSelectDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState([]);
  
  const { hasData, futurePredictions } = useCyclePredictions(cycles);

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
    
    // Check if date is in the past (for recorded cycles only)
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
      
      // ALWAYS mark ovulation - both past and future within this cycle's timeframe
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

  // Debug function to check what's being calculated
  const getDebugInfo = () => {
    if (cycles.length === 0) return null;
    
    const lastCycle = cycles[cycles.length - 1];
    const start = new Date(lastCycle.startDate);
    const ovulationDate = calculateOvulationDate(
      start,
      lastCycle.cycleLength || 28,
      lastCycle.lutealPhase || 14
    );
    
    return {
      lastPeriodStart: start.toISOString().split('T')[0],
      ovulationDate: ovulationDate.toISOString().split('T')[0],
      cycleLength: lastCycle.cycleLength || 28,
      lutealPhase: lastCycle.lutealPhase || 14
    };
  };

  const debugInfo = getDebugInfo();

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3">
        <h2 className="text-xl font-semibold text-purple-700 text-center sm:text-left">Calendar</h2>
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

      {/* Legend */}
      <div className="mb-4 sm:mb-6">
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
      </div>
      {/* Current Month Stats */}
      {(monthStats.recorded.length > 0 || monthStats.predicted.length > 0) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
            {monthStats.recorded.length > 0 && (
              <div className="flex items-center">
                <span className="text-blue-600 mr-2">📅</span>
                <span className="text-xs sm:text-sm text-blue-700">
                  {monthStats.recorded.length} recorded
                </span>
              </div>
            )}
            {monthStats.predicted.length > 0 && (
              <div className="flex items-center">
                <span className="text-pink-600 mr-2">🔮</span>
                <span className="text-xs sm:text-sm text-pink-700">
                  {monthStats.predicted.length} predicted
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {dayHeaders.map(({ key, label }) => (
          <div key={key} className="text-center font-medium text-gray-500 py-1 sm:py-2">
            <span className="text-xs sm:text-sm">{label}</span>
          </div>
        ))}

        {daysInMonth.map((date, index) => {
          const dayType = getDayType(date);
          const isToday = date?.toDateString() === new Date().toDateString();
          const isPastDate = date && date < new Date().setHours(0, 0, 0, 0);
          
          return (
            <div
              key={index}
              className={`
                aspect-square min-h-[2.5rem] sm:min-h-24 
                p-1 sm:p-2 border rounded-md sm:rounded-lg 
                ${date ? 'bg-white border-gray-300 hover:bg-gray-50 cursor-pointer' : 'bg-gray-50 border-gray-300'}
                ${dayType === 'period' ? 'bg-red-50 border-red-200' : ''}
                ${dayType === 'predicted-period' ? 'bg-red-100 border-red-300 border-dashed' : ''}
                ${dayType === 'ovulation' ? 'bg-yellow-50 border-yellow-200' : ''}
                ${dayType === 'predicted-ovulation' ? 'bg-yellow-100 border-yellow-300 border-dashed' : ''}
                ${dayType === 'fertile' ? 'bg-green-50 border-green-200' : ''}
                ${dayType === 'predicted-fertile' ? 'bg-green-100 border-green-300 border-dashed' : ''}
                ${!dayType ? 'border-gray-100' : ''}
              `}
              onClick={() => date && onSelectDate(date)}
            >
              {date && (
                <div className="flex flex-col h-full">
                  <div className="text-right flex-1">
                    <span className={`
                      inline-flex items-center justify-center 
                      w-4 h-4 sm:w-6 sm:h-6 rounded-full text-xs sm:text-sm
                      ${isToday ? 'bg-purple-600 text-white' : ''}
                      ${!isToday && isPastDate ? 'text-gray-400' : 'text-gray-900'}
                    `}>
                      {date.getDate()}
                    </span>
                  </div>
                  
                  <div className="mt-0.5 sm:mt-1 flex justify-center">
                    {getDayIndicator(dayType)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Prediction Info */}
      {hasData && futurePredictions.length > 0 && (
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg sm:rounded-xl border border-purple-100">
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