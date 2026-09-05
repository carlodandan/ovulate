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
  };

  const deleteCycle = (id) => {
    const updated = cycles.filter(cycle => cycle.id !== id);
    setCycles(updated);
    if (updated.length === 0) {
      localStorage.removeItem('menstrualCycles');
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all cycle records? This cannot be undone.')) {
      localStorage.removeItem('menstrualCycles');
      setCycles([]);
      setSelectedDate(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F9] text-gray-900 relative selection:bg-rose-100 selection:text-rose-900">
      {/* Subtle ambient lighting glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 md:py-10">
        {/* Header */}
        <Header cycles={cycles} onClearAllData={clearAllData} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
          {/* Left Column (Logging, Calendar, History) */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            <div id="add-cycle" className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-rose-100/70 p-5 sm:p-7 transition-all duration-200">
              <CycleForm onAddCycle={addCycle} />
            </div>

            <div id="calendar" className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-rose-100/70 p-5 sm:p-7 transition-all duration-200">
              <CalendarView 
                cycles={cycles}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            {cycles.length > 0 && (
              <div id="history" className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-rose-100/70 p-5 sm:p-7 transition-all duration-200">
                <CycleHistory cycles={cycles} onDeleteCycle={deleteCycle} />
              </div>
            )}
          </div>

          {/* Right Column - Sticky Predictions Sidebar */}
          <div className="lg:col-span-1">
            <div 
              id="predictions" 
              className="bg-white rounded-3xl shadow-xs border border-rose-100/80 p-5 sm:p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto custom-scrollbar"
            >
              <Predictions cycles={cycles} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}

export default App;