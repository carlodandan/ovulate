# Ovulate — Documentation Hub

Welcome to the comprehensive documentation for **Ovulate**, an offline-first, privacy-focused menstrual cycle and fertility intelligence application built with **React 19**, **Tailwind CSS v4**, and **Tauri v2** (supporting Web, Windows desktop, and Android).

---

## Documentation Index

| Document | Purpose |
| :--- | :--- |
| **[Architecture & System Design](file:///c:/Users/Administrator/Desktop/build/ovulate/docs/architecture.md)** | High-level system overview, component hierarchies, data flow, responsive layout strategy, and Tauri v2 cross-platform integration. |
| **[Calculations & Clinical Logic](file:///c:/Users/Administrator/Desktop/build/ovulate/docs/calculations-and-models.md)** | Mathematical models for cycle phases, ovulation dating, fertile windows, safe sex periods, and biological assumptions. |
| **[Components & Hooks Reference](file:///c:/Users/Administrator/Desktop/build/ovulate/docs/components-and-hooks.md)** | Technical reference for all UI components, hooks (`useCyclePredictions`), props, events, and styling tokens. |
| **[Storage & Privacy Specification](file:///c:/Users/Administrator/Desktop/build/ovulate/docs/storage-and-privacy.md)** | Data persistence schema, localStorage models, zero-telemetry guarantee, and privacy principles. |
| **[Build & Deployment Guide](file:///c:/Users/Administrator/Desktop/build/ovulate/docs/build-and-deployment.md)** | Web development, Windows desktop builds (NSIS/MSI), Android APK builds (NDK/SDK), and CI/CD pipelines. |

---

## Codebase At a Glance

```
ovulate/
├── .github/workflows/
│   └── build.yml               # Multi-platform CI/CD (Windows + Android)
├── public/
│   ├── icons/                  # PWA and browser favicons
│   ├── logos/                  # High-res SVG/PNG brand assets
│   └── manifest.json           # Web app manifest
├── src/
│   ├── components/
│   │   ├── calendar/
│   │   │   └── CalendarView.jsx    # Interactive month grid, phase dots, safe window toggle
│   │   ├── cycle/
│   │   │   ├── CycleForm.jsx       # Cycle logging form (start date, cycle/period/luteal length)
│   │   │   └── CycleHistory.jsx    # Historical cycle timeline and variance analytics
│   │   ├── journal/
│   │   │   ├── CycleSummaryView.jsx# Reconstructed cycle insights and comparisons
│   │   │   └── DailyEntryModal.jsx # Daily entry modal (flow, symptoms, BBT, mucus, LH)
│   │   ├── predictions/
│   │   │   └── Predictions.jsx     # Forecast cards (Next Period, Fertile, Safe Windows)
│   │   ├── Footer.jsx              # Disclaimers, data retention notice, zero-telemetry badge
│   │   └── Header.jsx              # Brand header, mode toggle (Standard/Journal), summary chips
│   ├── hooks/
│   │   └── useCyclePredictions.js  # Memoized predictions hook for current + 6 future cycles
│   ├── utils/
│   │   ├── cycleCalculations.js    # Pure functions for cycle calculations and phase math
│   │   ├── journalCalculations.js  # Cycle reconstruction from daily flow logs & symptom metadata
│   │   └── updater.js              # Tauri v2 updater runtime wrapper with environment checks
│   ├── App.jsx                     # Root application state, layout management, mobile navigation
│   ├── index.css                   # Tailwind CSS v4 styling, safe-area utilities, animations
│   └── main.jsx                    # React 19 entry point
├── src-tauri/
│   ├── capabilities/
│   │   └── default.json            # Tauri v2 capability configuration (core + desktop updater)
│   ├── icons/                      # Generated app icons for Windows, Android, iOS, macOS
│   ├── src/
│   │   ├── lib.rs                  # Tauri mobile/desktop initialization entry point
│   │   └── main.rs                 # Tauri desktop binary bootstrap
│   ├── Cargo.toml                  # Rust dependencies (gated desktop updater)
│   └── tauri.conf.json             # Tauri configuration (bundle targets, permissions, CSP)
└── package.json                    # Project dependencies, scripts, and metadata
```

---

## Core Principles

1. **Privacy-First & Zero Telemetry**: All data remains exclusively on the user's local device (`localStorage`). No tracking scripts, analytics, or remote API servers.
2. **Offline-First Resilience**: Designed to work without network access across both web and native applications.
3. **Medical Integrity**: Predictions are strictly educational reference tools; clear medical disclaimers are visibly maintained to prevent reliance as certified contraception.
4. **Adaptive UX**: Touch-optimized ergonomics on mobile/Android (minimum 48×48dp touch targets, safe area insets, bottom navigation) paired with a comprehensive multi-column dashboard on desktop.
