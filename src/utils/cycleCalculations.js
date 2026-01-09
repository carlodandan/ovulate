// Utility functions for menstrual cycle calculations
export const calculateOvulationDate = (periodStart, cycleLength, lutealPhase) => {
  // Ovulation occurs at: cycle length - luteal phase days after period start
  const ovulationDay = cycleLength - lutealPhase;
  const ovulationDate = new Date(periodStart);
  ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
  return ovulationDate;
};

export const calculateFertileWindow = (ovulationDate) => {
  // Fertile window: 4 days before ovulation + ovulation day + 1 day after
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 4);
  
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  
  return { start: fertileStart, end: fertileEnd };
};

export const calculateNextPeriod = (lastPeriodStart, cycleLength) => {
  const nextPeriodStart = new Date(lastPeriodStart);
  nextPeriodStart.setDate(nextPeriodStart.getDate() + cycleLength);
  return nextPeriodStart;
};

export const calculatePeriodEnd = (periodStart, periodLength) => {
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodEnd.getDate() + periodLength - 1);
  return periodEnd;
};

export const calculatePredictions = (cycle) => {
  const {
    startDate,
    cycleLength = 28,
    periodLength = 5,
    lutealPhase = 14
  } = cycle;
  
  const periodStart = new Date(startDate);
  
  // Calculate ovulation for current cycle
  const ovulationDate = calculateOvulationDate(periodStart, cycleLength, lutealPhase);
  const fertileWindow = calculateFertileWindow(ovulationDate);
  const nextPeriodStart = calculateNextPeriod(periodStart, cycleLength);
  
  return {
    ovulationDate,
    fertileWindow,
    nextPeriodStart,
    periodEnd: calculatePeriodEnd(periodStart, periodLength)
  };
};

export const calculateFuturePredictions = (cycle, monthsAhead = 6) => {
  const {
    startDate,
    cycleLength = 28,
    periodLength = 5,
    lutealPhase = 14
  } = cycle;
  
  const predictions = [];
  
  for (let i = 1; i <= monthsAhead; i++) {
    const periodStart = new Date(startDate);
    periodStart.setDate(periodStart.getDate() + (cycleLength * i));
    
    const ovulationDate = calculateOvulationDate(periodStart, cycleLength, lutealPhase);
    const fertileWindow = calculateFertileWindow(ovulationDate);
    const periodEnd = calculatePeriodEnd(periodStart, periodLength);
    
    predictions.push({
      period: {
        start: periodStart,
        end: periodEnd,
        length: periodLength
      },
      ovulation: ovulationDate,
      fertile: fertileWindow
    });
  }
  
  return predictions;
};