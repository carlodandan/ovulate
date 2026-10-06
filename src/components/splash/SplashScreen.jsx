import { useState } from 'react';
import { APP_VERSION } from '../../constants/version';

const SplashScreen = ({ onProceed }) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleProceed = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onProceed) {
        onProceed();
      }
    }, 280);
  };

  return (
    <div 
      className={`min-h-screen w-full bg-[#FAF7F9] text-gray-900 relative flex flex-col justify-between overflow-x-hidden pt-safe pb-safe transition-all duration-300 ease-out ${
        isExiting ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100 animate-fadeIn'
      }`}
    >
      {/* Decorative ambient background glows */}
      <div className="fixed top-0 -left-20 w-[26rem] md:w-[38rem] h-[26rem] md:h-[38rem] bg-rose-200/35 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-0 -right-20 w-[26rem] md:w-[38rem] h-[26rem] md:h-[38rem] bg-purple-200/25 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 md:w-[32rem] h-96 md:h-[32rem] bg-pink-100/30 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Content Area */}
      <main className="max-w-xl md:max-w-3xl lg:max-w-4xl w-full mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 flex-1 flex flex-col items-center justify-center text-center">
        {/* Brand App Icon */}
        <div className="relative mb-6 sm:mb-8 md:mb-10 group">
          <div className="absolute -inset-2 md:-inset-3 bg-gradient-to-tr from-rose-500/25 via-pink-400/20 to-purple-500/25 rounded-3xl md:rounded-4xl blur-lg md:blur-xl opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-3xl md:rounded-4xl bg-white p-3.5 sm:p-4 md:p-5 shadow-xl border border-rose-100/90 flex items-center justify-center">
            <img
              src="/logos/ovulate@512x512-nobg.png"
              alt="Ovulate Logo"
              className="w-full h-full object-contain filter drop-shadow-xs transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = e.target.nextElementSibling;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            <svg 
              className="w-14 h-14 md:w-18 md:h-18 text-rose-700 hidden" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3 md:space-y-4 mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 font-heading">
            Ovulate
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 font-medium leading-relaxed max-w-md md:max-w-2xl mx-auto">
            Private, offline-first menstrual cycle & fertility intelligence. Understand your body's rhythm with complete peace of mind.
          </p>
        </div>

        {/* Feature Snapshot Cards */}
        <div className="w-full max-w-md md:max-w-3xl lg:max-w-4xl grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 md:gap-5 mb-8 sm:mb-10 md:mb-12 text-left">
          {/* Feature 1 */}
          <div className="bg-white/85 backdrop-blur-xs p-3.5 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-rose-100/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-2 md:mb-3 border border-emerald-100">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-xs md:text-sm font-bold text-gray-900">Zero Telemetry</h2>
            <p className="text-[11px] md:text-xs text-gray-500 leading-tight md:leading-relaxed mt-0.5 md:mt-1">
              100% on-device local storage. No tracking, accounts, or cloud sync.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white/85 backdrop-blur-xs p-3.5 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-rose-100/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-2 md:mb-3 border border-rose-100">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-xs md:text-sm font-bold text-gray-900">Smart Forecasts</h2>
            <p className="text-[11px] md:text-xs text-gray-500 leading-tight md:leading-relaxed mt-0.5 md:mt-1">
              Accurate fertile windows, ovulation dates, and cycle predictions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white/85 backdrop-blur-xs p-3.5 sm:p-4 md:p-6 rounded-2xl md:rounded-3xl border border-rose-100/80 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="w-7 h-7 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-2 md:mb-3 border border-purple-100">
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-xs md:text-sm font-bold text-gray-900">Symptom Journal</h2>
            <p className="text-[11px] md:text-xs text-gray-500 leading-tight md:leading-relaxed mt-0.5 md:mt-1">
              Daily bleeding flow, mood, temperature, and cervical observations.
            </p>
          </div>
        </div>

        {/* Primary Proceed CTA Button (Does NOT skip automatically) */}
        <div className="w-full max-w-sm md:max-w-md mx-auto space-y-3.5">
          <button
            type="button"
            onClick={handleProceed}
            disabled={isExiting}
            className="cursor-pointer group relative w-full min-h-[52px] sm:min-h-[56px] md:min-h-[60px] px-8 md:px-10 py-3.5 sm:py-4 md:py-4.5 rounded-2xl bg-gradient-to-r from-[#881337] via-[#9F1239] to-[#701A75] hover:from-[#73102e] hover:to-[#58135e] active:from-[#5b0d25] active:to-[#440f49] text-white font-bold text-base sm:text-lg md:text-xl shadow-lg hover:shadow-xl active:scale-[0.98] transition-all duration-200 inline-flex items-center justify-center gap-2.5 focus:outline-none focus:ring-4 focus:ring-rose-500/40 touch-manipulation"
          >
            <span>Proceed to App</span>
            <svg 
              className="w-5 h-5 md:w-6 md:h-6 transition-transform duration-200 group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Micro trust assurances */}
          <div className="flex items-center justify-center gap-2.5 text-xs sm:text-sm text-gray-500 font-medium">
            <span className="inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No sign-up required
            </span>
            <span className="text-gray-300">•</span>
            <span>Free & Open Source</span>
          </div>
        </div>
      </main>

      {/* Clinical Disclaimer & Version Footer */}
      <footer className="w-full max-w-md md:max-w-xl mx-auto px-4 py-4 md:py-6 text-center space-y-2">
        <p className="text-[11px] sm:text-xs text-gray-400 leading-normal">
          Ovulate provides statistical predictions only. It is not a certified contraception or medical diagnostic device.
        </p>
        <div className="flex items-center justify-center">
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-rose-800/90 bg-rose-50/90 px-2.5 py-0.5 rounded-full border border-rose-200/70">
            v{APP_VERSION}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default SplashScreen;
