/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Wallet, ArrowDownLeft, ArrowUpRight, Lock, CheckCircle2, History, CreditCard, ChevronRight } from 'lucide-react';

interface WalletCardProps {
  onTopUpSuccess?: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({ onTopUpSuccess }) => {
  const { ledger, language, addWalletFunds, followUps } = useApp();
  const [topUpAmount, setTopUpAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTopUpOptions, setShowTopUpOptions] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Calculate balances from ledger and active holds
  // Available wallet balance is loaded/saved in AppContext, as well as held amount.
  const storedWalletBal = localStorage.getItem('care_wallet_bal');
  const walletBalance = storedWalletBal ? Number(storedWalletBal) : 200;

  const storedWalletHeld = localStorage.getItem('care_wallet_held');
  const walletHeld = storedWalletHeld ? Number(storedWalletHeld) : 0;

  const handleTopUp = (amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    setIsProcessing(true);
    setPaymentError(null);

    // Simulate payment gateway loading state (max 2 seconds) (PDS pg 27, PRD pg 42)
    setTimeout(() => {
      addWalletFunds(amount);
      setIsProcessing(false);
      setTopUpAmount('');
      setShowTopUpOptions(false);
      if (onTopUpSuccess) {
        onTopUpSuccess();
      }
    }, 1500);
  };

  const handleCustomTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(topUpAmount);
    if (!parsed || parsed <= 0) {
      setPaymentError(language === 'en' ? 'Please enter a valid top up amount' : 'कृपया सही राशि दर्ज करें');
      return;
    }
    handleTopUp(parsed);
  };

  return (
    <div id="wallet-card-container" className="space-y-6">
      {/* Wallet Balance Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
        
        <div className="flex justify-between items-start relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="bg-white/10 p-2 rounded-xl">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-semibold tracking-wide text-slate-300">
              {language === 'en' ? 'Continuity Wallet' : 'परामर्श वॉलेट'}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            {language === 'en' ? 'OFFLINE PERSISTENCE ACTIVE' : 'सुरक्षित ऑफलाइन सक्रिय'}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-6 gap-y-2 relative z-10">
          <div>
            <span className="text-xs text-slate-400 block font-medium uppercase tracking-wider">
              {language === 'en' ? 'Available Balance' : 'उपलब्ध राशि'}
            </span>
            <span className="text-4xl font-extrabold tracking-tight mt-1 block">
              ₹{walletBalance.toLocaleString('en-IN')}
            </span>
          </div>

          {walletHeld > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider leading-none">
                  {language === 'en' ? 'Reserved (Held)' : 'आरक्षित (होल्ड)'}
                </span>
                <span className="text-sm font-bold text-blue-300">
                  ₹{walletHeld.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Hold Explanation Notice (Principle 3) */}
        {walletHeld > 0 && (
          <p className="mt-4 text-[11px] text-slate-300 bg-white/5 border border-white/5 p-2 rounded-lg leading-relaxed relative z-10">
            {language === 'en'
              ? '🔒 Hold funds are reserved to ensure your booking. Deduction occurs strictly when both you and your doctor join the consultation call.'
              : '🔒 आरक्षित राशि केवल आपके अपॉइंटमेंट के लिए होल्ड पर है। जब आप और डॉक्टर दोनों वीडियो कॉल ज्वाइन करेंगे, तभी राशि काटी जाएगी।'}
          </p>
        )}

        <div className="mt-6 flex gap-3 relative z-10">
          <button
            onClick={() => setShowTopUpOptions(!showTopUpOptions)}
            className="flex-1 bg-blue-600 hover:bg-blue-500 active:scale-98 transition-transform font-bold text-sm py-3 px-4 rounded-xl text-center cursor-pointer"
          >
            {language === 'en' ? 'Add Money / Top Up' : 'वॉलेट रीचार्ज करें'}
          </button>
        </div>
      </div>

      {/* Top up Dialog */}
      {showTopUpOptions && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm uppercase tracking-wide">
              <CreditCard className="w-4 h-4 text-blue-600" />
              {language === 'en' ? 'Instant Wallet Top-up' : 'त्वरित रीचार्ज'}
            </h4>
            <button
              onClick={() => setShowTopUpOptions(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              {language === 'en' ? 'Cancel' : 'रद्द करें'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[100, 300, 500].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleTopUp(amt)}
                disabled={isProcessing}
                className="border border-slate-200 hover:border-blue-500 hover:bg-blue-50/20 active:scale-95 transition text-slate-800 hover:text-blue-700 py-2.5 rounded-xl text-xs font-bold shrink-0 disabled:opacity-50"
              >
                +₹{amt}
              </button>
            ))}
          </div>

          <form onSubmit={handleCustomTopUp} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {language === 'en' ? 'Or enter custom amount (₹)' : 'या अन्य राशि दर्ज करें (₹)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-slate-500">₹</span>
                <input
                  type="number"
                  placeholder="250"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  disabled={isProcessing}
                  className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 rounded-xl pl-7 pr-3 py-2.5 text-sm font-semibold transition"
                />
              </div>
            </div>

            {paymentError && (
              <p className="text-xs font-bold text-red-600">{paymentError}</p>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                  {language === 'en' ? 'Connecting Secure Gateway...' : 'सुरक्षित गेटवे से जुड़ रहे हैं...'}
                </>
              ) : (
                language === 'en' ? 'Pay Now & Top Up' : 'अभी भुगतान करें'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Ledger History View */}
      <div className="space-y-4">
        <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
          <History className="w-4 h-4 text-slate-500" />
          {language === 'en' ? 'Account Ledger Statements' : 'खाता लेजर विवरण'}
        </h4>

        <div className="space-y-3.5">
          {ledger.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs text-slate-500 font-medium">
                {language === 'en' ? 'No transactions yet.' : 'कोई लेनदेन इतिहास उपलब्ध नहीं है।'}
              </p>
            </div>
          ) : (
            ledger.map((entry) => {
              const date = new Date(entry.timestamp);
              const formattedDate = date.toLocaleDateString(language === 'en' ? 'en-IN' : 'hi-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={entry.id}
                  className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-4 transition-all hover:shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        entry.type === 'Top-up'
                          ? 'bg-emerald-50 text-emerald-600'
                          : entry.type === 'Release'
                          ? 'bg-blue-50 text-blue-600'
                          : entry.type === 'Hold'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {entry.type === 'Top-up' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : entry.type === 'Release' ? (
                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
                      ) : entry.type === 'Hold' ? (
                        <Lock className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 text-sm block leading-tight">
                        {language === 'en' ? entry.labelEn : entry.labelHi}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
                        {formattedDate}
                      </span>
                      <span className="text-xs text-slate-500 leading-normal block mt-1">
                        {entry.descriptionEn}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`font-extrabold text-sm ${
                        entry.type === 'Top-up' || entry.type === 'Release'
                          ? 'text-emerald-600'
                          : entry.type === 'Hold'
                          ? 'text-amber-600'
                          : 'text-slate-800'
                      }`}
                    >
                      {entry.type === 'Top-up' || entry.type === 'Release' ? '+' : '-'}₹{entry.amount}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
