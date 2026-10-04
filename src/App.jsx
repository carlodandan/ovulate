import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import CycleForm from './components/cycle/CycleForm';
import CalendarView from './components/calendar/CalendarView';
import Predictions from './components/predictions/Predictions';
import CycleHistory from './components/cycle/CycleHistory';
import Footer from './components/Footer';
import DailyEntryModal from './components/journal/DailyEntryModal';
import CycleSummaryView from './components/journal/CycleSummaryView';
import { reconstructCyclesFromEntries } from './utils/journalCalculations';

function App() {
  const [cycles, setCycles] = useState(() => {
    try {
      const savedCycles = localStorage.getItem('menstrualCycles');
      return savedCycles ? JSON.parse(savedCycles) : [];
    } catch (e) {
      console.error('Failed to parse saved cycles', e);
      return [];
    }
  });

  const [dailyEntries, setDailyEntries] = useState(() => {
    try {
      const savedEntries = localStorage.getItem('ovulateDailyEntries');
      return savedEntries ? JSON.parse(savedEntries) : {};
    } catch (e) {
      console.error('Failed to parse daily entries', e);
      return {};
    }
  });

  const [appMode, setAppMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('ovulateAppMode');
      return (savedMode === 'journal' || savedMode === 'standard') ? savedMode : 'standard';
    } catch {
      return 'standard';
    }
  });

  const [selectedDate, setSelectedDate] = useState(null);
  const [mobileTab, setMobileTab] = useState('calendar'); // 'calendar' | 'forecast' | 'log' | 'history'
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [modalDate, setModalDate] = useState(new Date());

  // Persist standard cycles
  useEffect(() => {
    if (cycles.length > 0) {
      localStorage.setItem('menstrualCycles', JSON.stringify(cycles));
    }
  }, [cycles]);

  // Persist daily journal entries
  useEffect(() => {
    localStorage.setItem('ovulateDailyEntries', JSON.stringify(dailyEntries));
  }, [dailyEntries]);

  // Persist app mode
  useEffect(() => {
    localStorage.setItem('ovulateAppMode', appMode);
  }, [appMode]);

  // Reconstruct actual cycles from journal daily flow logs
  const { actualCycles, stats: actualStats } = useMemo(() => {
    return reconstructCyclesFromEntries(dailyEntries);
  }, [dailyEntries]);

  // Derive effective cycles for predictions and calendar
  const effectiveCycles = useMemo(() => {
    if (cycles.length > 0) {
      // If actual cycle history exists, calibrate predictions with actual averages
      if (actualStats && actualStats.completedCount >= 1) {
        return cycles.map((c, i) => {
          if (i === cycles.length - 1) {
            return {
              ...c,
              cycleLength: actualStats.avgLength || c.cycleLength,
              periodLength: actualStats.avgPeriod || c.periodLength
            };
          }
          return c;
        });
      }
      return cycles;
    }

    // Fallback if user only uses Journal Mode
    if (actualCycles.length > 0) {
      return actualCycles.map(c => ({
        id: c.id,
        startDate: c.startDate,
        endDate: c.endDate,
        cycleLength: c.cycleLength || actualStats?.avgLength || 28,
        periodLength: c.periodLength || actualStats?.avgPeriod || 5,
        lutealPhase: 14,
        addedDate: c.startDate
      }));
    }

    return [];
  }, [cycles, actualCycles, actualStats]);

  const addCycle = (cycleData) => {
    const newCycle = {
      id: Date.now(),
      ...cycleData,
      addedDate: new Date().toISOString()
    };
    setCycles([...cycles, newCycle]);
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
    if (window.confirm('Are you sure you want to clear all cycle records and journal logs? This cannot be undone.')) {
      localStorage.removeItem('menstrualCycles');
      localStorage.removeItem('ovulateDailyEntries');
      setCycles([]);
      setDailyEntries({});
      setSelectedDate(null);
      setMobileTab('calendar');
    }
  };

  const handleOpenEntryModal = (date) => {
    setModalDate(date || new Date());
    setIsEntryModalOpen(true);
  };

  const handleSaveDailyEntry = (entryData) => {
    setDailyEntries(prev => ({
      ...prev,
      [entryData.date]: entryData
    }));
  };

  const handleDeleteDailyEntry = (dateStr) => {
    setDailyEntries(prev => {
      const updated = { ...prev };
      delete updated[dateStr];
      return updated;
    });
  };

  const selectedDateStr = modalDate ? (typeof modalDate === 'string' ? modalDate : modalDate.toISOString().split('T')[0]) : null;
  const currentModalEntry = selectedDateStr ? dailyEntries[selectedDateStr] : null;
  const dailyEntriesCount = Object.keys(dailyEntries).length;

  return (
    <div className="min-h-screen bg-[#FAF7F9] text-gray-900 relative selection:bg-rose-100 selection:text-rose-900 flex flex-col justify-between">
      {/* Subtle ambient lighting glows */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-200/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-10 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container with Mobile Safe Area Clearance */}
      <main className="max-w-6xl w-full mx-auto px-3.5 py-4 sm:px-6 sm:py-6 md:py-8 pt-safe pb-safe-nav lg:pb-8 flex-1">
        {/* Header */}
        <Header 
          cycles={cycles} 
          dailyEntriesCount={dailyEntriesCount}
          mode={appMode}
          onToggleMode={setAppMode}
          onClearAllData={clearAllData} 
        />

        {/* Desktop Layout (>= 1024px) */}
        <div className="hidden lg:grid grid-cols-3 gap-8 items-start">
          {/* Left Column (Logging, Calendar, History / Summary) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Standard Mode: Cycle Form */}
            {appMode === 'standard' && (
              <div id="add-cycle" className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-rose-100/70 p-7 transition-all duration-200">
                <CycleForm onAddCycle={addCycle} />
              </div>
            )}

            {/* Journal Mode: Action Bar & Cycle Summary */}
            {appMode === 'journal' && (
              <div className="bg-white rounded-3xl shadow-xs border border-purple-100/80 p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 text-base font-heading">
                        Journal Mode Active
                      </h3>
                      <p className="text-xs text-gray-500">Record daily symptoms, bleeding flow, and biomarkers</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenEntryModal(new Date())}
                    className="cursor-pointer min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 active:bg-rose-900 shadow-xs active:scale-95 transition-all inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                    </svg>
                    <span>Log Today's Entry</span>
                  </button>
                </div>

                {/* Actual Cycle Summary View */}
                {actualCycles.length > 0 && (
                  <div className="pt-4 border-t border-purple-100/60">
                    <CycleSummaryView 
                      actualCycles={actualCycles} 
                      onSelectCycleDate={setSelectedDate}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Interactive Calendar (Supports both modes) */}
            <div id="calendar" className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-rose-100/70 p-7 transition-all duration-200">
              <CalendarView 
                cycles={effectiveCycles}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                mode={appMode}
                dailyEntries={dailyEntries}
                onOpenEntryModal={handleOpenEntryModal}
              />
            </div>

            {/* Cycle History (Supports both standard input and actual reconstructed cycles) */}
            {(cycles.length > 0 || actualCycles.length > 0) && (
              <div id="history" className="bg-white rounded-3xl shadow-xs hover:shadow-sm border border-rose-100/70 p-7 transition-all duration-200">
                <CycleHistory 
                  cycles={cycles} 
                  actualCycles={actualCycles}
                  mode={appMode}
                  onDeleteCycle={deleteCycle} 
                />
              </div>
            )}
          </div>

          {/* Right Column - Sticky Predictions Sidebar */}
          <div className="lg:col-span-1">
            <div 
              id="predictions" 
              className="bg-white rounded-3xl shadow-xs border border-rose-100/80 p-6 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto custom-scrollbar"
            >
              <Predictions 
                cycles={effectiveCycles} 
                actualStats={actualStats}
                hasActualData={actualCycles.length > 0}
              />
            </div>
          </div>
        </div>

        {/* Mobile / Tablet Dynamic View (< 1024px) */}
        <div className="lg:hidden space-y-4">
          {mobileTab === 'calendar' && (
            <div className="bg-white rounded-2xl shadow-xs border border-rose-100/70 p-4 sm:p-6 animate-fadeIn">
              <CalendarView 
                cycles={effectiveCycles}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                mode={appMode}
                dailyEntries={dailyEntries}
                onOpenEntryModal={handleOpenEntryModal}
              />
            </div>
          )}

          {mobileTab === 'forecast' && (
            <div className="bg-white rounded-2xl shadow-xs border border-rose-100/80 p-4 sm:p-6 animate-fadeIn">
              <Predictions 
                cycles={effectiveCycles} 
                actualStats={actualStats}
                hasActualData={actualCycles.length > 0}
              />
            </div>
          )}

          {mobileTab === 'log' && (
            <div className="bg-white rounded-2xl shadow-xs border border-rose-100/70 p-4 sm:p-6 animate-fadeIn">
              {appMode === 'standard' ? (
                <CycleForm onAddCycle={addCycle} />
              ) : (
                <div className="space-y-5">
                  <div className="text-center p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
                    <h3 className="text-base font-bold text-gray-900 font-heading mb-1">
                      Daily Journal Entry
                    </h3>
                    <p className="text-xs text-gray-500 mb-4">
                      Record today's flow, symptoms, temperature, and cervical observations
                    </p>
                    <button
                      type="button"
                      onClick={() => handleOpenEntryModal(new Date())}
                      className="cursor-pointer w-full min-h-[48px] px-4 py-3 rounded-xl text-sm font-bold text-white bg-rose-700 hover:bg-rose-800 active:bg-rose-900 shadow-xs active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Log Today's Entry</span>
                    </button>
                  </div>

                  {actualCycles.length > 0 && (
                    <div className="pt-2">
                      <CycleSummaryView 
                        actualCycles={actualCycles} 
                        onSelectCycleDate={(d) => {
                          setSelectedDate(d);
                          setMobileTab('calendar');
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {mobileTab === 'history' && (
            <div className="bg-white rounded-2xl shadow-xs border border-rose-100/70 p-4 sm:p-6 animate-fadeIn">
              {cycles.length > 0 || actualCycles.length > 0 ? (
                <CycleHistory 
                  cycles={cycles} 
                  actualCycles={actualCycles}
                  mode={appMode}
                  onDeleteCycle={deleteCycle} 
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-500">No cycle history or journal logs recorded yet.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </main>

      {/* Daily Entry Modal */}
      <DailyEntryModal
        isOpen={isEntryModalOpen}
        date={modalDate}
        existingEntry={currentModalEntry}
        onSave={handleSaveDailyEntry}
        onDelete={handleDeleteDailyEntry}
        onClose={() => setIsEntryModalOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar (Android / Mobile Native Ergonomics) */}
      <nav 
        aria-label="Mobile Navigation"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-rose-100/90 shadow-lg pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
      >
        <div className="max-w-md mx-auto px-3 py-1.5 flex items-center justify-around">
          {/* Calendar Tab */}
          <button
            type="button"
            onClick={() => setMobileTab('calendar')}
            className={`cursor-pointer flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-3 py-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
              mobileTab === 'calendar' 
                ? 'bg-rose-50 text-rose-800 font-bold' 
                : 'text-gray-500 hover:text-gray-700'
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
            className={`cursor-pointer flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-3 py-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
              mobileTab === 'forecast' 
                ? 'bg-rose-50 text-rose-800 font-bold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileTab === 'forecast' ? '2.4' : '2'} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-[11px] leading-tight">Forecast</span>
          </button>

          {/* Log / Journal Tab */}
          <button
            type="button"
            onClick={() => setMobileTab('log')}
            className={`cursor-pointer flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-3 py-1 rounded-xl transition-all touch-manipulation active:scale-95 ${
              mobileTab === 'log' 
                ? 'bg-rose-50 text-rose-800 font-bold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {appMode === 'journal' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileTab === 'log' ? '2.4' : '2'} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileTab === 'log' ? '2.4' : '2'} d="M12 4v16m8-8H4" />
              )}
            </svg>
            <span className="text-[11px] leading-tight">{appMode === 'journal' ? 'Journal' : 'Log Cycle'}</span>
          </button>

          {/* History Tab */}
          <button
            type="button"
            onClick={() => setMobileTab('history')}
            className={`cursor-pointer flex flex-col items-center justify-center min-w-[56px] min-h-[48px] px-3 py-1 rounded-xl transition-all touch-manipulation active:scale-95 relative ${
              mobileTab === 'history' 
                ? 'bg-rose-50 text-rose-800 font-bold' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={mobileTab === 'history' ? '2.4' : '2'} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[11px] leading-tight">History</span>
            {(cycles.length > 0 || actualCycles.length > 0) && (
              <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-rose-600 shadow-2xs" />
            )}
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;