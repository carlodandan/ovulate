# Components & Hooks Technical Reference

This document provides a comprehensive API and technical reference for all React components, custom hooks, and utility modules within the Ovulate application.

---

## 1. Application Root (`src/App.jsx`)

The central orchestration component that holds the global state, interacts with `localStorage`, and handles responsive layout switching between desktop and mobile.

### State
| State Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `cycles` | `Array<Cycle>` | `[]` | Array of logged cycle objects loaded from `localStorage['menstrualCycles']`. |
| `selectedDate` | `Date \| null` | `null` | The calendar date currently selected by the user for inspection. |
| `mobileTab` | `string` | `'calendar'` | Active mobile tab: `'calendar' \| 'forecast' \| 'log' \| 'history'`. |

### Handlers & Methods
- **`addCycle(cycleData: Object): void`**:
  Generates an `id` (`Date.now()`), appends `addedDate`, appends to `cycles` array, and automatically sets `mobileTab` to `'calendar'`.
- **`deleteCycle(id: number): void`**:
  Filters out the targeted cycle by ID. If array becomes empty, purges `menstrualCycles` from `localStorage` and resets tab if in history.
- **`clearAllData(): void`**:
  Prompts the user with `window.confirm`. On confirmation, purges `localStorage`, clears `cycles`, resets `selectedDate`, and resets `mobileTab` to `'calendar'`.

---

## 2. Predictions Hook (`src/hooks/useCyclePredictions.js`)

A memoized hook that consumes the `cycles` array and computes prediction sets whenever cycles change.

### Signature
```typescript
function useCyclePredictions(cycles: Cycle[]): {
  hasData: boolean;
  currentPredictions: PredictionResult | null;
  futurePredictions: FuturePrediction[];
  lastCycle?: Cycle;
  ovulationDay?: number;
  cycleInfo?: {
    cycleLength: number;
    periodLength: number;
    lutealPhase: number;
  };
}
```

### Calculation Strategy
1. Extracts `lastCycle = cycles[cycles.length - 1]`.
2. Invokes `calculatePredictions(lastCycle)` to derive active cycle boundaries.
3. Invokes `calculateFuturePredictions(lastCycle, 6)` to project 6 subsequent cycles.
4. Returns computed cycle metadata (`ovulationDay = cycleLength - lutealPhase`).

---

## 3. Brand Header (`src/components/Header.jsx`)

### Props
| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cycles` | `Array<Cycle>` | No (default `[]`) | Historical cycles for statistics. |
| `onClearAllData` | `Function` | No | Callback invoked when user confirms database purge. |

### Visual Elements
- Displays app logo (`/logos/ovulate-circle.png`).
- Displays summary chips: **Cycles Count** and **Average Length** (`avgCycleLength`).
- Provides a **Reset** button with a trash icon when `cycles.length > 0`.

---

## 4. Cycle Logging Form (`src/components/cycle/CycleForm.jsx`)

### Props
| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `onAddCycle` | `(data: CycleInput) => void` | Yes | Callback invoked with validated cycle parameters. |

### Form Fields & Mobile Inputs
- **`startDate`**: Date picker (`type="date"`, required).
- **`cycleLength`**: Number input (default `28`, min `20`, max `45`, `inputMode="numeric"` for mobile numeric keypad).
- **`periodLength`**: Number input (default `5`, min `2`, max `10`, `inputMode="numeric"`).
- **`lutealPhase`**: Number input (default `14`, min `10`, max `16`, `inputMode="numeric"`).
- **Action Button**: Gradient button with active scale feedback and 48dp height.

---

## 5. Calendar View (`src/components/calendar/CalendarView.jsx`)

### Props
| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cycles` | `Array<Cycle>` | No (default `[]`) | Array of cycle records for phase determination. |
| `selectedDate` | `Date \| null` | No | Currently selected date to highlight. |
| `onSelectDate` | `(date: Date \| null) => void` | Yes | Callback when a day is clicked or deselected. |

### Key Features
1. **Month Navigation**: Previous/next month buttons with touch-friendly 44×44px hitboxes.
2. **Safe Windows Toggle**:
   - `showSafetyOverlay`: Toggles between cycle phase mode (Period, Ovulation, Fertile) and clinical safety tiers (Menstruation, Early Safe, Unsafe, Late Safe).
3. **Day Cell Rendering**:
   - Computes day status via `getDayType(date)` and `getDaySafetyInfo(date)`.
   - Distinguishes past recorded events from future projected predictions using dashed borders and muted color tones.
   - Highlights today's date with a bold rose badge.
   - Highlights active selection with ring-2 rose outline and z-index elevation.
4. **Selected Date Details Card**:
   - Dynamically scrolls into view via `detailsRef`.
   - Shows phase label, risk badge, biological description, and contraceptive cautionary notice.
   - Includes an explicit close/deselect button for mobile and desktop.
5. **Upcoming Forecast Strip**: Mini preview cards showing the next 3 projected period cycles.

---

## 6. Forecast & Predictions (`src/components/predictions/Predictions.jsx`)

### Props
| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cycles` | `Array<Cycle>` | No (default `[]`) | Input cycles array consumed by `useCyclePredictions`. |

### Sub-Sections
1. **Next Period Card**: Live day countdown ("In X days", "Today", or "Xd ago").
2. **Fertile Window Card**: High-risk indicator with pulse animation and biological explanation.
3. **Safe Windows Breakdown**:
   - *Pre-Ovulatory Window*: Early follicular safe phase with cycle length caveats.
   - *Post-Ovulatory Window*: Luteal safe phase marked with highest biological reliability.
4. **Cycle Baseline Summary**: Displays average cycle length and number of logged records.
5. **Medical Warning**: Explicit notice clarifying educational limitations.

---

## 7. Cycle History (`src/components/cycle/CycleHistory.jsx`)

### Props
| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cycles` | `Array<Cycle>` | No (default `[]`) | Historical records to list and analyze. |
| `onDeleteCycle` | `(id: number) => void` | Yes | Callback to delete a specific cycle entry. |

### Metrics Computed
- **Average Cycle**: Mean duration in days.
- **Variation**: Standard deviation ($\pm \sigma$).
- **Avg Ovulation**: Mean cycle day of ovulation.
- **Cycle Range**: Min and max recorded cycle lengths.
- **Timeline List**: Reverse chronological list with badges for cycle length, period duration, ovulation day, and luteal phase, with individual delete action.

---

## 8. Footer (`src/components/Footer.jsx`)

Renders a 3-column information footer:
- **App Identity**: Version number and framework badges.
- **Clinical Disclaimer**: Legal and health boundaries.
- **Zero-Tracking Privacy**: Highlights client-side local storage and absence of server telemetry.
- **Interactive Modals**: Quick alerts explaining calculations, data policies, and retention.

---

## 9. Daily Entry Modal (`src/components/journal/DailyEntryModal.jsx`)

Modal dialog for recording multi-symptom daily observations in Journal Mode.

### Props
| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `isOpen` | `boolean` | Yes | Controls modal visibility. |
| `date` | `Date \| string` | Yes | Target date being recorded. |
| `existingEntry` | `DailyEntry \| null` | No | Pre-existing record for this date to pre-populate inputs. |
| `onSave` | `(entry: DailyEntry) => void` | Yes | Save handler updating daily entries in App state. |
| `onDelete` | `(dateStr: string) => void` | Yes | Delete handler removing entry for this date. |
| `onClose` | `() => void` | Yes | Closes the modal. |

### Tracked Biomarkers & Inputs
- **Flow**: `None`, `Spotting`, `Light`, `Medium`, `Heavy`.
- **Symptoms**: `Cramps`, `Headache`, `Backache`, `Bloating`, `Breast Tenderness`, `Fatigue`, `Nausea`, `Acne`, `Mood Changes`, `Other` (with custom text input).
- **Cervical Mucus**: `Dry`, `Sticky`, `Creamy`, `Egg White (Fertile)`, `Watery`.
- **Basal Body Temperature**: Number input with `°C / °F` switch.
- **Ovulation Test (LH)**: `Negative`, `Low`, `High`, `Peak / Positive`.
- **Notes**: Multiline textarea for lifestyle observations.

---

## 10. Cycle Summary View (`src/components/journal/CycleSummaryView.jsx`)

Provides analytical intelligence for actual cycles reconstructed from journal entries.

### Props
| Prop | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `actualCycles` | `Array<ActualCycle>` | Yes | Array of reconstructed cycle objects. |
| `onSelectCycleDate` | `(date: Date) => void` | No | Jump callback navigating calendar to cycle start date. |

### Analytics Provided
- **Current Progress vs Total Duration**: Shows "Day X" for active ongoing cycles, or total length for completed cycles.
- **Bleeding Duration**: Total logged bleeding days.
- **Entries Count**: Total journal records within that cycle window.
- **Cycle-Over-Cycle Comparison**: Delta relative to preceding cycle ($\pm \Delta$ days).
- **Symptom Breakdown**: Frequency ranking of all symptoms experienced during the cycle.
- **Biomarkers**: Average BBT and detected LH peak ovulation date.
