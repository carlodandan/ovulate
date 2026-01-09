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
    setCycles(cycles.filter(cycle => cycle.id !== id));
  };

  const clearAllData = () => {
    localStorage.removeItem('menstrualCycles');
    setCycles([]);
    alert('All data has been cleared successfully.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Use the new Header component */}
        <Header cycles={cycles} onClearAllData={clearAllData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6 md:space-y-8">
            <div id="add-cycle" className="bg-white rounded-2xl shadow-lg p-4">
              <CycleForm onAddCycle={addCycle} />
            </div>

            <div id="calendar" className="bg-white rounded-2xl shadow-lg p-4">
              <CalendarView 
                cycles={cycles}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />
            </div>

            {cycles.length > 0 && (
              <div id="history" className="bg-white rounded-2xl shadow-lg p-4">
                <CycleHistory cycles={cycles} onDeleteCycle={deleteCycle} />
              </div>
            )}
          </div>

          {/* Right Column - Predictions */}
          <div className="lg:col-span-1">
            <div id="predictions" className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 sticky top-6">
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