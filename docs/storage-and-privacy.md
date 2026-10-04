# Storage & Privacy Specification

This document details the data persistence schema, local storage patterns, data lifecycle, and zero-telemetry privacy guarantees implemented in Ovulate.

---

## 1. Privacy Architecture: Privacy-by-Design

Health, fertility, and reproductive tracking data are among the most sensitive personal data categories. Ovulate is engineered around a strict **zero-telemetry, offline-first** principle:

```
[ User Device / Browser ]
         │
         ├─── Web App / UI (React 19)
         │           │
         │           ▼
         └─── Local Storage (Browser Sandboxed Storage)
                     ▲
                     │
           [ NO External Servers ]
           [ NO Analytics or Telemetry ]
           [ NO User Accounts or Logins ]
           [ NO Third-Party Trackers ]
```

### Guarantees
1. **Zero External Communication**: No cycle dates, symptoms, or user inputs are ever sent over HTTP/WebSocket to remote backends.
2. **No User Accounts**: The application functions immediately without requiring emails, passwords, OAuth providers, or identifiers.
3. **Hardware Isolation**: Data is stored exclusively within the browser or WebView's origin-sandboxed `localStorage`.
4. **Complete Local Erasure**: Users can permanently erase all stored records instantaneously using the in-app Reset feature or browser data clearance.

---

## 2. Storage Schema Specification

### Primary Storage Key: `menstrualCycles`

The standard cycle tracking mode stores an array of cycle records serialized as a JSON string under the key `'menstrualCycles'`.

```typescript
interface Cycle {
  id: number;              // Unique record ID (Unix timestamp generated via Date.now())
  startDate: string;       // Period start date formatted as 'YYYY-MM-DD'
  endDate: string;         // Calculated period end date formatted as 'YYYY-MM-DD'
  cycleLength: number;     // Total duration of the cycle in days (default: 28)
  periodLength: number;    // Duration of active menstrual bleeding in days (default: 5)
  lutealPhase: number;     // Duration of the luteal phase in days (default: 14)
  addedDate: string;       // ISO 8601 timestamp representing when record was logged
}
```

#### Example Stored JSON
```json
[
  {
    "id": 1740643200000,
    "startDate": "2026-02-01",
    "endDate": "2026-02-05",
    "cycleLength": 28,
    "periodLength": 5,
    "lutealPhase": 14,
    "addedDate": "2026-02-01T08:00:00.000Z"
  }
]
```

### Secondary Storage Key: `ovulateDailyEntries`

The custom / journal tracking mode stores an object mapping date strings (`'YYYY-MM-DD'`) to detailed daily observation records under `'ovulateDailyEntries'`.

```typescript
interface DailyEntry {
  date: string;                   // 'YYYY-MM-DD' (Primary key)
  flow?: 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
  symptoms?: string[];            // e.g. ['cramps', 'headache', 'bloating']
  otherSymptom?: string;          // Free-text if 'other' symptom is selected
  cervicalMucus?: 'dry' | 'sticky' | 'creamy' | 'eggwhite' | 'watery' | '';
  temperature?: number | null;    // Basal Body Temperature (BBT)
  tempUnit?: 'C' | 'F';           // Scale used for temperature display
  ovulationTest?: 'negative' | 'low' | 'high' | 'peak' | '';
  notes?: string;                 // User free-text journal notes
  updatedAt?: string;             // ISO 8601 timestamp of last modification
}
```

#### Example Stored JSON
```json
{
  "2026-10-04": {
    "date": "2026-10-04",
    "flow": "medium",
    "symptoms": ["cramps", "headache"],
    "otherSymptom": "",
    "cervicalMucus": "sticky",
    "temperature": 36.65,
    "tempUnit": "C",
    "ovulationTest": "negative",
    "notes": "Mild fatigue in afternoon",
    "updatedAt": "2026-10-04T08:00:00.000Z"
  }
}
```

### App State Key: `ovulateAppMode`
Stores `'standard' | 'journal'` to preserve the user's preferred active tracking mode.

---

## 3. Data Lifecycle & State Synchronization

In `src/App.jsx`:

1. **Initial Mount (`Read`)**:
   ```javascript
   useEffect(() => {
     const savedCycles = localStorage.getItem('menstrualCycles');
     if (savedCycles) {
       try {
         setCycles(JSON.parse(savedCycles));
       } catch (e) {
         console.error('Failed to parse stored cycles', e);
       }
     }
   }, []);
   ```

2. **State Updates (`Write`)**:
   Whenever `cycles` changes and contains elements, it serializes to `localStorage`:
   ```javascript
   useEffect(() => {
     if (cycles.length > 0) {
       localStorage.setItem('menstrualCycles', JSON.stringify(cycles));
     }
   }, [cycles]);
   ```

3. **Deletion (`Delete`)**:
   Deleting an entry removes it from state. If the resulting array is empty, `localStorage.removeItem('menstrualCycles')` is called to clean up storage cleanly.

4. **Purge (`Reset`)**:
   `clearAllData()` explicitly removes `'menstrualCycles'` and clears in-memory state.

---

## 4. Migration & Schema Extension Guidelines

When adding new features (such as **Journal / Custom Tracking Mode**):
- **Never mutate or corrupt existing `'menstrualCycles'`**: Backward compatibility must be strictly preserved so users with existing records experience zero data loss.
- **Dedicated Keys for New Modes**: Supplementary data models (e.g. daily symptom logs, journal observations) should use dedicated namespaced keys (e.g., `'ovulateDailyEntries'`, `'ovulateTrackingMode'`) to maintain clean modularity.
- **Graceful Parsing**: All storage retrieval operations must wrap `JSON.parse` in safety guards with fallback defaults.
