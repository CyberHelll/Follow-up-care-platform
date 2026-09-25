/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ConsentRecord } from '../types';
import { ShieldCheck, Info } from 'lucide-react';

interface ConsentChecklistProps {
  consents: ConsentRecord[];
  onConsentChange: (id: string, agreed: boolean) => void;
  language: 'en' | 'hi';
}

export const ConsentChecklist: React.FC<ConsentChecklistProps> = ({
  consents,
  onConsentChange,
  language
}) => {
  return (
    <div id="consent-checklist" className="space-y-3.5">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3 text-blue-900">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
        <div className="text-xs md:text-sm">
          <p className="font-semibold text-blue-950">
            {language === 'en'
              ? 'DPDP Act 2023 & Healthcare Compliance'
              : 'डीपीडीपी अधिनियम २०२३ और स्वास्थ्य सेवा अनुपालन'}
          </p>
          <p className="mt-1 leading-relaxed opacity-90">
            {language === 'en'
              ? 'Indian health privacy regulation requires patients to give explicit, itemized consent for clinical storage, reception uploads, and AI analysis. You can review or withdraw these at any time in Profile Settings.'
              : 'भारतीय स्वास्थ्य गोपनीयता नियमों के तहत नैदानिक भंडारण, रिकॉर्ड अपलोड और एआई विश्लेषण के लिए मरीजों की स्पष्ट और विस्तृत सहमति आवश्यक है। आप प्रोफाइल सेटिंग्स में जाकर किसी भी समय सहमति बदल या वापस ले सकते हैं।'}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {consents.map((consent) => (
          <label
            key={consent.id}
            className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer select-none ${
              consent.agreed
                ? 'bg-blue-50/50 border-blue-300 ring-2 ring-blue-500/10'
                : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
            }`}
          >
            <div className="flex items-center h-6 shrink-0">
              <input
                type="checkbox"
                checked={consent.agreed}
                onChange={(e) => onConsentChange(consent.id, e.target.checked)}
                className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500 border-gray-300 transition-colors cursor-pointer"
              />
            </div>
            <div className="space-y-0.5">
              <span className="block font-medium text-sm text-gray-900 leading-snug">
                {language === 'en' ? consent.labelEn : consent.labelHi}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 bg-blue-100/55 px-2 py-0.5 rounded-full mt-1">
                <ShieldCheck className="w-3 h-3" />
                {consent.id === 'ai_processing'
                  ? (language === 'en' ? 'AI Feature Consent' : 'एआई सुविधा सहमति')
                  : consent.id === 'consultation_storage'
                  ? (language === 'en' ? 'Zero Recording Commitment' : 'कोई रिकॉर्डिंग नहीं')
                  : (language === 'en' ? 'Mandatory Consent' : 'अनिवार्य सहमति')}
              </span>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};
