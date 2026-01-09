import { useMemo } from 'react';
import {
  calculatePredictions,
  calculateFuturePredictions
} from '../utils/cycleCalculations';

export const useCyclePredictions = (cycles) => {
  return useMemo(() => {
    if (cycles.length === 0) {
      return {
        hasData: false,
        currentPredictions: null,
        futurePredictions: []
      };
    }

    const lastCycle = cycles[cycles.length - 1];
    
    // Calculate current predictions based on last cycle
    const currentPredictions = calculatePredictions(lastCycle);
    
    // Calculate future predictions for next 6 cycles
    const futurePredictions = calculateFuturePredictions(lastCycle, 6);
    
    // Calculate ovulation day for display
    const cycleLength = lastCycle.cycleLength || 28;
    const lutealPhase = lastCycle.lutealPhase || 14;
    const ovulationDay = cycleLength - lutealPhase;

    return {
      hasData: true,
      currentPredictions,
      futurePredictions,
      lastCycle,
      ovulationDay,
      cycleInfo: {
        cycleLength,
        periodLength: lastCycle.periodLength || 5,
        lutealPhase
      }
    };
  }, [cycles]);
};