/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { Doctor } from '../types';
import { Search, QrCode, Calendar, ArrowRight, UserCheck, ShieldClose, Lock, Star, ChevronRight, Phone } from 'lucide-react';

interface HomeViewProps {
  onSelectDoctor: (doctor: Doctor) => void;
  onNavigateToTab: (tab: string) => void;
  onNavigateToAppointment: (apptId: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectDoctor,
  onNavigateToTab,
  onNavigateToAppointment
}) => {
  const { doctors, followUps, language, triggerQRScan } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);

  // Get active upcoming appointment
  const nextAppt = followUps
    .filter(f => f.status === 'upcoming' || f.status === 'waiting_room' || f.status === 'needs_consent')
    .sort((a, b) => new Date(a.slot).getTime() - new Date(b.slot).getTime())[0];

  const handleQRScan = (docId: string, isStale = false) => {
    if (isStale) {
      setScannerError(
        language === 'en'
          ? 'This QR code has been replaced. Please ask your clinic for the current active code.'
          : 'यह क्यूआर कोड बदल दिया गया है। कृपया क्लिनिक से वर्तमान सक्रिय कोड मांगें।'
      );
      return;
    }
    
    const doc = doctors.find(d => d.id === docId);
    if (doc) {
      triggerQRScan(docId, false);
      onSelectDoctor(doc);
      setShowQRScanner(false);
      setScannerError(null);
    }
  };

  // Filter doctors based on manual search query (Section 7.7)
  const filteredDoctors = doctors.filter(doc => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(query) ||
      doc.specialty.toLowerCase().includes(query) ||
      doc.clinicName.toLowerCase().includes(query);

    return matchesSearch;
  });

  return (
    <div id="home-view-container" className="space-y-5 pb-8 font-sans">
      {/* Persistent Emergency Care Banner */}
      <EmergencyBanner language={language} />

      {/* Greeting Segment */}
      <div className="px-1 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {language === 'en' ? 'Your Continuity Portal' : 'निरंतर देखभाल पोर्टल'}
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            {language === 'en' ? 'Structured remote follow-ups with your own doctor' : 'अपने स्वयं के डॉक्टर के साथ डिजिटल फ़ॉलो-अप'}
          </p>
        </div>

        {/* Floating Quick QR Button */}
        <button
          onClick={() => setShowQRScanner(true)}
          className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white p-3 rounded-xl shadow-md transition-transform flex items-center gap-1.5 cursor-pointer text-xs font-bold"
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span className="hidden sm:inline">{language === 'en' ? 'Scan Clinic QR' : 'क्यूआर कोड स्कैन'}</span>
        </button>
      </div>

      {/* QR Code Scanner Simulation Overlay (PDS pg 14) */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                <QrCode className="w-5 h-5 text-blue-600" />
                {language === 'en' ? 'Simulate Clinic QR Scan' : 'क्यूआर कोड स्कैन सिमुलेटर'}
              </h4>
              <button
                onClick={() => {
                  setShowQRScanner(false);
                  setScannerError(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                {language === 'en' ? 'Close' : 'बंद करें'}
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              {language === 'en'
                ? 'Scan the physical QR code displayed in the clinic cabin. Valid scans land directly on your verified doctor\'s profile, bypassing marketplace listings.'
                : 'क्लीनिक केबिन में प्रदर्शित क्यूआर कोड को स्कैन करें। सही स्कैन होने पर आप सीधे अपने डॉक्टर के प्रोफाइल पर पहुंचेंगे।'}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => handleQRScan('doc_amit_sharma')}
                className="border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 p-3.5 rounded-xl text-left transition cursor-pointer"
              >
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Dr. Amit Sharma</span>
                <span className="font-bold text-slate-800 text-xs mt-1 block">Valid QR Scan (Psychiatry)</span>
              </button>

              <button
                onClick={() => handleQRScan('doc_priya_verma')}
                className="border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 p-3.5 rounded-xl text-left transition cursor-pointer"
              >
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Dr. Priya Verma</span>
                <span className="font-bold text-slate-800 text-xs mt-1 block">Valid QR Scan (Neurology)</span>
              </button>

              <button
                onClick={() => handleQRScan('doc_sameer_khan')}
                className="border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 p-3.5 rounded-xl text-left transition cursor-pointer"
              >
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Dr. Sameer Khan</span>
                <span className="font-bold text-slate-800 text-xs mt-1 block">Valid QR Scan (Sexology)</span>
              </button>

              <button
                onClick={() => handleQRScan('doc_sameer_khan', true)} // stale code
                className="border border-slate-200 hover:border-red-500 hover:bg-red-50/10 p-3.5 rounded-xl text-left transition cursor-pointer"
              >
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Clinic Code v1</span>
                <span className="font-bold text-red-600 text-xs mt-1 block">Stale / Outdated QR</span>
              </button>
            </div>

            {scannerError ? (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-900 space-y-2 text-xs">
                <p className="font-bold">{scannerError}</p>
                <div className="flex gap-3">
                  <a
                    href="tel:+9118001082026"
                    className="inline-flex items-center gap-1 font-bold text-red-700 bg-white border border-red-200 px-2 py-1 rounded-md text-[10px] shadow-xs"
                  >
                    <Phone className="w-3 h-3" />
                    {language === 'en' ? 'Call Clinic Desk' : 'क्लीनिक से बात करें'}
                  </a>
                </div>
              </div>
            ) : (
              <div className="border-t border-slate-100 pt-3 flex justify-center">
                <div className="border border-dashed border-slate-200 bg-slate-50 w-32 h-32 rounded-xl flex items-center justify-center text-slate-400">
                  <QrCode className="w-12 h-12 stroke-[1.25]" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Scheduled / Imminent Appointment Card */}
      {nextAppt && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold tracking-wider bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase leading-none">
              <Calendar className="w-3.5 h-3.5" />
              {nextAppt.status === 'needs_consent'
                ? (language === 'en' ? 'Consent Action Required (E3)' : 'डॉक्टर द्वारा प्रस्तावित (सहमति आवश्यक)')
                : (language === 'en' ? 'Next Booked Follow-up' : 'अगला डिजिटल फ़ॉलो-अप')}
            </span>
            <button
              onClick={() => onNavigateToTab('appointments')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-0.5"
            >
              {language === 'en' ? 'Manage Bookings' : 'सभी बुकिंग देखें'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
              <img src={nextAppt.doctorPhoto} alt={nextAppt.doctorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="truncate">
              <h4 className="font-extrabold text-slate-900 text-sm leading-tight truncate">{nextAppt.doctorName}</h4>
              <p className="text-xs text-slate-500 font-semibold truncate leading-tight mt-0.5">
                {nextAppt.doctorSpecialty} • {nextAppt.clinicName}
              </p>
              <span className="text-[11px] font-bold text-slate-700 block mt-1.5 bg-slate-100 rounded-lg py-1 px-2.5 inline-block leading-none">
                {new Date(nextAppt.slot).toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN', {
                  day: '2-digit',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToAppointment(nextAppt.id)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition cursor-pointer flex justify-center items-center gap-1"
          >
            {nextAppt.status === 'needs_consent'
              ? (language === 'en' ? 'Review & Accept Follow-up Booking' : 'समीक्षा करें और अपॉइंटमेंट स्वीकार करें')
              : (language === 'en' ? 'Join Waiting Room / Enter consultation' : 'परामर्श कक्ष (वेटिंग रूम) में प्रवेश करें')}
            <ArrowRight className="w-4 h-4 shrink-0" />
          </button>
        </div>
      )}

      {/* Manual Search & Filters Cabin */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
          <Search className="w-4.5 h-4.5 text-blue-600" />
          {language === 'en' ? 'Clinic & Doctor Manual Finder' : 'डॉक्टर और क्लीनिक मैन्युअल खोजें'}
        </h3>

        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder={
              language === 'en'
                ? 'Search by clinic name, doctor, or specialty (e.g. Psychiatry)...'
                : 'क्लीनिक, डॉक्टर या विशेषता द्वारा खोजें (जैसे: मनश्चिकित्सा)...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold transition"
          />
        </div>

        {/* Live Filter Results */}
        <div className="space-y-3 pt-1">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-xs text-slate-500 font-semibold">
                {language === 'en'
                  ? 'No clinics or doctors found matching your query.'
                  : 'आपके खोज के अनुसार कोई क्लिनिक या डॉक्टर नहीं मिला।'}
              </p>
            </div>
          ) : (
            filteredDoctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelectDoctor(doc)}
                className="w-full text-left bg-white hover:bg-slate-50/50 border border-slate-100 hover:border-slate-200 rounded-xl p-4 flex justify-between items-center gap-4 transition-all"
              >
                <div className="flex gap-3 min-w-0">
                  <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden border border-slate-150 shrink-0">
                    <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <div className="truncate space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-xs truncate leading-none">{doc.name}</h4>
                      <span className="text-[8px] font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-md px-1.5 py-0.5 leading-none">
                        {doc.specialty}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold truncate leading-tight">{doc.clinicName}</p>
                    <p className="text-[10px] text-slate-400 font-bold truncate leading-tight uppercase tracking-wider">
                      Reg: {doc.regNumber}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-extrabold text-xs text-slate-900 block">₹{doc.followUpFee}</span>
                  <span className="text-[9px] text-blue-600 font-bold uppercase tracking-wider block mt-1 inline-flex items-center gap-0.5 bg-blue-50 px-1.5 py-0.5 rounded-full leading-none">
                    <UserCheck className="w-2.5 h-2.5" />
                    {doc.hasPriorVisit
                      ? (language === 'en' ? 'Eligible' : 'पात्र')
                      : (language === 'en' ? 'Needs Visit' : 'अपात्र')}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
