import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 pt-8 pb-6 border-t border-gray-200 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company/App Info */}
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-purple-700 mb-3">🌸 Ovulate - Menstrual Cycle Tracker</h3>
            <p className="text-gray-600 text-sm">
              A privacy-focused period and ovulation calendar that helps you track your menstrual cycles.
            </p>
            <div className="mt-4 flex flex-col space-y-2 text-xs text-gray-500">
              <span>Version 1.0.0</span>
              <span>Built with React + Tailwind CSS</span>
            </div>
          </div>

          {/* Important Disclaimers */}
          <div className="text-center">
            <h4 className="font-medium text-gray-700 mb-3">⚠️ Important Information</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                This tool provides <strong>predictions only</strong> and is not a medical device.
              </p>
              <p>
                Predictions are based on standard cycle calculations and may not be accurate for everyone.
              </p>
              <p className="text-xs italic">
                Consult a healthcare professional for medical advice.
              </p>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="text-center md:text-right">
            <h4 className="font-medium text-gray-700 mb-3">🔒 Privacy & Data</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center justify-center md:justify-end">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                All data stored locally in your browser
              </p>
              <p className="flex items-center justify-center md:justify-end">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                No account registration required
              </p>
              <p className="flex items-center justify-center md:justify-end">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                No data sent to external servers
              </p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="my-6 border-t border-gray-200"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-xs text-gray-500">
            <p>
              © {currentYear} Ovulate - Menstrual Cycle Tracker. All rights reserved.
            </p>
            <p className="mt-1">
              This application is for informational purposes only.
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <a 
              href="#" 
              className="hover:text-purple-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert('Data is stored in your browser\'s local storage. Clear browser data to remove all records.');
              }}
            >
              Data Policy
            </a>
            <span>•</span>
            <a 
              href="#" 
              className="hover:text-purple-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert('Calculations: Next Period = Last Start + Cycle Length\nOvulation = Next Period - Luteal Phase\nFertile Window = Ovulation ± 5 days');
              }}
            >
              How Calculations Work
            </a>
            <span>•</span>
            <a 
              href="#" 
              className="hover:text-purple-600 transition-colors"
              onClick={(e) => {
                e.preventDefault();
                alert('Clear browser data or use individual delete buttons to remove cycle records.');
              }}
            >
              Delete Data
            </a>
          </div>
        </div>

        {/* Final Disclaimer */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center italic">
            Menstrual cycles vary from person to person. Tracking your own patterns over several months will improve prediction accuracy. 
            The app uses standard medical calculations: Ovulation typically occurs 14 days before the next period for a 28-day cycle.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;