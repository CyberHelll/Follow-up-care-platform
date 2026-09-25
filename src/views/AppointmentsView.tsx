/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FollowUp, FollowUpStatus, Doctor } from '../types';
import { Calendar, User, Clock, ArrowRight, ShieldCheck, Star, AlertTriangle, AlertCircle, RefreshCw, XCircle, FileText, ChevronRight } from 'lucide-react';

interface AppointmentsViewProps {
  onJoinCall: (appointment: FollowUp) => void;
  onViewPrescription: (prescriptionId: string) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  onJoinCall,
  onViewPrescription
}) => {
  const {
    followUps,
    doctors,
    language,
    rescheduleFollowUp,
    cancelFollowUp,
    confirmDoctorScheduledFollowUp,
    submitRating,
    joinWaitingRoom
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming');
  const [selectedApptForCancel, setSelectedApptForCancel] = useState<FollowUp | null>(null);
  const [selectedApptForReschedule, setSelectedApptForReschedule] = useState<FollowUp | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState<FollowUp | null>(null);
  const [currentRating, setCurrentRating] = useState(5);
  const [apptActionError, setApptActionError] = useState<string | null>(null);

  const getFilteredFollowUps = () => {
    switch (activeSubTab) {
      case 'upcoming':
        return followUps.filter(f => f.status === 'upcoming' || f.status === 'waiting_room' || f.status === 'needs_consent');
      case 'past':
        return followUps.filter(f => f.status === 'completed' || f.status === 'patient_no_show' || f.status === 'doctor_no_show');
      case 'cancelled':
        return followUps.filter(f => f.status === 'cancelled');
    }
  };

  const filteredAppts = getFilteredFollowUps().sort((a, b) => {
    if (activeSubTab === 'upcoming') {
      return new Date(a.slot).getTime() - new Date(b.slot).getTime();
    }
    return new Date(b.slot).getTime() - new Date(a.slot).getTime();
  });

  const handleCancelClick = (appt: FollowUp) => {
    setSelectedApptForCancel(appt);
  };

  const handleConfirmCancel = () => {
    if (!selectedApptForCancel) return;
    cancelFollowUp(selectedApptForCancel.id);
    setSelectedApptForCancel(null);
  };

  const handleRescheduleClick = (appt: FollowUp) => {
    setSelectedApptForReschedule(appt);
    setRescheduleSlot(null);
    setApptActionError(null);
  };

  const handleConfirmReschedule = () => {
    if (!selectedApptForReschedule || !rescheduleSlot) return;
    const res = rescheduleFollowUp(selectedApptForReschedule.id, rescheduleSlot);
    if (res.success) {
      setSelectedApptForReschedule(null);
    } else {
      setApptActionError(
        language === 'en'
          ? 'Rescheduling limit reached or slot unavailable.'
          : 'पुनर्निर्धारण सीमा समाप्त हो गई है या समय स्लॉट उपलब्ध नहीं है।'
      );
    }
  };

  const handleConsentConfirm = (apptId: string) => {
    confirmDoctorScheduledFollowUp(apptId);
  };

  const handleRateSubmit = () => {
    if (!showRatingModal) return;
    submitRating(showRatingModal.id, currentRating);
    setShowRatingModal(null);
  };

  return (
    <div id="appointments-view" className="space-y-4 font-sans pb-8">
      {/* Tab Switcher (Section 3.3) */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200">
        {(['upcoming', 'past', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveSubTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all uppercase tracking-wider cursor-pointer ${
              activeSubTab === tab
                ? 'bg-white text-blue-700 shadow-xs ring-1 ring-black/5'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab === 'upcoming'
              ? (language === 'en' ? 'Upcoming' : 'सक्रिय')
              : tab === 'past'
              ? (language === 'en' ? 'Past / Completed' : 'विगत / पूर्ण')
              : (language === 'en' ? 'Cancelled' : 'रद्द')}
          </button>
        ))}
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {filteredAppts.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-150 rounded-2xl p-6">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto stroke-[1.5]" />
            <h4 className="font-extrabold text-slate-800 text-sm mt-3">
              {activeSubTab === 'upcoming'
                ? (language === 'en' ? 'No upcoming follow-ups yet' : 'कोई सक्रिय फ़ॉलो-अप नहीं है')
                : (language === 'en' ? 'No records matching this tab' : 'कोई रिकॉर्ड उपलब्ध नहीं है')}
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              {activeSubTab === 'upcoming'
                ? (language === 'en'
                  ? "Scan your doctor's cabin QR code to book your first remote consultation."
                  : 'अपने डॉक्टर का क्यूआर कोड स्कैन करके अपनी पहली बुकिंग करें।')
                : ''}
            </p>
          </div>
        ) : (
          filteredAppts.map((appt) => {
            const date = new Date(appt.slot);
            const isToday = date.toDateString() === new Date().toDateString();
            const formattedSlot = date.toLocaleString(language === 'en' ? 'en-IN' : 'hi-IN', {
              day: '2-digit',
              month: 'short',
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={appt.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
              >
                {/* Doctor Identity Header */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex gap-3">
                    <div className="w-11 h-11 bg-slate-50 border border-slate-150 rounded-xl overflow-hidden shrink-0">
                      <img src={appt.doctorPhoto} alt={appt.doctorName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
                        {appt.doctorName}
                        <span className="text-[9px] font-bold bg-blue-50 text-blue-600 rounded-md px-1.5 py-0.5 border border-blue-100">
                          {appt.doctorSpecialty}
                        </span>
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{appt.clinicName}</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      appt.status === 'needs_consent'
                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                        : appt.status === 'upcoming'
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : appt.status === 'waiting_room'
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse'
                        : appt.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {appt.status === 'needs_consent'
                      ? (language === 'en' ? 'Consent Action Required' : 'सहमति आवश्यक')
                      : appt.status === 'upcoming'
                      ? (language === 'en' ? 'Upcoming' : 'आरक्षित')
                      : appt.status === 'waiting_room'
                      ? (language === 'en' ? 'Portal Active' : 'वेटिंग रूम उपलब्ध')
                      : appt.status === 'completed'
                      ? (language === 'en' ? 'Completed' : 'पूर्ण')
                      : appt.status === 'cancelled'
                      ? (language === 'en' ? 'Cancelled' : 'रद्द')
                      : appt.status === 'doctor_no_show'
                      ? (language === 'en' ? 'Doctor No-Show (Refunded)' : 'डॉक्टर अनुपस्थित (रिफंड)')
                      : (language === 'en' ? 'Patient No-Show' : 'मरीज अनुपस्थित')}
                  </span>
                </div>

                {/* Slot Details Row */}
                <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-slate-700">{formattedSlot}</span>
                  </div>
                  <span className="font-extrabold text-slate-900">₹{appt.holdAmount}</span>
                </div>

                {/* Dynamic Actions for UPCOMING (Gated & Multi-step PDS Section 9.3) */}
                {activeSubTab === 'upcoming' && (
                  <div className="flex flex-col gap-2 pt-1">
                    {appt.status === 'needs_consent' ? (
                      // E3 Variant Gated Consent Action
                      <div className="space-y-3 bg-amber-50/50 border border-amber-100 rounded-xl p-3.5">
                        <p className="text-[11px] text-amber-900 leading-relaxed font-semibold">
                          {language === 'en'
                            ? `⚠️ Dr. ${appt.doctorName} has suggested this follow-up slot. Giving consent reserves the session and places a ₹${appt.holdAmount} hold on your platform wallet.`
                            : `⚠️ डॉ. ${appt.doctorName} ने इस फॉलो-अप की सलाह दी है। सहमति देने पर ₹${appt.holdAmount} का होल्ड आपके वॉलेट में रखा जाएगा।`}
                        </p>
                        <button
                          onClick={() => handleConsentConfirm(appt.id)}
                          className="w-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold py-2.5 rounded-lg text-xs transition cursor-pointer"
                        >
                          {language === 'en' ? 'Accept & Place Wallet Hold' : 'सहमति दें और होल्ड स्वीकृत करें'}
                        </button>
                      </div>
                    ) : (
                      // Confirmed Booking Flow: Reschedule / Cancel / Enter
                      <div className="space-y-2">
                        {/* Live consultations entry portals (Waiting room) */}
                        <div className="flex gap-2">
                          {/* We allow join waiting room at any time in demo to simplify manual testing, but explain constraints */}
                          <button
                            onClick={() => {
                              joinWaitingRoom(appt.id);
                              onJoinCall(appt);
                            }}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-98 transition-transform text-white font-extrabold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-blue-500/10"
                          >
                            <span>{language === 'en' ? 'Join Waiting Room & Call' : 'वेटिंग रूम / कॉल ज्वाइन करें'}</span>
                            <ArrowRight className="w-4 h-4 shrink-0" />
                          </button>
                        </div>

                        <div className="flex gap-2.5">
                          <button
                            onClick={() => handleRescheduleClick(appt)}
                            className="flex-1 bg-slate-100 hover:bg-slate-200 active:scale-95 transition text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                            {language === 'en' ? 'Reschedule' : 'रीशेड्यूल'}
                            {appt.reschedulesCount > 0 && ` (${appt.reschedulesCount}/2)`}
                          </button>

                          <button
                            onClick={() => handleCancelClick(appt)}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            <XCircle className="w-3.5 h-3.5 shrink-0" />
                            {language === 'en' ? 'Cancel Follow-up' : 'रद्द करें'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dynamic Actions for PAST (Ratings, Prescriptions) */}
                {activeSubTab === 'past' && (
                  <div className="flex gap-2.5 pt-1">
                    {appt.status === 'completed' && appt.prescriptionId && (
                      <button
                        onClick={() => onViewPrescription(appt.prescriptionId!)}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition"
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        {language === 'en' ? 'View Prescription' : 'नुस्खा देखें'}
                      </button>
                    )}

                    {appt.status === 'completed' && (
                      <button
                        onClick={() => setShowRatingModal(appt)}
                        className="flex-1 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition text-slate-700"
                      >
                        <Star className={`w-3.5 h-3.5 shrink-0 ${appt.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
                        {appt.rating 
                          ? (language === 'en' ? `Rated ${appt.rating} Stars` : `रेटिंग: ${appt.rating} स्टार`) 
                          : (language === 'en' ? 'Rate Doctor' : 'रेटिंग दें')}
                      </button>
                    )}

                    {appt.status === 'doctor_no_show' && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 w-full text-[11px] text-emerald-950 font-medium">
                        {language === 'en'
                          ? '✅ Hold released in full. ₹' + appt.holdAmount + ' has been credited back to your wallet available balance. No fee was charged.'
                          : '✅ आरक्षित राशि वॉलेट में रिफंड कर दी गई है। कोई भी शुल्क नहीं काटा गया।'}
                      </div>
                    )}

                    {appt.status === 'patient_no_show' && (
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3 w-full text-[11px] text-red-950 font-semibold space-y-1">
                        <p>
                          {language === 'en'
                            ? `⚠️ 50% doctor compensation fee (₹${Math.round(appt.doctorFee * 0.50)}) was deducted. Platform convenience fee waived.`
                            : `⚠️ डॉक्टर को हुई असुविधा के लिए 50% हर्जाना शुल्क (₹${Math.round(appt.doctorFee * 0.50)}) काटा गया है।`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Cancellation Warning Dialog (PDS pg 19, PDS pg 26) */}
      {selectedApptForCancel && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl border border-slate-100">
            <div className="flex gap-3 text-red-900 bg-red-50 p-3.5 rounded-xl border border-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-red-950 text-sm">
                  {language === 'en' ? 'Cancel this follow-up?' : 'अपॉइंटमेंट रद्द करें?'}
                </h4>
                <p className="text-xs text-red-800 leading-relaxed mt-1">
                  {language === 'en'
                    ? "If it's before the consultation starts, your payment hold will be released in full. No penalty or convenience fees are charged."
                    : 'परामर्श शुरू होने से पहले रद्द करने पर आपके द्वारा आरक्षित रखी गई पूरी राशि बिना किसी कटौती के आपके वॉलेट में वापस आ जाएगी।'}
                </p>
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setSelectedApptForCancel(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs transition cursor-pointer"
              >
                {language === 'en' ? 'Keep Appointment' : 'चालू रखें'}
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-extrabold py-3 rounded-xl text-xs transition cursor-pointer shadow-sm shadow-red-600/10"
              >
                {language === 'en' ? 'Confirm Cancellation' : 'रद्द करना स्वीकार करें'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Selector Modal (PDS pg 14) */}
      {selectedApptForReschedule && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl animate-slide-up border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wide">
                {language === 'en' ? 'Reschedule Follow-up' : 'अपॉइंटमेंट पुनर्निर्धारित करें'}
              </h4>
              <button onClick={() => setSelectedApptForReschedule(null)} className="text-xs font-bold text-slate-500 hover:text-slate-950">
                {language === 'en' ? 'Close' : 'बंद करें'}
              </button>
            </div>

            {selectedApptForReschedule.reschedulesCount >= 1 && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2.5 text-amber-900 text-xs">
                <AlertCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                <p className="font-bold">
                  {language === 'en'
                    ? "Warning: This is your last free reschedule for this follow-up."
                    : 'चेतावनी: यह इस अपॉइंटमेंट के लिए अंतिम निःशुल्क रीशेड्यूल है।'}
                </p>
              </div>
            )}

            {/* List Slots */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {language === 'en' ? 'Select New Available Slot:' : 'नया समय चुनें:'}
              </label>
              
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {(doctors.find(d => d.id === selectedApptForReschedule.doctorId)?.availableSlots || []).map((slotStr) => {
                  const date = new Date(slotStr);
                  const formatted = date.toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <button
                      key={slotStr}
                      onClick={() => {
                        setRescheduleSlot(slotStr);
                        setApptActionError(null);
                      }}
                      className={`border p-2.5 rounded-xl text-left text-xs transition cursor-pointer ${
                        rescheduleSlot === slotStr
                          ? 'border-blue-500 bg-blue-50/20 text-blue-700 font-extrabold'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      {formatted}
                    </button>
                  );
                })}
              </div>
            </div>

            {apptActionError && (
              <p className="text-xs font-bold text-red-600 text-center">{apptActionError}</p>
            )}

            <button
              onClick={handleConfirmReschedule}
              disabled={!rescheduleSlot}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-200 text-white disabled:text-slate-400 font-extrabold py-3.5 rounded-xl text-xs transition cursor-pointer"
            >
              {language === 'en' ? 'Reschedule Appointment' : 'समय परिवर्तन सुरक्षित करें'}
            </button>
          </div>
        </div>
      )}

      {/* Skippable Feedback Rating Modal (PDS pg 15, PRD pg 35) */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center space-y-4 shadow-xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-100 mx-auto flex items-center justify-center text-amber-500">
              <Star className="w-6 h-6 fill-amber-500" />
            </div>

            <div className="space-y-1">
              <h4 className="font-extrabold text-slate-900 text-sm">
                {language === 'en' ? `Rate Dr. ${showRatingModal.doctorName}` : `डॉ. ${showRatingModal.doctorName} को रेटिंग दें`}
              </h4>
              <p className="text-xs text-slate-400">
                {language === 'en' ? 'Share your experience to improve clinical follow-up care.' : 'रोगी प्रतिक्रिया द्वारा देखभाल गुणवत्ता बेहतर बनाएं।'}
              </p>
            </div>

            {/* Star selector */}
            <div className="flex justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setCurrentRating(star)}
                  className="p-1 cursor-pointer transition hover:scale-110 shrink-0"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= currentRating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setShowRatingModal(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3 rounded-xl text-xs cursor-pointer"
              >
                {language === 'en' ? 'Skip' : 'छोड़ें'}
              </button>
              <button
                onClick={handleRateSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold py-3 rounded-xl text-xs cursor-pointer"
              >
                {language === 'en' ? 'Submit' : 'जमा करें'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
