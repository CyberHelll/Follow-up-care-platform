/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomeView } from './views/HomeView';
import { AppointmentsView } from './views/AppointmentsView';
import { RecordsView } from './views/RecordsView';
import { WalletView } from './views/WalletView';
import { ProfileView } from './views/ProfileView';
import { DoctorProfilePage } from './components/DoctorProfilePage';
import { CallSimulator } from './components/CallSimulator';
import { ConsentChecklist } from './components/ConsentChecklist';
import { Doctor, FollowUp, Prescription } from './types';
import {
  Wallet,
  Calendar,
  FileText,
  User,
  Home,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  QrCode,
  FileSpreadsheet,
  Download,
  PhoneCall,
  Volume2
} from 'lucide-react';

function InnerApp() {
  const {
    currentPatient,
    language,
    setLanguage,
    registerPatient,
    followUps,
    doctors,
    prescriptions
  } = useApp();

  const [activeTab, setActiveTab] = useState('home');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [activeConsultation, setActiveConsultation] = useState<FollowUp | null>(null);
  const [viewingPrescriptionId, setViewingPrescriptionId] = useState<string | null>(null);
  const [prescHistoryVersion, setPrescHistoryVersion] = useState<number | null>(null);

  // Onboarding registration form state
  const [regName, setRegName] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regDOB, setRegDOB] = useState('');
  const [regStep, setRegStep] = useState<'mobile' | 'otp' | 'details' | 'consent'>('mobile');
  const [otpCode, setOtpCode] = useState('');
  const [onboardingConsents, setOnboardingConsents] = useState([
    { id: 'record_storage', labelEn: 'Medical record storage & encryption in compliance with DPDP Act 2023', labelHi: 'चिकित्सीय रिकॉर्ड का सुरक्षित भंडारण और एन्क्रिप्शन (डीपीडीपी अधिनियम २०२३)', agreed: false, timestamp: '', withdrawn: false },
    { id: 'doctor_access', labelEn: 'Authorise medical record access by verified clinic doctors & receptionists', labelHi: 'सत्यापित क्लिनिक डॉक्टरों और रिसेप्शनिस्टों द्वारा रिकॉर्ड देखने की अनुमति', agreed: false, timestamp: '', withdrawn: false },
    { id: 'ai_processing', labelEn: 'Allow secure AI background processing of uploads for clinical report summaries', labelHi: 'रिपोर्ट सारांश के लिए अपलोड किए गए दस्तावेजों के सुरक्षित एआई प्रोसेसिंग की सहमति', agreed: false, timestamp: '', withdrawn: false },
    { id: 'consultation_storage', labelEn: 'Secure consultation metadata and prescriptions storage (Sessions are never audio/video recorded)', labelHi: 'परामर्श मेटाडेटा और नुस्खे का सुरक्षित भंडारण (परामर्श को कभी भी रिकॉर्ड नहीं किया जाता है)', agreed: false, timestamp: '', withdrawn: false },
    { id: 'terms_of_service', labelEn: 'Accept Follow-up Platform Terms of Service and legal treatment framework', labelHi: 'फॉलो-अप प्लेटफ़ॉर्म की सेवा की शर्तों और कानूनी ढांचे को स्वीकार करें', agreed: false, timestamp: '', withdrawn: false },
    { id: 'privacy_policy', labelEn: 'Accept Privacy Policy regarding zero-sharing of clinical data with third-parties', labelHi: 'डेटा प्राइवेसी नीति स्वीकार करें (तीसरे पक्षों के साथ कोई नैदानिक डेटा साझा नहीं किया जाएगा)', agreed: false, timestamp: '', withdrawn: false },
    { id: 'notifications', labelEn: 'Receive neutral, specialty-free follow-up alerts via WhatsApp notifications', labelHi: 'व्हाट्सएप के माध्यम से तटस्थ और गोपनीयता-अनुकूल फॉलो-अप सूचनाएं प्राप्त करें', agreed: false, timestamp: '', withdrawn: false },
    { id: 'continuity_of_care', labelEn: 'Consent to share follow-up medical timeline securely with your chosen doctor', labelHi: 'अपने चुने हुए डॉक्टर के साथ फॉलो-अप इतिहास सुरक्षित रूप से साझा करने की सहमति', agreed: false, timestamp: '', withdrawn: false },
    { id: 'withdrawal_notice', labelEn: 'Acknowledge that consent can be withdrawn at any time in Profile Settings', labelHi: 'यह स्वीकार करें कि प्रोफाइल सेटिंग्स में किसी भी समय सहमति वापस ली जा सकती है', agreed: false, timestamp: '', withdrawn: false }
  ]);
  const [formError, setFormError] = useState<string | null>(null);

  // Field Blur validation rules (Section 10.2)
  const validateMobile = (num: string) => {
    const cleanNum = num.replace(/\D/g, '');
    if (cleanNum.length !== 10) {
      return language === 'en' ? 'Enter a valid 10-digit mobile number' : 'एक वैध 10-अंकीय मोबाइल नंबर दर्ज करें';
    }
    return null;
  };

  const validateName = (nameStr: string) => {
    if (nameStr.length < 2 || nameStr.length > 60 || !/^[a-zA-Z\s]+$/.test(nameStr)) {
      return language === 'en' ? 'Please enter your full name (2-60 letters only)' : 'कृपया अपना पूरा नाम दर्ज करें (केवल २-६० अक्षरों में)';
    }
    return null;
  };

  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateMobile(regMobile);
    if (err) {
      setFormError(err);
      return;
    }
    setFormError(null);
    setRegStep('otp'); // Proceeds to OTP screen (PDS pg 12)
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode !== '123456' && otpCode !== '123') {
      setFormError(language === 'en' ? 'Incorrect OTP code entered. Please enter 123456 to verify.' : 'गलत ओटीपी। सत्यापित करने के लिए 123456 दर्ज करें।');
      return;
    }
    setFormError(null);
    setRegStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateName(regName);
    if (err) {
      setFormError(err);
      return;
    }
    if (!regDOB) {
      setFormError(language === 'en' ? 'Please select your Date of Birth' : 'कृपया अपनी जन्म तिथि चुनें');
      return;
    }
    setFormError(null);
    setRegStep('consent'); // Moves to itemized consents (DPDP)
  };

  const handleConsentChange = (id: string, agreed: boolean) => {
    const updated = onboardingConsents.map(c =>
      c.id === id ? { ...c, agreed, timestamp: agreed ? new Date().toISOString() : '' } : c
    );
    setOnboardingConsents(updated);
  };

  const handleRegisterActivation = () => {
    const allChecked = onboardingConsents.every(c => c.agreed);
    if (!allChecked) {
      setFormError(
        language === 'en'
          ? 'Please review and accept all required items to continue'
          : 'कृपया जारी रखने के लिए सभी आवश्यक मदों की समीक्षा करें और स्वीकार करें'
      );
      return;
    }
    setFormError(null);
    registerPatient(regName, regMobile, regDOB, onboardingConsents);
  };

  // View prescription helper variables
  const currentPrescription = prescriptions.find(p => p.id === viewingPrescriptionId);

  // GATED REGISTRATION WRAPPERS
  if (!currentPatient) {
    return (
      <div id="patient-registration-view" className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-blue-100">
        <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          {/* Accent decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-xl -mr-8 -mt-8" />
          
          <div className="text-center space-y-1.5 relative z-10">
            <span className="text-[10px] font-black tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase border border-blue-100 inline-block leading-none">
              Continuity of Care SaaS
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">
              {regStep === 'consent'
                ? (language === 'en' ? 'Itemized Privacy Consents' : 'गोपनीयता सहमति और नियम')
                : (language === 'en' ? 'Patient Verification' : 'रोगी पंजीकरण')}
            </h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              {regStep === 'mobile' && (language === 'en' ? 'Enter your mobile number to check follow-up eligibility' : 'पंजीकरण के लिए अपना मोबाइल नंबर दर्ज करें')}
              {regStep === 'otp' && (language === 'en' ? `Verification OTP sent to +91 ${regMobile}` : `+91 ${regMobile} पर भेजा गया ओटीपी कोड भरें`)}
              {regStep === 'details' && (language === 'en' ? 'Enter clinical card registration credentials' : 'चिकित्सीय पर्ची के अनुसार विवरण भरें')}
              {regStep === 'consent' && (language === 'en' ? 'Review & agree to the individual privacy items below' : 'कृपया सभी व्यक्तिगत गोपनीयता मदों को स्वीकार करें')}
            </p>
          </div>

          {regStep === 'mobile' && (
            <form onSubmit={handleMobileSubmit} className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  {language === 'en' ? 'Mobile Number (WhatsApp Enabled)' : 'मोबाइल नंबर (व्हाट्सएप नंबर)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-slate-400 font-bold text-xs">+91</span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={regMobile}
                    onChange={(e) => setRegMobile(e.target.value)}
                    onBlur={() => setFormError(validateMobile(regMobile))}
                    className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold tracking-wide transition-all"
                  />
                </div>
              </div>

              {formError && <p className="text-xs font-bold text-red-600">{formError}</p>}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 transition-all text-white font-extrabold py-3.5 rounded-2xl text-xs tracking-wider uppercase cursor-pointer shadow-md shadow-blue-500/10"
              >
                {language === 'en' ? 'Send OTP Verification Code' : 'ओटीपी कोड भेजें'}
              </button>
            </form>
          )}

          {regStep === 'otp' && (
            <form onSubmit={handleOTPSubmit} className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  {language === 'en' ? 'Enter 6-Digit OTP Code (Simulated: 123456)' : '६-अंकीय ओटीपी कोड दर्ज करें (डेमो: 123456)'}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-2xl p-3.5 text-center text-lg font-black tracking-widest transition-all"
                />
              </div>

              {formError && <p className="text-xs font-bold text-red-600">{formError}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setRegStep('mobile');
                    setFormError(null);
                  }}
                  className="flex-1 border border-slate-200 hover:border-slate-300 text-slate-700 font-bold py-3.5 rounded-2xl text-xs transition cursor-pointer"
                >
                  {language === 'en' ? 'Change Number' : 'नंबर बदलें'}
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-98 transition text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase cursor-pointer"
                >
                  {language === 'en' ? 'Verify Code' : 'ओटीपी सत्यापित करें'}
                </button>
              </div>
            </form>
          )}

          {regStep === 'details' && (
            <form onSubmit={handleDetailsSubmit} className="space-y-4 relative z-10">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  {language === 'en' ? 'Full Registered Name' : 'पूरा नाम'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  onBlur={() => setFormError(validateName(regName))}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-2xl px-4 py-3.5 text-xs font-bold transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block">
                  {language === 'en' ? 'Date of Birth (DOB)' : 'जन्म तिथि'}
                </label>
                <input
                  type="date"
                  value={regDOB}
                  onChange={(e) => setRegDOB(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-2xl px-4 py-3.5 text-xs font-bold transition-all"
                />
              </div>

              {formError && <p className="text-xs font-bold text-red-600">{formError}</p>}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3.5 rounded-2xl text-xs uppercase cursor-pointer"
              >
                {language === 'en' ? 'Save & Review Consents' : 'सहमति पत्रों की समीक्षा करें'}
              </button>
            </form>
          )}

          {regStep === 'consent' && (
            <div className="space-y-4 relative z-10">
              <div className="max-h-72 overflow-y-auto pr-1">
                <ConsentChecklist
                  consents={onboardingConsents}
                  onConsentChange={handleConsentChange}
                  language={language}
                />
              </div>

              {formError && <p className="text-xs font-extrabold text-red-600 text-center">{formError}</p>}

              <button
                onClick={handleRegisterActivation}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-2xl text-xs tracking-wider uppercase cursor-pointer"
              >
                {language === 'en' ? 'Activate Verified Account' : 'सहमति देकर खाता सक्रिय करें'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // MAIN SYSTEM NAVIGATION RENDER (Patient Onboarded)
  return (
    <div id="patient-app-wrapper" className="min-h-screen bg-slate-50 text-slate-900 font-sans leading-normal antialiased flex flex-col items-center justify-between pb-16">
      
      {/* Centered mobile-first container frame (PDS pg 24 BreakpointAdaptation) */}
      <div className="w-full max-w-lg bg-white min-h-screen shadow-xs flex flex-col justify-between">
        
        {/* App Main Bar */}
        <header className="bg-white border-b border-slate-200 px-5 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse" />
            <h1 className="text-sm font-extrabold text-slate-900 tracking-tight uppercase">
              {language === 'en' ? 'Follow-up Portal' : 'फ़ॉलो-अप केयर पोर्टल'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Language Swift Indicator */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="text-[10px] font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 transition px-2.5 py-1.5 rounded-lg border border-slate-200 uppercase cursor-pointer"
            >
              {language === 'en' ? 'हिन्दी (HI)' : 'English (EN)'}
            </button>
          </div>
        </header>

        {/* View Layout body */}
        <main className="flex-1 p-5 overflow-y-auto">
          {selectedDoctor ? (
            <DoctorProfilePage
              doctor={selectedDoctor}
              onBack={() => setSelectedDoctor(null)}
              onBookingSuccess={() => {
                setSelectedDoctor(null);
                setActiveTab('appointments');
              }}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <HomeView
                  onSelectDoctor={(doc) => setSelectedDoctor(doc)}
                  onNavigateToTab={(tab) => setActiveTab(tab)}
                  onNavigateToAppointment={(apptId) => {
                    const appt = followUps.find(f => f.id === apptId);
                    if (appt) {
                      setActiveConsultation(appt);
                    }
                  }}
                />
              )}
              {activeTab === 'appointments' && (
                <AppointmentsView
                  onJoinCall={(appt) => setActiveConsultation(appt)}
                  onViewPrescription={(rxId) => setViewingPrescriptionId(rxId)}
                />
              )}
              {activeTab === 'records' && <RecordsView />}
              {activeTab === 'wallet' && <WalletView />}
              {activeTab === 'profile' && <ProfileView />}
            </>
          )}
        </main>

        {/* Persistent Premium Consumer Mobile Bottom Tab Bar */}
        <nav className="fixed bottom-0 w-full max-w-lg bg-white border-t border-slate-200 px-4 py-2 flex justify-around items-center z-40">
          <button
            onClick={() => {
              setSelectedDoctor(null);
              setActiveTab('home');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home' && !selectedDoctor ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Home className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold tracking-wide">
              {language === 'en' ? 'Home' : 'होम'}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedDoctor(null);
              setActiveTab('appointments');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'appointments' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Calendar className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold tracking-wide">
              {language === 'en' ? 'Follow-ups' : 'बुकिंग'}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedDoctor(null);
              setActiveTab('records');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer relative ${
              activeTab === 'records' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <FileText className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold tracking-wide">
              {language === 'en' ? 'Records' : 'दस्तावेज़'}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedDoctor(null);
              setActiveTab('wallet');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'wallet' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Wallet className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold tracking-wide">
              {language === 'en' ? 'Wallet' : 'वॉलेट'}
            </span>
          </button>

          <button
            onClick={() => {
              setSelectedDoctor(null);
              setActiveTab('profile');
            }}
            className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all cursor-pointer ${
              activeTab === 'profile' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <User className="w-5 h-5 shrink-0" />
            <span className="text-[10px] font-bold tracking-wide">
              {language === 'en' ? 'Profile' : 'प्रोफ़ाइल'}
            </span>
          </button>
        </nav>
      </div>

      {/* ACTIVE CALL CONSULTATION SIMULATOR OVERLAY */}
      {activeConsultation && (
        <CallSimulator
          appointment={activeConsultation}
          onClose={() => {
            setActiveConsultation(null);
            setActiveTab('appointments');
          }}
        />
      )}

      {/* GATED DIGITAL PRESCRIPTION HISTORY VERSIONS DRAWER (PDS pg 14/15) */}
      {viewingPrescriptionId && currentPrescription && (
        <div className="fixed inset-0 bg-slate-950/70 z-50 flex justify-center items-end sm:items-center p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto animate-slide-up">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                  {language === 'en' ? 'Verified Digital Prescription' : 'सत्यापित डिजिटल नुस्खा'}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                  {language === 'en' ? `REGISTRATION: ${currentPrescription.doctorRegNumber}` : `पंजीकरण नंबर: ${currentPrescription.doctorRegNumber}`}
                </p>
              </div>
              <button
                onClick={() => {
                  setViewingPrescriptionId(null);
                  setPrescHistoryVersion(null);
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                {language === 'en' ? 'Close' : 'बंद करें'}
              </button>
            </div>

            {/* Version timeline switches */}
            <div className="flex items-center gap-1 bg-slate-50 border border-slate-150 p-1 rounded-xl">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 px-2 shrink-0">
                {language === 'en' ? 'Rx Versions:' : 'समीक्षा इतिहास:'}
              </span>
              <button
                onClick={() => setPrescHistoryVersion(null)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition ${
                  prescHistoryVersion === null ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                v2 ({language === 'en' ? 'Latest' : 'नवीनतम'})
              </button>
              <button
                onClick={() => setPrescHistoryVersion(1)}
                className={`py-1.5 px-3 rounded-lg text-[10px] font-bold uppercase transition ${
                  prescHistoryVersion === 1 ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                v1 (30d ago)
              </button>
            </div>

            {prescHistoryVersion === 1 ? (
              // Show historical Version 1
              <div className="space-y-4 text-slate-700 text-xs leading-relaxed">
                <div className="border border-slate-200/60 rounded-xl p-4 space-y-2.5 bg-slate-50/50">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-900 block text-xs">v1 Historical Active Rx</span>
                    <span className="text-[10px] text-slate-400">30 days ago</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-800">Sertraline 50mg</p>
                    <p className="text-slate-500">1 tablet once daily • 30 days duration</p>
                    <p className="text-slate-500 font-medium italic">Instructions: Take in the morning after breakfast</p>
                  </div>
                  <div className="space-y-1 border-t border-slate-100 pt-2">
                    <p className="font-bold text-slate-800">Clonazepam 0.25mg</p>
                    <p className="text-slate-500">1 tablet at bedtime • 10 days duration</p>
                    <p className="text-slate-500 font-medium italic">Instructions: Take strictly at night if anxious</p>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">v1 Clinic Advisory Notes</span>
                  <p className="text-slate-600 leading-normal font-medium mt-1">
                    Patient advised daily diaphragmatic breathing exercises for 15 minutes. Avoid excessive screen usage before bedtime.
                  </p>
                </div>
              </div>
            ) : (
              // Show latest Version 2
              <div className="space-y-4 text-slate-700 text-xs leading-relaxed">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Clinical Diagnosis Summary</span>
                  <p className="font-bold text-slate-900 text-xs">
                    {currentPrescription.diagnosis}
                  </p>
                </div>

                <div className="border border-slate-200/60 rounded-xl p-4 space-y-2.5 bg-slate-50/50">
                  <span className="font-extrabold text-slate-900 block text-xs">Prescribed Pharmacotherapy</span>
                  {currentPrescription.medicines.map((med, index) => (
                    <div key={index} className="space-y-1 border-t border-slate-100 pt-2.5 first:border-0 first:pt-0">
                      <p className="font-bold text-blue-700">{med.name}</p>
                      <p className="text-slate-600 font-semibold">{med.dosage} • {med.duration} duration</p>
                      <p className="text-slate-500 font-medium italic">Instructions: {med.instructions}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Clinic Advisory Notes</span>
                  <p className="text-slate-600 leading-normal font-medium mt-1">
                    {currentPrescription.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Prescribing doctor signature */}
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Issued by</span>
                <span className="font-bold text-slate-800">{currentPrescription.doctorName}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1 border border-emerald-100 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Digitally Signed' : 'डिजिटली हस्ताक्षरित'}
                </span>
              </div>
            </div>

            <button
              onClick={() => alert(`Simulated receipt generation & PDF compilation for ${currentPrescription.id}.pdf`)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3.5 rounded-xl text-xs transition uppercase cursor-pointer"
            >
              {language === 'en' ? 'Download Printable PDF Rx Receipt' : 'नुस्खा रसीद डाउनलोड करें (PDF)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
}
