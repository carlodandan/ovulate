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
  periodStart.setHours(0, 0, 0, 0);
  
  // Calculate ovulation for current cycle
  const ovulationDate = calculateOvulationDate(periodStart, cycleLength, lutealPhase);
  ovulationDate.setHours(0, 0, 0, 0);
  
  const fertileWindow = calculateFertileWindow(ovulationDate);
  fertileWindow.start.setHours(0, 0, 0, 0);
  fertileWindow.end.setHours(0, 0, 0, 0);
  
  const nextPeriodStart = calculateNextPeriod(periodStart, cycleLength);
  nextPeriodStart.setHours(0, 0, 0, 0);
  
  const periodEnd = calculatePeriodEnd(periodStart, periodLength);
  periodEnd.setHours(0, 0, 0, 0);
  
  // Early Safe Period: [periodEnd + 1 day, fertileWindow.start - 1 day]
  const earlySafeStart = new Date(periodEnd);
  earlySafeStart.setDate(earlySafeStart.getDate() + 1);
  
  const earlySafeEnd = new Date(fertileWindow.start);
  earlySafeEnd.setDate(earlySafeEnd.getDate() - 1);
  
  const hasEarlySafe = earlySafeStart <= earlySafeEnd;
  
  // Late Safe Period: [fertileWindow.end + 1 day, nextPeriodStart - 1 day]
  const lateSafeStart = new Date(fertileWindow.end);
  lateSafeStart.setDate(lateSafeStart.getDate() + 1);
  
  const lateSafeEnd = new Date(nextPeriodStart);
  lateSafeEnd.setDate(lateSafeEnd.getDate() - 1);
  
  const hasLateSafe = lateSafeStart <= lateSafeEnd;
  
  return {
    ovulationDate,
    fertileWindow,
    nextPeriodStart,
    periodEnd,
    earlySafeWindow: hasEarlySafe ? { start: earlySafeStart, end: earlySafeEnd } : null,
    lateSafeWindow: hasLateSafe ? { start: lateSafeStart, end: lateSafeEnd } : null,
    unsafeWindow: { start: fertileWindow.start, end: fertileWindow.end }
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
    periodStart.setHours(0, 0, 0, 0);
    
    const ovulationDate = calculateOvulationDate(periodStart, cycleLength, lutealPhase);
    ovulationDate.setHours(0, 0, 0, 0);
    
    const fertileWindow = calculateFertileWindow(ovulationDate);
    fertileWindow.start.setHours(0, 0, 0, 0);
    fertileWindow.end.setHours(0, 0, 0, 0);
    
    const periodEnd = calculatePeriodEnd(periodStart, periodLength);
    periodEnd.setHours(0, 0, 0, 0);
    
    const nextPeriodStart = new Date(periodStart);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + cycleLength);
    nextPeriodStart.setHours(0, 0, 0, 0);
    
    // Early Safe Period
    const earlySafeStart = new Date(periodEnd);
    earlySafeStart.setDate(earlySafeStart.getDate() + 1);
    
    const earlySafeEnd = new Date(fertileWindow.start);
    earlySafeEnd.setDate(earlySafeEnd.getDate() - 1);
    
    const hasEarlySafe = earlySafeStart <= earlySafeEnd;
    
    // Late Safe Period
    const lateSafeStart = new Date(fertileWindow.end);
    lateSafeStart.setDate(lateSafeStart.getDate() + 1);
    
    const lateSafeEnd = new Date(nextPeriodStart);
    lateSafeEnd.setDate(lateSafeEnd.getDate() - 1);
    
    const hasLateSafe = lateSafeStart <= lateSafeEnd;
    
    predictions.push({
      period: {
        start: periodStart,
        end: periodEnd,
        length: periodLength
      },
      ovulation: ovulationDate,
      fertile: fertileWindow,
      earlySafeWindow: hasEarlySafe ? { start: earlySafeStart, end: earlySafeEnd } : null,
      lateSafeWindow: hasLateSafe ? { start: lateSafeStart, end: lateSafeEnd } : null,
      unsafeWindow: { start: fertileWindow.start, end: fertileWindow.end }
    });
  }
  
  return predictions;
};