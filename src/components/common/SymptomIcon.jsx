// Crisp SVG vector icons for clinical cycle journal symptoms
// Eliminates platform emojis and aligns with ui-ux-pro-max standards

export const SymptomIcon = ({ type, className = "w-4 h-4", strokeWidth = 2 }) => {
  switch (type) {
    case 'cramps':
      // Pulse / Spasm wave
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );

    case 'headache':
      // Cranial / Tension waves
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12h8" />
          <path d="M12 8v8" />
          <path d="M9 4.5a3 3 0 016 0" />
        </svg>
      );

    case 'backache':
      // Vertebral column / spinal segments
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2v20" />
          <path d="M8 6h8" />
          <path d="M7 11h10" />
          <path d="M7 16h10" />
          <path d="M9 20h6" />
        </svg>
      );

    case 'bloating':
      // Expansion / abdominal ripple
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
          <path d="M8 12c1.5-2 3-2 4 0s2.5 2 4 0" />
        </svg>
      );

    case 'breast_tenderness':
      // Delicate botanical blossom / petal
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 22V12" />
          <path d="M12 12C9 7 5 8 5 12c0 4 4 6 7 6 3 0 7-2 7-6 0-4-4-5-7 0z" />
          <circle cx="12" cy="7" r="2.5" />
        </svg>
      );

    case 'fatigue':
      // Resting crescent / recharge
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
      );

    case 'nausea':
      // Equilibrium wavy harmonic
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 5-4 7 0" />
          <path d="M2 16c2.5-4 5-4 7.5 0s5 4 7.5 0 5-4 7 0" />
        </svg>
      );

    case 'acne':
      // Dermal clarity / focus point
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3v3m0 12v3M3 12h3m12 0h3" />
        </svg>
      );

    case 'mood_changes':
      // Expressive duality balance
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M9 10h.01M15 10h.01" />
          <path d="M8 15s1.5 2 4 2 4-2 4-2" />
        </svg>
      );

    case 'other':
    default:
      // Observation notepad / pen
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      );
  }
};

export default SymptomIcon;
