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
      <h2 className="text-xl font-semibold text-purple-700 mb-4">➕ Add Your Cycle</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Period Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cycle Length (days)
            </label>
            <input
              type="number"
              min="20"
              max="45"
              value={cycleLength}
              onChange={(e) => setCycleLength(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Period Length (days)
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={periodLength}
              onChange={(e) => setPeriodLength(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Luteal Phase (days)
            </label>
            <input
              type="number"
              min="10"
              max="16"
              value={lutealPhase}
              onChange={(e) => setLutealPhase(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Save Cycle Data
        </button>
      </form>
    </div>
  );
};

export default CycleForm;