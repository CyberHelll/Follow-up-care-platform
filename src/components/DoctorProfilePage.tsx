/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Doctor } from '../types';
import { Calendar, User, ShieldAlert, Award, Star, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';

interface DoctorProfilePageProps {
  doctor: Doctor;
  onBack: () => void;
  onBookingSuccess: () => void;
}

export const DoctorProfilePage: React.FC<DoctorProfilePageProps> = ({
  doctor,
  onBack,
  onBookingSuccess
}) => {
  const { bookFollowUp, language, addWalletFunds } = useApp();
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [isBooking, setIsProcessing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Check wallet available balance
  const storedWalletBal = localStorage.getItem('care_wallet_bal');
  const walletBalance = storedWalletBal ? Number(storedWalletBal) : 200;

  const totalFee = doctor.followUpFee + Math.round(doctor.followUpFee * 0.10);
  const isBalanceSufficient = walletBalance >= totalFee;
  const shortfall = totalFee - walletBalance;

  // Check eligibility recency
  let isEligibilityExpired = false;
  if (doctor.lastVisitDate) {
    const lastVisit = new Date(doctor.lastVisitDate);
    const monthsDiff = (new Date().getTime() - lastVisit.getTime()) / (1000 * 3600 * 24 * 30);
    const limit = doctor.specialty === 'Psychiatry' ? 6 : 12;
    if (monthsDiff > limit) {
      isEligibilityExpired = true;
    }
  }

  const handleSlotSelect = (slot: string) => {
    setSelectedSlot(slot);
    setBookingError(null);
    setShowConfirmation(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedSlot) return;
    setIsProcessing(true);
    setBookingError(null);

    // Simulated network response time < 2s (PDS pg 27, PRD pg 42)
    setTimeout(() => {
      const res = bookFollowUp(doctor.id, selectedSlot);
      setIsProcessing(false);
      
      if (res.success) {
        setShowConfirmation(false);
        onBookingSuccess();
      } else {
        if (res.error === 'INSUFFICIENT_BALANCE') {
          setBookingError(
            language === 'en'
              ? `Low wallet balance. Please top up ₹${shortfall} to book.`
              : `वॉलेट बैलेंस कम है। बुकिंग के लिए ₹${shortfall} का टॉप-अप करें।`
          );
        } else if (res.error === 'ELIGIBILITY_BLOCK_NEW') {
          setBookingError(
            language === 'en'
              ? `You'll need an in-person visit with Dr. ${doctor.name} before booking a follow-up.`
              : `फ़ॉलो-अप बुक करने से पहले आपको डॉ. ${doctor.name} के साथ व्यक्तिगत रूप से क्लिनिक का दौरा करना होगा।`
          );
        } else if (res.error === 'ELIGIBILITY_BLOCK_EXPIRED') {
          setBookingError(
            language === 'en'
              ? `Your follow-up window with Dr. ${doctor.name} has closed. Please visit the clinic in person first.`
              : `डॉ. ${doctor.name} के साथ आपका फ़ॉलो-अप समय समाप्त हो गया है। कृपया पहले क्लिनिक का दौरा करें।`
          );
        } else {
          setBookingError(res.error || 'Booking failed');
        }
      }
    }, 1200);
  };

  const handleInlineTopUp = () => {
    addWalletFunds(shortfall);
    setBookingError(null);
  };

  return (
    <div id="doctor-profile-screen" className="bg-slate-50 min-h-screen pb-16 font-sans">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-bold text-slate-800 text-base">
          {language === 'en' ? 'Doctor Profile' : 'डॉक्टर प्रोफाइल'}
        </span>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Doctor Identity Block */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex gap-4">
          <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
            <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="space-y-1 truncate">
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100/60 px-2 py-0.5 rounded-full uppercase tracking-wider inline-block">
              {doctor.specialty}
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg truncate leading-snug">{doctor.name}</h3>
            <p className="text-xs text-slate-500 font-semibold truncate leading-tight">{doctor.clinicName}</p>
            <div className="flex gap-3 pt-1 text-[11px] text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                4.9 (48 reviews)
              </span>
            </div>
          </div>
        </div>

        {/* Credentials and Registration - Mandatory Gating (Telemedicine pg 2.1) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            {language === 'en' ? 'Registration Credentials' : 'चिकित्सीय पंजीकरण विवरण'}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider leading-none">
                {language === 'en' ? 'Registration Number' : 'पंजीकरण संख्या'}
              </span>
              <span className="font-mono font-bold text-slate-800 block mt-1">
                {doctor.regNumber}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider leading-none">
                {language === 'en' ? 'Medical Council' : 'पंजीकरण परिषद'}
              </span>
              <span className="font-bold text-slate-800 block mt-1">
                {doctor.medicalCouncil}
              </span>
            </div>
          </div>
        </div>

        {/* Eligibility Check Banners */}
        {!doctor.hasPriorVisit && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <p className="font-bold text-amber-950">
                {language === 'en' ? 'Eligibility Gating Triggered' : 'अपॉइंटमेंट ब्लॉक - अपात्रता'}
              </p>
              <p className="mt-1 leading-relaxed opacity-95">
                {language === 'en'
                  ? `You will need an in-person visit with Dr. ${doctor.name} at their clinic before booking a digital follow-up. Telemedicine Practice Guidelines require a prior physical visit.`
                  : `डिजिटल फ़ॉलो-अप बुक करने से पहले आपको डॉ. ${doctor.name} से क्लिनिक में मिलना होगा। टेलीमेडिसिन दिशा-निर्देशों के अनुसार पहली बार मिलना अनिवार्य है।`}
              </p>
            </div>
          </div>
        )}

        {doctor.hasPriorVisit && isEligibilityExpired && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs md:text-sm">
              <p className="font-bold text-amber-950">
                {language === 'en' ? 'Follow-up Period Expired' : 'पात्रता अवधि समाप्त'}
              </p>
              <p className="mt-1 leading-relaxed opacity-95">
                {language === 'en'
                  ? `It's been over ${doctor.specialty === 'Psychiatry' ? '6' : '12'} months since your last in-person visit. Please book an in-person appointment first to resume digital follow-ups.`
                  : `आपकी पिछली मुलाकात को ${doctor.specialty === 'Psychiatry' ? '6' : '12'} महीने से अधिक समय हो गया है। डिजिटल फ़ॉलो-अप फिर से शुरू करने के लिए कृपया एक बार क्लिनिक में दिखाएं।`}
              </p>
            </div>
          </div>
        )}

        {/* Scheduling Slots Picker */}
        {doctor.hasPriorVisit && !isEligibilityExpired && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                {language === 'en' ? 'Select Follow-up Slot' : 'फ़ॉलो-अप समय चुनें'}
              </h4>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {language === 'en' ? 'Real-time Slots' : 'सीटें उपलब्ध'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {doctor.availableSlots.map((slotStr) => {
                const date = new Date(slotStr);
                const isToday = date.toDateString() === new Date().toDateString();
                const dayName = date.toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { weekday: 'short' });
                const dayNum = date.getDate();
                const monthName = date.toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', { month: 'short' });
                const timeStr = date.toLocaleTimeString(language === 'en' ? 'en-IN' : 'hi-IN', {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <button
                    key={slotStr}
                    onClick={() => handleSlotSelect(slotStr)}
                    className="border border-slate-200 hover:border-blue-500 hover:bg-blue-50/10 hover:text-blue-700 p-3 rounded-xl text-left cursor-pointer transition-all active:scale-95 flex flex-col justify-between h-20"
                  >
                    <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none">
                      {isToday ? (language === 'en' ? 'Today' : 'आज') : `${dayName}, ${dayNum} ${monthName}`}
                    </span>
                    <span className="font-extrabold text-slate-800 block text-xs mt-auto">
                      {timeStr}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pricing information */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <span className="text-slate-500">{language === 'en' ? 'Physical Consultation Fee:' : 'शारीरिक परामर्श शुल्क:'}</span>
            <span className="text-slate-700 line-through">₹{doctor.consultationFee}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-bold border-t border-slate-100 pt-2 text-blue-700">
            <span>{language === 'en' ? 'Digital Follow-up Fee:' : 'डिजिटल फ़ॉलो-अप शुल्क:'}</span>
            <span>₹{doctor.followUpFee}</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-normal pt-1 text-center font-medium">
            {language === 'en'
              ? 'Savings of over 40% compared to clinic travel costs & registration'
              : 'क्लिनिक यात्रा और पंजीकरण लागत की तुलना में 40% से अधिक की बचत'}
          </p>
        </div>
      </div>

      {/* Booking Confirmation Dialog (PDS pg 18) */}
      {showConfirmation && selectedSlot && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-100 animate-slide-up">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider">
                {language === 'en' ? 'Booking Fee Disclosure' : 'भुगतान विवरण और शुल्क'}
              </h4>
              <button
                onClick={() => setShowConfirmation(false)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900"
              >
                {language === 'en' ? 'Go Back' : 'वापस जाएँ'}
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between font-bold">
                <span className="text-slate-500">{language === 'en' ? 'Selected Slot:' : 'चुना गया समय:'}</span>
                <span className="text-slate-800">
                  {new Date(selectedSlot).toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Fee Breakdown (Principle 3) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Doctor Follow-up Fee' : 'डॉक्टर फ़ॉलो-अप शुल्क'}</span>
                  <span className="font-semibold">₹{doctor.followUpFee}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Platform Convenience Fee (10%)' : 'प्लेटफ़ॉर्म सुविधा शुल्क (10%)'}</span>
                  <span className="font-semibold">₹{Math.round(doctor.followUpFee * 0.10)}.00</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 border-t border-slate-100 pt-2">
                  <span>{language === 'en' ? 'Total (Wallet Hold Amount)' : 'कुल आरक्षित राशि'}</span>
                  <span>₹{totalFee}.00</span>
                </div>
              </div>

              <div className="bg-blue-50/50 text-blue-900 border border-blue-100 rounded-xl p-3 text-[11px] leading-relaxed">
                <p className="font-bold flex items-center gap-1 text-blue-950">
                  <Clock className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Wallet-Based Hold Placement' : 'वॉलेट आधारित होल्ड प्रक्रिया'}
                </p>
                <p className="mt-1">
                  {language === 'en'
                    ? `₹${totalFee} will be placed on hold from your wallet now. It is strictly deducted ONLY when both you and your doctor join the call. Cancel at any time before start for a full refund.`
                    : `₹${totalFee} की राशि आपके वॉलेट में आरक्षित (होल्ड) कर दी जाएगी। यह राशि केवल तभी काटी जाएगी जब आप और डॉक्टर दोनों वीडियो कॉल में शामिल होंगे।`}
                </p>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="font-bold text-slate-500">
                  {language === 'en' ? 'Wallet Balance:' : 'वॉलेट शेष राशि:'}
                </span>
                <span className={`font-extrabold text-sm ${isBalanceSufficient ? 'text-emerald-600' : 'text-red-600'}`}>
                  ₹{walletBalance}
                </span>
              </div>

              {/* Shortfall warning & inline top up */}
              {!isBalanceSufficient && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-red-900 space-y-2">
                  <p className="font-bold text-[11px]">
                    {language === 'en'
                      ? `⚠️ Insufficient Balance (Shortfall: ₹${shortfall})`
                      : `⚠️ अपर्याप्त राशि (कमी: ₹${shortfall})`}
                  </p>
                  <button
                    onClick={handleInlineTopUp}
                    className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg text-[10px] uppercase tracking-wider transition cursor-pointer"
                  >
                    {language === 'en' ? `One-Tap Top Up ₹${shortfall} & Proceed` : `त्वरित वॉलेट टॉप-अप ₹${shortfall}`}
                  </button>
                </div>
              )}
            </div>

            {bookingError && (
              <p className="text-xs font-extrabold text-red-600 text-center">{bookingError}</p>
            )}

            <button
              onClick={handleConfirmBooking}
              disabled={isBooking || !isBalanceSufficient}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white disabled:text-slate-400 font-extrabold py-3.5 rounded-xl text-sm transition tracking-wide cursor-pointer flex justify-center items-center gap-2"
            >
              {isBooking ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  {language === 'en' ? 'Placing Hold & Saving...' : 'भुगतान आरक्षित किया जा रहा है...'}
                </>
              ) : (
                language === 'en' ? 'Confirm & Reserve Slot' : 'अपॉइंटमेंट आरक्षित करें'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
