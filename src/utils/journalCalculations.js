// Utilities for Journal Mode, daily entries, and cycle reconstruction

export const SYMPTOM_OPTIONS = [
  { key: 'cramps', label: 'Cramps', iconKey: 'cramps' },
  { key: 'headache', label: 'Headache', iconKey: 'headache' },
  { key: 'backache', label: 'Backache', iconKey: 'backache' },
  { key: 'bloating', label: 'Bloating', iconKey: 'bloating' },
  { key: 'breast_tenderness', label: 'Breast Tenderness', iconKey: 'breast_tenderness' },
  { key: 'fatigue', label: 'Fatigue', iconKey: 'fatigue' },
  { key: 'nausea', label: 'Nausea', iconKey: 'nausea' },
  { key: 'acne', label: 'Acne', iconKey: 'acne' },
  { key: 'mood_changes', label: 'Mood Changes', iconKey: 'mood_changes' },
  { key: 'other', label: 'Other', iconKey: 'other' }
];

export const FLOW_OPTIONS = [
  { key: 'none', label: 'None', description: 'No bleeding' },
  { key: 'spotting', label: 'Spotting', description: 'Very light droplets/spotting' },
  { key: 'light', label: 'Light', description: 'Light flow' },
  { key: 'medium', label: 'Medium', description: 'Moderate/normal flow' },
  { key: 'heavy', label: 'Heavy', description: 'Heavy menstrual flow' }
];

export const MUCUS_OPTIONS = [
  { key: '', label: 'None / Unrecorded' },
  { key: 'dry', label: 'Dry / None', description: 'Post-period dryness (least fertile)' },
  { key: 'sticky', label: 'Sticky / Tacky', description: 'Thick, white or cloudy' },
  { key: 'creamy', label: 'Creamy / Lotion', description: 'Smooth, milky white' },
  { key: 'eggwhite', label: 'Egg White (Fertile)', description: 'Clear, stretchy, slippery (most fertile)' },
  { key: 'watery', label: 'Watery', description: 'Thin, clear, fluid' }
];

export const OVULATION_TEST_OPTIONS = [
  { key: '', label: 'None / Unrecorded' },
  { key: 'negative', label: 'Negative', description: 'No LH surge detected' },
  { key: 'low', label: 'Low LH', description: 'Faint test line' },
  { key: 'high', label: 'High LH', description: 'Elevated LH level' },
  { key: 'peak', label: 'Peak / Positive', description: 'LH surge detected; ovulation likely in 24-36h' }
];

/**
 * Reconstruct actual menstrual cycles from logged daily flow entries.
 * Clinically, Cycle Day 1 is the first day of menstrual bleeding (light, medium, heavy, or spotting followed by bleeding).
 * Successive bleeding episodes separated by at least 16 days are considered new cycles.
 */
export const reconstructCyclesFromEntries = (entries = {}) => {
  const dates = Object.keys(entries).sort();
  if (dates.length === 0) {
    return {
      actualCycles: [],
      currentCycle: null,
      stats: null
    };
  }

  // Find all dates where flow is present
  const flowDays = dates.filter(dateStr => {
    const entry = entries[dateStr];
    return entry && entry.flow && entry.flow !== 'none';
  });

  if (flowDays.length === 0) {
    return {
      actualCycles: [],
      currentCycle: null,
      stats: null
    };
  }

  // Group into distinct bleeding episodes
  const episodes = [];
  let currentEpisode = [flowDays[0]];

  for (let i = 1; i < flowDays.length; i++) {
    const prevDate = new Date(flowDays[i - 1]);
    const currDate = new Date(flowDays[i]);
    const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));

    // If bleeding is consecutive or has at most a 2-day gap (intermittent spotting during period)
    if (diffDays <= 3) {
      currentEpisode.push(flowDays[i]);
    } else {
      episodes.push(currentEpisode);
      currentEpisode = [flowDays[i]];
    }
  }
  if (currentEpisode.length > 0) {
    episodes.push(currentEpisode);
  }

  // Filter episodes to those representing true cycle starts (at least 16 days from previous start)
  const cycleStarts = [];
  for (const ep of episodes) {
    const startStr = ep[0];
    const epStartDate = new Date(startStr);

    if (cycleStarts.length === 0) {
      cycleStarts.push({
        startDate: startStr,
        periodDays: ep,
        endDate: ep[ep.length - 1]
      });
    } else {
      const prevStart = new Date(cycleStarts[cycleStarts.length - 1].startDate);
      const diff = Math.round((epStartDate - prevStart) / (1000 * 60 * 60 * 24));

      if (diff >= 16) {
        cycleStarts.push({
          startDate: startStr,
          periodDays: ep,
          endDate: ep[ep.length - 1]
        });
      } else {
        // Part of the same cycle's mid-cycle spotting or prolonged bleeding
        const last = cycleStarts[cycleStarts.length - 1];
        last.periodDays = [...new Set([...last.periodDays, ...ep])].sort();
        last.endDate = last.periodDays[last.periodDays.length - 1];
      }
    }
  }

  // Build cycle objects with lengths, symptoms, and observations
  const actualCycles = [];
  for (let i = 0; i < cycleStarts.length; i++) {
    const cycleItem = cycleStarts[i];
    const start = new Date(cycleItem.startDate);
    let cycleLength = null;
    let nextStartStr = null;

    if (i < cycleStarts.length - 1) {
      const nextStart = new Date(cycleStarts[i + 1].startDate);
      cycleLength = Math.round((nextStart - start) / (1000 * 60 * 60 * 24));
      nextStartStr = cycleStarts[i + 1].startDate;
    }

    const periodLength = cycleItem.periodDays.length;

    // Collect all entries and symptoms falling within this cycle
    const cycleEntries = {};
    const cycleSymptoms = {};
    let bbtCount = 0;
    let bbtSum = 0;
    let peakOvulationDate = null;

    for (const dStr of dates) {
      const d = new Date(dStr);
      if (d >= start && (!nextStartStr || d < new Date(nextStartStr))) {
        const e = entries[dStr];
        cycleEntries[dStr] = e;

        if (e.symptoms && Array.isArray(e.symptoms)) {
          e.symptoms.forEach(sym => {
            cycleSymptoms[sym] = (cycleSymptoms[sym] || 0) + 1;
          });
        }

        if (e.temperature) {
          const tempNum = parseFloat(e.temperature);
          if (!isNaN(tempNum)) {
            bbtCount++;
            bbtSum += tempNum;
          }
        }

        if (e.ovulationTest === 'peak' || e.ovulationTest === 'high') {
          peakOvulationDate = dStr;
        }
      }
    }

    actualCycles.push({
      id: `actual-${cycleItem.startDate}`,
      startDate: cycleItem.startDate,
      endDate: cycleItem.endDate,
      cycleLength: cycleLength || 28, // If ongoing, defaults to 28 for estimation
      isCompleted: cycleLength !== null,
      periodLength: Math.max(1, periodLength),
      lutealPhase: 14,
      isActual: true,
      symptoms: cycleSymptoms,
      avgBbt: bbtCount > 0 ? (bbtSum / bbtCount).toFixed(2) : null,
      peakOvulationDate,
      totalLoggedDays: Object.keys(cycleEntries).length
    });
  }

  // Calculate statistics across completed cycles
  const completed = actualCycles.filter(c => c.isCompleted);
  let stats = null;

  if (completed.length > 0) {
    const lengths = completed.map(c => c.cycleLength);
    const periodLengths = completed.map(c => c.periodLength);
    const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const avgPeriod = periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length;

    stats = {
      completedCount: completed.length,
      avgLength: Math.round(avgLength),
      avgPeriod: Math.round(avgPeriod),
      shortestLength: Math.min(...lengths),
      longestLength: Math.max(...lengths)
    };
  }

  // Current (latest) active cycle
  const currentCycle = actualCycles.length > 0 ? actualCycles[actualCycles.length - 1] : null;

  return {
    actualCycles,
    currentCycle,
    stats
  };
};

/**
 * Get detailed summary of a specific cycle with previous cycle comparisons
 */
export const getCycleSummaryDetails = (cycle, prevCycle = null) => {
  if (!cycle) return null;

  let comparison = null;
  if (prevCycle && prevCycle.isCompleted) {
    const diff = cycle.cycleLength - prevCycle.cycleLength;
    comparison = {
      diffDays: diff,
      text: diff === 0
        ? 'Identical length to previous cycle'
        : diff > 0
        ? `${diff} days longer than previous cycle`
        : `${Math.abs(diff)} days shorter than previous cycle`
    };
  }

  return {
    cycle,
    comparison
  };
};
