# Calculations & Clinical Logic

This document describes the mathematical formulas, biological models, and statistical algorithms used by Ovulate to compute menstrual cycle phases, fertility windows, and educational safe periods.

---

## 1. Biological Constants & Baseline Variables

The menstrual cycle is divided into two primary hormonal phases: the **Follicular Phase** (variable) and the **Luteal Phase** (relatively constant).

| Variable | Default Value | Clinical Range | Description |
| :--- | :--- | :--- | :--- |
| `startDate` | Required | Any valid date | First day of menstrual bleeding (Cycle Day 1). |
| `cycleLength` | `28` days | `20` – `45` days | Total days from the start of one period to the start of the next. |
| `periodLength`| `5` days | `2` – `10` days | Duration of active menstrual bleeding. |
| `lutealPhase` | `14` days | `10` – `16` days | Duration from ovulation until the day before the next menstruation begins. |

---

## 2. Core Mathematical Formulas

All core calculations reside in `src/utils/cycleCalculations.js` as pure functions:

### 2.1 Ovulation Date
The luteal phase remains relatively stable across cycles (~14 days). Therefore, ovulation is calculated backward from the anticipated end of the cycle:

$$\text{Ovulation Offset (days)} = \text{cycleLength} - \text{lutealPhase}$$

$$\text{Ovulation Date} = \text{periodStart} + \text{Ovulation Offset}$$

*Example: For a 28-day cycle with a 14-day luteal phase, ovulation occurs on Cycle Day 14 ($28 - 14 = 14$). For a 32-day cycle, ovulation occurs on Cycle Day 18 ($32 - 14 = 18$).*

```javascript
export const calculateOvulationDate = (periodStart, cycleLength, lutealPhase) => {
  const ovulationDay = cycleLength - lutealPhase;
  const ovulationDate = new Date(periodStart);
  ovulationDate.setDate(ovulationDate.getDate() + ovulationDay);
  return ovulationDate;
};
```

---

### 2.2 Fertile Window (Unsafe Period)
Sperm cells can survive in fertile cervical mucus inside the female reproductive tract for up to **5 days**. The unfertilized ovum remains viable for approximately **12 to 24 hours** after release.

The fertile window is therefore modeled as a **6-day span**:
- 4 days prior to ovulation
- The day of ovulation
- 1 day following ovulation

$$\text{Fertile Start} = \text{Ovulation Date} - 4 \text{ days}$$

$$\text{Fertile End} = \text{Ovulation Date} + 1 \text{ day}$$

```javascript
export const calculateFertileWindow = (ovulationDate) => {
  const fertileStart = new Date(ovulationDate);
  fertileStart.setDate(fertileStart.getDate() - 4);
  
  const fertileEnd = new Date(ovulationDate);
  fertileEnd.setDate(fertileEnd.getDate() + 1);
  
  return { start: fertileStart, end: fertileEnd };
};
```

---

### 2.3 Menstruation Span & Next Period Start

$$\text{Period End} = \text{periodStart} + \text{periodLength} - 1 \text{ day}$$

$$\text{Next Period Start} = \text{periodStart} + \text{cycleLength}$$

---

### 2.4 Educational Safe Window Categorization

When the user activates the **Safe Windows Overlay** on the calendar, days are categorized into biological risk tiers:

```
[ Day 1 ── Period End ]   [ Period End+1 ── Fertile Start-1 ]   [ Fertile Start ── Fertile End ]   [ Fertile End+1 ── Next Period-1 ]
   Active Bleeding                   Early Safe Window                    Fertile Window                   Late Safe Window
(Low Conception Risk)             (Low Risk with Caution)             (HIGH Conception Risk)            (VERY LOW Conception Risk)
```

1. **Active Menstruation (`periodStart` to `periodEnd`)**:
   - Risk: *Low Conception Risk*.
   - Notes: Biologically low probability, but non-zero in women with very short cycles (≤21 days) where follicular development starts early.
2. **Early Safe Window (Pre-Ovulatory: `periodEnd + 1` to `fertileStart - 1`)**:
   - Risk: *Low Conception Risk (Caution)*.
   - Condition: Only exists if $\text{periodEnd} < \text{fertileStart}$. In short cycles (e.g. 21d cycle with 6d bleeding), this phase is `null` because bleeding borders the fertile window directly.
3. **Fertile Window / Unsafe Period (`fertileStart` to `fertileEnd`)**:
   - Risk: *High Conception Risk*.
   - Highest likelihood of pregnancy if unprotected intercourse occurs.
4. **Late Safe Window (Post-Ovulatory: `fertileEnd + 1` to `nextPeriodStart - 1`)**:
   - Risk: *Very Low Conception Risk*.
   - Biological foundation: Once ovulation has passed by >24 hours and the egg degenerates, fertilization is biologically impossible until the next cycle. This represents the most reliable physiological safe phase in regular cycles.

---

## 3. Future Projections (Multi-Month Forecasting)

The `calculateFuturePredictions(cycle, monthsAhead = 6)` generator projects upcoming cycle occurrences for the next 6 cycles using iterative cycle offsets:

$$\text{Cycle } i \text{ Start} = \text{startDate} + (i \times \text{cycleLength})$$

Each projected iteration independently recalculates its period span, ovulation date, fertile window, and early/late safe windows.

---

## 4. Historical Cycle Statistics & Variability

In `src/components/cycle/CycleHistory.jsx`, when multiple cycles are recorded ($n \ge 2$), analytics are computed:

- **Mean Cycle Length**:
  $$\mu = \frac{1}{n} \sum_{i=1}^n \text{cycleLength}_i$$
- **Sample Standard Deviation ($\sigma$)**:
  $$\sigma = \sqrt{\frac{1}{n} \sum_{i=1}^n (\text{cycleLength}_i - \mu)^2}$$
- **Cycle Range**:
  $$[\min(\text{cycleLength}_i), \max(\text{cycleLength}_i)]$$
- **Mean Ovulation Day**:
  $$\overline{\text{Day}}_{\text{ov}} = \frac{1}{n} \sum_{i=1}^n (\text{cycleLength}_i - \text{lutealPhase}_i)$$

---

## 5. Clinical Safety & Medical Limitations

> [!WARNING]
> **Calendar and rhythm-based estimations are strictly educational and informational tools.**
> 1. Normal biological cycles fluctuate due to illness, physical or emotional stress, travel, diet, thyroid function, and age.
> 2. Ovulation may occur earlier or later than predicted by standard calendar arithmetic.
> 3. Natural family planning methods require multi-symptom biomarker tracking (basal body temperature shifts, cervical mucus changes, LH surge testing) to achieve clinical efficacy.
> 4. Ovulate includes visible educational disclaimers reminding users to rely on medically approved contraception if pregnancy avoidance is desired.
