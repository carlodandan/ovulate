import { useState } from 'react';
import {
  FLOW_OPTIONS,
  SYMPTOM_OPTIONS,
  MUCUS_OPTIONS,
  OVULATION_TEST_OPTIONS
} from '../../utils/journalCalculations';
import SymptomIcon from '../common/SymptomIcon';

const DailyEntryForm = ({
  dateStr,
  existingEntry,
  onSave,
  onDelete,
  onClose
}) => {
  const [flow, setFlow] = useState(existingEntry?.flow || 'none');
  const [symptoms, setSymptoms] = useState(existingEntry?.symptoms || []);
  const [otherSymptom, setOtherSymptom] = useState(existingEntry?.otherSymptom || '');
  const [cervicalMucus, setCervicalMucus] = useState(existingEntry?.cervicalMucus || '');
  const [temperature, setTemperature] = useState(
    existingEntry?.temperature !== undefined && existingEntry?.temperature !== null
      ? existingEntry.temperature
      : ''
  );
  const [tempUnit, setTempUnit] = useState(existingEntry?.tempUnit || 'C');
  const [ovulationTest, setOvulationTest] = useState(existingEntry?.ovulationTest || '');
  const [notes, setNotes] = useState(existingEntry?.notes || '');

  const formattedDate = new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const toggleSymptom = (key) => {
    if (symptoms.includes(key)) {
      setSymptoms(symptoms.filter(s => s !== key));
    } else {
      setSymptoms([...symptoms, key]);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const entryData = {
      date: dateStr,
      flow,
      symptoms,
      otherSymptom: symptoms.includes('other') ? otherSymptom : '',
      cervicalMucus,
      temperature: temperature !== '' ? parseFloat(temperature) : null,
      tempUnit,
      ovulationTest,
      notes: notes.trim(),
      updatedAt: new Date().toISOString()
    };
    onSave(entryData);
    onClose();
  };

  const handleDelete = () => {
    if (window.confirm('Delete entry for this day?')) {
      onDelete(dateStr);
      onClose();
    }
  };

  const hasAnyData = Boolean(
    existingEntry && (
      (existingEntry.flow && existingEntry.flow !== 'none') ||
      (existingEntry.symptoms && existingEntry.symptoms.length > 0) ||
      existingEntry.cervicalMucus ||
      existingEntry.temperature ||
      existingEntry.ovulationTest ||
      existingEntry.notes
    )
  );

  return (
    <div className="relative w-full sm:max-w-xl max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-rose-100/80 flex flex-col overflow-hidden z-10 animate-slideUp sm:animate-fadeIn">
      {/* Mobile Drawer Grab Handle */}
      <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto my-2 sm:hidden shrink-0" />

      {/* Header */}
      <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-gray-100 flex items-center justify-between bg-rose-50/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-700 text-white flex items-center justify-center shadow-2xs">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Daily Journal Entry</span>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 font-heading">
              {formattedDate}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable Content Form */}
      <form onSubmit={handleSave} className="overflow-y-auto px-5 py-4 sm:px-6 sm:py-5 space-y-5 custom-scrollbar flex-1 pb-safe sm:pb-5">
        {/* Period / Flow Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              Menstrual Flow
            </label>
            <span className="text-[11px] text-gray-400">Actual bleeding level</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {FLOW_OPTIONS.map((opt) => {
              const isSelected = flow === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setFlow(opt.key)}
                  className={`cursor-pointer px-2.5 py-2.5 rounded-xl text-xs font-semibold border transition-all text-center touch-manipulation min-h-[46px] flex flex-col items-center justify-center ${
                    isSelected
                      ? opt.key === 'none'
                        ? 'bg-gray-900 text-white border-gray-900 shadow-xs'
                        : 'bg-rose-700 text-white border-rose-700 shadow-xs ring-1 ring-rose-300'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-rose-50/50 hover:border-rose-200 active:scale-[0.98]'
                  }`}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Symptoms Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              Logged Symptoms ({symptoms.length})
            </label>
            <span className="text-[11px] text-gray-400">Tap to toggle</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {SYMPTOM_OPTIONS.map((sym) => {
              const isSelected = symptoms.includes(sym.key);
              return (
                <button
                  key={sym.key}
                  type="button"
                  onClick={() => toggleSymptom(sym.key)}
                  className={`cursor-pointer px-3 py-2 rounded-xl text-xs font-medium border transition-all inline-flex items-center gap-2 touch-manipulation min-h-[42px] ${
                    isSelected
                      ? 'bg-purple-50 text-purple-900 border-purple-300 ring-1 ring-purple-300 font-semibold'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-purple-50/50 hover:border-purple-200 active:scale-[0.98]'
                  }`}
                >
                  <SymptomIcon 
                    type={sym.key} 
                    className={`w-4 h-4 shrink-0 ${isSelected ? 'text-purple-700' : 'text-gray-500'}`} 
                  />
                  <span>{sym.label}</span>
                </button>
              );
            })}
          </div>

          {symptoms.includes('other') && (
            <div className="mt-2.5 animate-fadeIn">
              <input
                type="text"
                placeholder="Specify other symptoms..."
                value={otherSymptom}
                onChange={(e) => setOtherSymptom(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/25 min-h-[44px]"
              />
            </div>
          )}
        </div>

        {/* Cervical Mucus & LH Test (2-columns on tablet/desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Cervical Mucus */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              Cervical Fluid / Mucus
            </label>
            <select
              value={cervicalMucus}
              onChange={(e) => setCervicalMucus(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25 cursor-pointer min-h-[46px]"
            >
              {MUCUS_OPTIONS.map((m) => (
                <option key={m.key} value={m.key}>
                  {m.label} {m.description ? `— ${m.description}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Ovulation Test */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              Ovulation (LH) Strip Test
            </label>
            <select
              value={ovulationTest}
              onChange={(e) => setOvulationTest(e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/25 cursor-pointer min-h-[46px]"
            >
              {OVULATION_TEST_OPTIONS.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label} {t.description ? `— ${t.description}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Basal Body Temperature */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-600" />
              Basal Body Temperature (BBT)
            </label>
            <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setTempUnit('C')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  tempUnit === 'C' ? 'bg-white shadow-2xs text-sky-700 font-bold' : 'text-gray-500'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setTempUnit('F')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  tempUnit === 'F' ? 'bg-white shadow-2xs text-sky-700 font-bold' : 'text-gray-500'
                }`}
              >
                °F
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min={tempUnit === 'C' ? '35.0' : '95.0'}
              max={tempUnit === 'C' ? '41.0' : '106.0'}
              placeholder={tempUnit === 'C' ? 'e.g. 36.65' : 'e.g. 97.97'}
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              className="w-full px-3.5 py-2.5 min-h-[46px] bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/25"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-semibold pointer-events-none">
              °{tempUnit}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-800 mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            Notes & Observations
          </label>
          <textarea
            rows={3}
            placeholder="Energy, medications, intimacy, mood, or sleep notes..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/25 resize-none min-h-[80px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center justify-between gap-3 border-t border-gray-100">
          {hasAnyData ? (
            <button
              type="button"
              onClick={handleDelete}
              className="cursor-pointer min-h-[46px] px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 active:scale-95 transition-all inline-flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete Entry</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer min-h-[46px] px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer min-h-[46px] px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 active:bg-rose-900 shadow-sm active:scale-95 transition-all inline-flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span>Save Day</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const DailyEntryModal = ({
  isOpen,
  date,
  existingEntry,
  onSave,
  onDelete,
  onClose
}) => {
  if (!isOpen || !date) return null;

  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
      {/* Click outside backdrop */}
      <div 
        className="absolute inset-0" 
        onClick={onClose} 
      />

      <DailyEntryForm
        key={dateStr}
        dateStr={dateStr}
        existingEntry={existingEntry}
        onSave={onSave}
        onDelete={onDelete}
        onClose={onClose}
      />
    </div>
  );
};

export default DailyEntryModal;
