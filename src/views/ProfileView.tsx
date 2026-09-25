/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupportGrievance } from '../components/SupportGrievance';
import { User, ShieldCheck, Languages, AlertCircle, FileText, ExternalLink, HardDrive, LogOut } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { currentPatient, language, setLanguage, logout, updateConsent, resetAllData } = useApp();
  const [activeProfileTab, setActiveProfileTab] = useState<'info' | 'consent' | 'support'>('info');

  if (!currentPatient) return null;

  return (
    <div id="profile-view" className="space-y-4 font-sans pb-8">
      {/* Profile Header Segment */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
          <User className="w-6 h-6 stroke-[1.5]" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{currentPatient.name}</h3>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">{currentPatient.mobile}</p>
          <span className="text-[10px] font-bold text-slate-400 block mt-1 uppercase tracking-wider">
            {language === 'en' ? 'Verified Profile Account' : 'सत्यापित खाता प्रोफाइल'}
          </span>
        </div>
      </div>

      {/* Internal Navigation Menu */}
      <div className="grid grid-cols-3 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
        <button
          onClick={() => setActiveProfileTab('info')}
          className={`py-2 rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer ${
            activeProfileTab === 'info' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {language === 'en' ? 'Personal' : 'विवरण'}
        </button>
        <button
          onClick={() => setActiveProfileTab('consent')}
          className={`py-2 rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer ${
            activeProfileTab === 'consent' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {language === 'en' ? 'Privacy' : 'गोपनीयता'}
        </button>
        <button
          onClick={() => setActiveProfileTab('support')}
          className={`py-2 rounded-lg font-bold transition-all uppercase tracking-wider cursor-pointer ${
            activeProfileTab === 'support' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {language === 'en' ? 'Support' : 'सहायता'}
        </button>
      </div>

      {/* Profile Body Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        
        {/* PERSONAL DETAILS TAB */}
        {activeProfileTab === 'info' && (
          <div className="space-y-5">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    {language === 'en' ? 'Full Registered Name' : 'पूरा नाम'}
                  </span>
                  <span className="font-bold text-slate-800 block mt-1">{currentPatient.name}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                    {language === 'en' ? 'Date of Birth' : 'जन्म तिथि'}
                  </span>
                  <span className="font-bold text-slate-800 block mt-1">{currentPatient.dob}</span>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs">
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                  {language === 'en' ? 'Authenticating Mobile Number' : 'प्रमाणित मोबाइल नंबर'}
                </span>
                <span className="font-bold text-slate-800 block mt-1">{currentPatient.mobile}</span>
              </div>
            </div>

            {/* Bilingual Settings Section */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Languages className="w-4 h-4 text-blue-600" />
                {language === 'en' ? 'Bilingual System Preferences' : 'भाषा सेटिंग्स'}
              </h4>
              <p className="text-[11px] text-slate-400 leading-normal font-semibold">
                {language === 'en'
                  ? 'Switch between English and Hindi translations at any time. This assists older family members and low-digital-literacy users.'
                  : 'परामर्श प्लेटफ़ॉर्म को अपनी सुविधानुसार हिंदी या अंग्रेज़ी भाषा में स्विच करें।'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setLanguage('en')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    language === 'en'
                      ? 'border-blue-500 bg-blue-50/20 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  English (EN)
                </button>
                <button
                  onClick={() => setLanguage('hi')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                    language === 'hi'
                      ? 'border-blue-500 bg-blue-50/20 text-blue-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  हिन्दी (HI)
                </button>
              </div>
            </div>

            {/* Cache Reset & Developer controls */}
            <div className="border-t border-slate-100 pt-4 space-y-3">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-500">
                <HardDrive className="w-4 h-4" />
                Developer Testing Sandbox
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                Reset your patient profile, clear holds, and re-seed default medical documents and doctor lists for complete validation testing of the app.
              </p>
              <button
                onClick={resetAllData}
                className="w-full border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100/50 text-red-600 font-bold py-2.5 rounded-xl text-xs transition cursor-pointer"
              >
                Clear Cache & Restart Seeding
              </button>
            </div>

            <button
              onClick={logout}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl text-xs transition cursor-pointer flex justify-center items-center gap-1.5"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {language === 'en' ? 'Log Out Account Session' : 'लॉग आउट करें'}
            </button>
          </div>
        )}

        {/* DPDP CONSENT SETTINGS TAB */}
        {activeProfileTab === 'consent' && (
          <div className="space-y-4">
            <div className="flex gap-2 items-start border-b border-slate-100 pb-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  {language === 'en' ? 'Your Active Consent Log' : 'सक्रिय सहमति लॉग'}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium leading-normal">
                  {language === 'en'
                    ? 'In compliance with DPDP Act 2023. Toggle agreed consents off to withdraw storage/processing access.'
                    : 'डीपीडीपी अधिनियम २०२३ के तहत। अपनी सहमति को नियंत्रित और संशोधित करें।'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {currentPatient.consents.map((consent) => (
                <div
                  key={consent.id}
                  className="border border-slate-100 rounded-xl p-3.5 flex items-start justify-between gap-4 bg-slate-50/50"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="font-bold text-xs text-slate-800 block leading-tight">
                      {language === 'en' ? consent.labelEn : consent.labelHi}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 block">
                      {language === 'en' ? 'Active Consent Recorded' : 'सहमति स्वीकृत'}
                    </span>
                  </div>

                  <div className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none">
                    <input
                      type="checkbox"
                      checked={consent.agreed}
                      onChange={(e) => updateConsent(consent.id, e.target.checked)}
                      className="w-9 h-5 rounded-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[11px] text-blue-950 font-semibold leading-relaxed">
              {language === 'en'
                ? '📝 Withdrawal Note: If consent is withdrawn, certain digital features (like AI summarization or record storage) will be deactivated for subsequent follow-up sessions immediately.'
                : '📝 सहमति वापस लेने पर, कुछ विशेष डिजिटल सेवाएँ (जैसे रिपोर्ट का सारांश या ओसीआर) तुरंत निष्क्रिय कर दी जाएंगी।'}
            </div>
          </div>
        )}

        {/* GRIEVANCE AND HOTLINE TAB */}
        {activeProfileTab === 'support' && (
          <SupportGrievance />
        )}
      </div>
    </div>
  );
};
