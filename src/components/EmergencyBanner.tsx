/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlertOctagon, X, PhoneCall } from 'lucide-react';

interface EmergencyBannerProps {
  language: 'en' | 'hi';
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({ language }) => {
  const [isVisible, setIsVisible] = useState(true);

  // Re-appears after session if dismissed, to respect the "dismissible-but-recurring" rule
  useEffect(() => {
    const isDismissed = sessionStorage.getItem('emergency_banner_dismissed');
    if (isDismissed === 'true') {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('emergency_banner_dismissed', 'true');
  };

  if (!isVisible) return null;

  return (
    <div
      id="emergency-banner"
      className="bg-red-50 border-b border-red-200 text-red-900 p-4 transition-all duration-300"
    >
      <div className="max-w-4xl mx-auto flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="p-1 text-red-600 bg-red-100 rounded-full mt-0.5 shrink-0">
            <AlertOctagon className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider text-red-800">
              {language === 'en' ? 'Emergency Care Exclusion Notice' : 'आपातकालीन देखभाल निषेध सूचना'}
            </h4>
            <p className="text-sm mt-1 leading-relaxed font-medium">
              {language === 'en'
                ? "This platform is not for emergencies. If you're experiencing a medical emergency, call 108 or go to the nearest hospital immediately."
                : 'यह प्लेटफॉर्म आपातकालीन चिकित्सा के लिए नहीं है। यदि आप मेडिकल इमरजेंसी का अनुभव कर रहे हैं, तो तुरंत 108 पर कॉल करें या नजदीकी अस्पताल जाएं।'}
            </p>
            <div className="flex gap-4 mt-3">
              <a
                href="tel:108"
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 transition text-white px-3.5 py-1.5 rounded-lg text-xs font-bold shadow-sm"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                {language === 'en' ? 'Call 108 Now' : '108 पर कॉल करें'}
              </a>
            </div>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-red-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-100/50 transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
