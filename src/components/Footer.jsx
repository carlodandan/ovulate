import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-14 pt-10 pb-8 border-t border-rose-100/80 bg-white/70 backdrop-blur-md rounded-3xl mb-6 px-6 sm:px-10 shadow-2xs">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-gray-100">
          {/* App Info */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 font-heading">
                Ovulate
              </h3>
            </div>
            <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
              Privacy-first menstrual cycle and fertility intelligence designed to assist tracking without surveillance.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 text-[11px] text-gray-400 font-medium">
              <span>v1.0.0</span>
              <span>•</span>
              <span>React & Tailwind CSS</span>
            </div>
          </div>

          {/* Clinical Disclaimers */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 mb-3 text-gray-900 font-bold text-xs uppercase tracking-wider">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Clinical Disclaimer</span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-500 leading-relaxed">
              <p>
                Provides statistical predictions only. Not a medical device or certified contraception method.
              </p>
              <p className="text-[11px] text-gray-400 italic">
                Always consult an OB-GYN or clinician for medical advice or diagnostic evaluation.
              </p>
            </div>
          </div>

          {/* Privacy & Data */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-1.5 mb-3 text-gray-900 font-bold text-xs uppercase tracking-wider">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Zero-Tracking Privacy</span>
            </div>
            <div className="space-y-1.5 text-xs text-gray-600">
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>100% stored in browser local storage</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>No user account or credentials needed</span>
              </p>
              <p className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>No analytics or external server telemetry</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-400">
          <p>© {currentYear} Ovulate. Free & open-source health intelligence.</p>

          <div className="flex flex-wrap items-center gap-4">
            <a 
              href="#policy" 
              className="hover:text-rose-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert('Data is stored in your browser\'s local storage. Clear browser data to remove all records.');
              }}
            >
              Data Policy
            </a>
            <span>•</span>
            <a 
              href="#calculations" 
              className="hover:text-rose-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert('Calculations: Next Period = Last Start + Cycle Length\nOvulation = Next Period - Luteal Phase\nFertile Window = Ovulation ± 5 days');
              }}
            >
              How Calculations Work
            </a>
            <span>•</span>
            <a 
              href="#delete" 
              className="hover:text-rose-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert('Clear browser data or use individual delete buttons to remove cycle records.');
              }}
            >
              Data Retention
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;