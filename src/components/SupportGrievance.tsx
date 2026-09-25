/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PhoneCall, ShieldAlert, CheckCircle, Ticket, HeartHandshake, HelpCircle } from 'lucide-react';

export const SupportGrievance: React.FC = () => {
  const { grievances, submitGrievance, language } = useApp();
  const [category, setCategory] = useState('Technical Issue');
  const [description, setDescription] = useState('');
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const tktNo = submitGrievance(category, description);
    setSuccessTicket(tktNo);
    setDescription('');
  };

  return (
    <div id="support-grievance-container" className="space-y-6">
      {/* 24x7 Hotline Header */}
      <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-2.5 rounded-xl">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider">
              {language === 'en' ? '24×7 Patient Support Desk' : '२४×७ रोगी सहायता सेवा'}
            </h4>
            <p className="text-xs text-blue-100 mt-0.5 font-medium">
              {language === 'en' ? 'Immediate assistance for bookings & payments' : 'बुकिंग और भुगतान के लिए त्वरित सहायता'}
            </p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-blue-100 font-semibold">
              {language === 'en' ? 'Hotline Phone Support:' : 'हेल्पलाइन फोन सपोर्ट:'}
            </span>
            <a href="tel:+9118001082026" className="text-sm font-extrabold text-white tracking-wide hover:underline">
              +91 1800 108 2026
            </a>
          </div>
          <p className="text-[11px] text-blue-100/90 leading-relaxed font-medium">
            {language === 'en'
              ? 'Our support covers: Technical issues, Payment shortfalls, Booking re-validations, and general platform help.'
              : 'हमारी सहायता में शामिल हैं: तकनीकी समस्याएं, भुगतान विफलता, बुकिंग और सामान्य प्लेटफ़ॉर्म सहायता।'}
          </p>
        </div>
      </div>

      {/* IT Rules Grievance Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex gap-2 items-start border-b border-slate-100 pb-3">
          <ShieldAlert className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wide">
              {language === 'en' ? 'Formal Grievance Portal' : 'औपचारिक शिकायत पोर्टल'}
            </h4>
            <p className="text-[11px] text-slate-400 font-medium">
              {language === 'en'
                ? 'IT Rules 2021 Compliant • Resolution commitment within 7 business days'
                : 'आईटी नियम २०२१ अनुपालन • ७ कार्य दिवसों के भीतर समाधान प्रतिबद्धता'}
            </p>
          </div>
        </div>

        {successTicket ? (
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 text-center space-y-3.5">
            <div className="w-12 h-12 rounded-full bg-emerald-100 border border-emerald-200 mx-auto flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="font-extrabold text-emerald-950 text-sm">
                {language === 'en' ? 'Grievance Ticket Generated' : 'शिकायत टिकट दर्ज किया गया'}
              </h5>
              <p className="text-xs text-emerald-800 leading-relaxed max-w-xs mx-auto">
                {language === 'en'
                  ? 'Your ticket is recorded instantly and forwarded to the Grievance Officer.'
                  : 'आपका टिकट तुरंत दर्ज कर लिया गया है और शिकायत अधिकारी को भेज दिया गया है।'}
              </p>
            </div>
            <div className="bg-white border border-emerald-200/60 rounded-xl py-2.5 px-4 inline-flex items-center gap-2">
              <Ticket className="w-4 h-4 text-emerald-600" />
              <span className="font-mono font-black text-emerald-950 text-sm">{successTicket}</span>
            </div>
            <div>
              <button
                onClick={() => setSuccessTicket(null)}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold hover:underline"
              >
                {language === 'en' ? 'Submit another grievance' : 'एक और शिकायत दर्ज करें'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'en' ? 'Complaint Category' : 'शिकायत श्रेणी'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="Technical Issue">{language === 'en' ? 'Technical Issue' : 'तकनीकी समस्या'}</option>
                <option value="Refund & Billing">{language === 'en' ? 'Refund & Billing' : 'धनवापसी और बिलिंग'}</option>
                <option value="Doctor No-Show Complaint">{language === 'en' ? 'Doctor No-Show Complaint' : 'डॉक्टर अनुपस्थित शिकायत'}</option>
                <option value="Medical Report Error">{language === 'en' ? 'Medical Report Error' : 'चिकित्सीय रिपोर्ट त्रुटि'}</option>
                <option value="Privacy Concern">{language === 'en' ? 'Privacy Concern' : 'गोपनीयता चिंता'}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'en' ? 'Incident Description' : 'घटना का विवरण'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  language === 'en'
                    ? 'State exactly what went wrong and how we can assist you...'
                    : 'कृपया स्पष्ट रूप से लिखें कि क्या समस्या आई...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl p-3 text-xs transition"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 active:scale-98 transition-transform text-white font-bold py-3 rounded-xl text-xs cursor-pointer shadow-sm shadow-blue-500/10"
            >
              {language === 'en' ? 'Submit Grievance Ticket' : 'शिकायत टिकट सबमिट करें'}
            </button>
          </form>
        )}
      </div>

      {/* Ticket History */}
      {grievances.length > 0 && (
        <div className="space-y-3">
          <h5 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
            {language === 'en' ? 'Your Active Tickets' : 'आपके सक्रिय शिकायत टिकट'}
          </h5>

          <div className="space-y-2">
            {grievances.map((tkt) => (
              <div key={tkt.ticketNumber} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">{tkt.ticketNumber}</span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                      {tkt.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{tkt.description}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                  {tkt.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grievance Officer details display */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
        <HeartHandshake className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
        <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
          <p className="font-bold text-slate-700">
            {language === 'en' ? 'Nodal Grievance Officer:' : 'नोडल शिकायत अधिकारी:'}
          </p>
          <p className="mt-0.5">Mr. Rajeev Kumar | grievance.officer@followupcare.in</p>
          <p>
            {language === 'en'
              ? 'Address: Patna IT Park, Phase 1, Patna, Bihar — 800013'
              : 'पता: पटना आईटी पार्क, फेज १, पटना, बिहार — ८०००१३'}
          </p>
        </div>
      </div>
    </div>
  );
};
