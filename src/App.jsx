import { useState, useEffect } from 'react';
import Header from './components/Header';
import CycleForm from './components/cycle/CycleForm';
import CalendarView from './components/calendar/CalendarView';
import Predictions from './components/predictions/Predictions';
import CycleHistory from './components/cycle/CycleHistory';
import Footer from './components/Footer';

function App() {
  const [cycles, setCycles] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [mobileTab, setMobileTab] = useState('calendar'); // 'calendar' | 'forecast' | 'log' | 'history'

  useEffect(() => {
    // Load cycles from localStorage
    const savedCycles = localStorage.getItem('menstrualCycles');
    if (savedCycles) {
      setCycles(JSON.parse(savedCycles));
    }
  }, []);

  useEffect(() => {
    // Save cycles to localStorage
    if (cycles.length > 0) {
      localStorage.setItem('menstrualCycles', JSON.stringify(cycles));
    }
  }, [cycles]);

  const addCycle = (cycleData) => {
    const newCycle = {
      id: Date.now(),
      ...cycleData,
      addedDate: new Date().toISOString()
    };
    setCycles([...cycles, newCycle]);
    // On mobile, switch to calendar so user immediately sees their updated cycle
    setMobileTab('calendar');
  };

  const deleteCycle = (id) => {
    const updated = cycles.filter(cycle => cycle.id !== id);
    setCycles(updated);
    if (updated.length === 0) {
      localStorage.removeItem('menstrualCycles');
      if (mobileTab === 'history') {
        setMobileTab('calendar');
      }
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all cycle records? This cannot be undone.')) {
      localStorage.removeItem('menstrualCycles');
      setCycles([]);
      setSelectedDate(null);
      setMobileTab('calendar');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F9] text-gray-900 relative selection:bg-rose-100 selection:text-rose-900 flex flex-col justify-between">
      {/* Subtle ambient lighting glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container with Mobile Safe Area Clearance */}
      <main className="max-w-6xl w-full mx-auto px-3.5 py-4 sm:px-6 sm:py-6 md:py-8 pt-safe pb-safe-nav lg:pb-8 flex-1">
        {/* Header */}
        <Header cycles={cycles} onClearAllData={clearAllData} />

        {/* Desktop Layout (>= 1024px) */}
        <div className="hidden lg:grid grid-cols-3 gap-8 items-start">
          {/* Left Column (Logging, Calendar, History) */}
          <div className="lg:col-span-2 space-y-8">
            <div id="add-cycle" className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-rose-100/70 p-7 transition-all duration-200">
              <CycleForm onAddCycle={addCycle} />
            </div>

            <div id="calendar" className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-rose-100/70 p-7 transition-all duration-200">
              <CalendarView 
                cycles={cycles}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            {cycles.length > 0 && (
              <div id="history" className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-rose-100/70 p-7 transition-all duration-200">
                <CycleHistory cycles={cycles} onDeleteCycle={deleteCycle} />
              </div>
            )}
          </div>

          {/* Right Column - Sticky Predictions Sidebar */}
          <div className="lg:col-span-1">
            <div 
              id="predictions" 
              className="bg-white rounded-3xl shadow-xs border border-rose-100/80 p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto custom-scrollbar"
            >
              <Predictions cycles={cycles} />
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Dynamic View (< 1024px) */}
        <div className="lg:hidden space-y-4">
          {mobileTab === 'calendar' && (
            <div className="bg-white rounded-2xl shadow-xs border border-rose-100/70 p-4 sm:p-6 animate-fadeIn">
              <CalendarView 
                cycles={cycles}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>
          )}

          {mobileTab === 'forecast' && (
            <div className="bg-white rounded-2xl shadow-xs border border-rose-100/80 p-4 sm:p-6 animate-fadeIn">
              <Predictions cycles={cycles} />
            </div>
          )}

          {mobileTab === 'log' && (
            <div className="bg-white rounded-2xl shadow-xs border border-rose-100/70 p-4 sm:p-6 animate-fadeIn">
              <CycleForm onAddCycle={addCycle} />
            </div>
          )}

          {mobileTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-xs border border-rose-100/70 p-4 sm:p-6 animate-fadeIn">
              {cycles.length > 0 ? (
                <CycleHistory cycles={cycles} onDeleteCycle={deleteCycle} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No cycle history logged yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* Mobile Bottom Navigation Bar (Android / Mobile Native Ergonomics) */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-rose-100/90 shadow-lg pb-safe"
      >
        <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
          {/* Calendar Tab */}
          <button
            type="button"
            onClick={() => setMobileTab('calendar')}
            className={`cursor-pointer flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
              mobileTab === 'calendar' 
                ? 'text-rose-600 font-bold' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileTab === 'calendar' ? '2.4' : '2'} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-[11px] leading-tight">Calendar</span>
          </button>

          {/* Forecast Tab */}
          <button
            type="button"
            onClick={() => setMobileTab('forecast')}
            className={`cursor-pointer flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
              mobileTab === 'forecast' 
                ? 'text-rose-600 font-bold' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileTab === 'forecast' ? '2.4' : '2'} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[11px] leading-tight">Forecast</span>
          </button>

          {/* Log Period Tab */}
          <button
            type="button"
            onClick={() => setMobileTab('log')}
            className={`cursor-pointer flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
              mobileTab === 'log' 
                ? 'text-rose-600 font-bold' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileTab === 'log' ? '2.4' : '2'} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[11px] leading-tight">Log Cycle</span>
          </button>

          {/* History Tab */}
          <button
            type="button"
            onClick={() => setMobileTab('history')}
            className={`cursor-pointer flex flex-col items-center justify-center min-w-[48px] min-h-[48px] px-2 py-1 rounded-xl transition-all touch-manipulation active:scale-95 relative ${
              mobileTab === 'history' 
                ? 'text-rose-600 font-bold' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileTab === 'history' ? '2.4' : '2'} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[11px] leading-tight">History</span>
            {cycles.length > 0 && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-rose-500" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;