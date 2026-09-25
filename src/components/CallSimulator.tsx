/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FollowUp } from '../types';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Image,
  Sparkles,
  WifiOff,
  Volume2,
  AlertTriangle,
  HeartHandshake,
  CheckCircle,
  Clock,
  Download
} from 'lucide-react';

interface CallSimulatorProps {
  appointment: FollowUp;
  onClose: () => void;
}

export const CallSimulator: React.FC<CallSimulatorProps> = ({ appointment, onClose }) => {
  const { endCall, triggerEmergencyFlag, language, simulateDoctorJoin, records } = useApp();
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [poorBandwidth, setPoorBandwidth] = useState(false);
  const [doctorJoined, setDoctorJoined] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [prescribeNotes, setPrescribeNotes] = useState('');
  const [showShareRecords, setShowShareRecords] = useState(false);
  const [sharedFiles, setSharedFiles] = useState<string[]>([]);
  const [callEnded, setCallEnded] = useState(false);

  useEffect(() => {
    // Automatically join doctor in 3 seconds to demo connection states (PDS pg 14)
    const joinTimer = setTimeout(() => {
      setDoctorJoined(true);
      simulateDoctorJoin(appointment.id);
    }, 3000);

    return () => clearTimeout(joinTimer);
  }, [appointment.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (doctorJoined && !callEnded) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [doctorJoined, callEnded]);

  const toggleBandwidth = () => {
    setPoorBandwidth(!poorBandwidth);
  };

  const handleDoctorPrescribeAndEnd = () => {
    endCall(appointment.id, prescribeNotes);
    setCallEnded(true);
  };

  const handleEmergencyRedirect = (type: 'in_person' | 'emergency') => {
    triggerEmergencyFlag(appointment.id, type);
    setCallEnded(true);
  };

  const shareRecord = (name: string) => {
    if (!sharedFiles.includes(name)) {
      setSharedFiles([...sharedFiles, name]);
    }
    setShowShareRecords(false);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remaining.toString().padStart(2, '0')}`;
  };

  return (
    <div id="call-simulator-overlay" className="fixed inset-0 bg-slate-950 z-50 flex flex-col text-white font-sans md:p-4">
      {/* Privacy Guarantee Header */}
      <div className="bg-slate-900 px-4 py-3 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {language === 'en' ? 'Live Follow-up Consultation' : 'लाइव परामर्श सक्रिय'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
          <HeartHandshake className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="text-[10px] font-bold text-blue-300 tracking-wider">
            {language === 'en' ? '🔒 THIS CONSULTATION IS NEVER RECORDED' : '🔒 यह परामर्श कभी रिकॉर्ड नहीं होता'}
          </span>
        </div>
      </div>

      {/* Main Stream Canvas */}
      <div className="flex-1 relative bg-slate-900 overflow-hidden flex flex-col md:flex-row justify-center items-center gap-4 p-4">
        
        {/* Poor Bandwidth Toast Fallback (PDS pg 14) */}
        {poorBandwidth && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-amber-600/95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg border border-amber-500 flex items-center gap-2 animate-bounce">
            <Volume2 className="w-4 h-4 shrink-0" />
            <span>
              {language === 'en'
                ? 'Switched to audio-only on poor bandwidth — your call continues'
                : 'कम नेटवर्क स्पीड के कारण केवल ऑडियो मोड सक्रिय — परामर्श जारी है'}
            </span>
          </div>
        )}

        {/* Doctor Stream Card */}
        <div className="w-full h-1/2 md:h-full md:w-1/2 rounded-2xl bg-slate-950 relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-xl">
          {doctorJoined ? (
            poorBandwidth ? (
              // Audio only mode
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full border-4 border-slate-700 mx-auto overflow-hidden animate-pulse">
                  <img src={appointment.doctorPhoto} alt="Doctor" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg">{appointment.doctorName}</h4>
                  <p className="text-xs text-blue-400 font-semibold">{appointment.doctorSpecialty}</p>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 py-1 px-2.5 rounded-full inline-block">
                    {language === 'en' ? 'AUDIO-ONLY ACTIVE' : 'केवल ऑडियो सक्रिय'}
                  </p>
                </div>
              </div>
            ) : (
              // Video mode
              <>
                <img
                  src={appointment.doctorPhoto}
                  alt="Doctor Stream"
                  className="w-full h-full object-cover select-none"
                  referrerPolicy="no-referrer"
                />
                {/* Doctor Metadata overlay */}
                <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-800">
                  <h4 className="text-sm font-bold">{appointment.doctorName}</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                    {appointment.doctorSpecialty} • Reg: {appointment.doctorRegNumber}
                  </p>
                </div>
              </>
            )
          ) : (
            // Connection Waiting
            <div className="text-center space-y-4">
              <span className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent inline-block" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-300">
                  {language === 'en' ? `Connecting with ${appointment.doctorName}...` : `डॉक्टर ${appointment.doctorName} से जुड़ रहे हैं...`}
                </p>
                <p className="text-xs text-slate-500 font-semibold">
                  {language === 'en' ? 'Verifying secure WebRTC gateway' : 'सुरक्षित गेटवे सत्यापित किया जा रहा है'}
                </p>
              </div>
            </div>
          )}

          {/* Call Session timer overlay */}
          {doctorJoined && (
            <div className="absolute top-4 right-4 bg-slate-950/75 backdrop-blur-xs border border-slate-800 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-mono">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>{formatTime(elapsedSeconds)}</span>
            </div>
          )}
        </div>

        {/* Patient Stream Card */}
        <div className="w-full h-1/2 md:h-full md:w-1/2 rounded-2xl bg-slate-950 relative overflow-hidden flex items-center justify-center border border-slate-800 shadow-xl">
          {videoActive && !poorBandwidth ? (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center relative">
              {/* Simulated camera capture */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-slate-900 to-blue-950">
                <div className="text-center space-y-3">
                  <div className="w-20 h-20 rounded-full bg-slate-800 mx-auto flex items-center justify-center border-2 border-slate-700 shadow-inner">
                    <span className="text-xl font-bold text-slate-300">YOU</span>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">
                    {language === 'en' ? 'Camera feed active (Local)' : 'कैमरा चालू है (लोकल)'}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-4 left-4 bg-slate-950/85 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-800">
                <p className="text-xs font-bold">{language === 'en' ? 'Your Feed' : 'आपका वीडियो'}</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 mx-auto flex items-center justify-center text-slate-500">
                <VideoOff className="w-6 h-6" />
              </div>
              <p className="text-xs text-slate-400 font-semibold">
                {language === 'en' ? 'Your Video is Turned Off' : 'आपका वीडियो बंद है'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Shared Records Panel */}
      {sharedFiles.length > 0 && (
        <div className="bg-slate-900 border-t border-slate-800 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            {language === 'en' ? 'Currently shared reports in call' : 'परामर्श में साझा की गई रिपोर्टें'}
          </p>
          <div className="flex flex-wrap gap-2">
            {sharedFiles.map((name, idx) => (
              <span key={idx} className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 text-blue-400">
                <Download className="w-3.5 h-3.5 shrink-0" />
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Demo Controls Panel (Drawer footer) to mimic Doctor triggers */}
      {doctorJoined && !callEnded && (
        <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-3 flex flex-wrap justify-between items-center gap-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 shrink-0">
            🧪 Doctor & Network Emulator panel (Test flows)
          </span>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={toggleBandwidth}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition select-none cursor-pointer ${
                poorBandwidth
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              <WifiOff className="w-3.5 h-3.5 shrink-0" />
              {poorBandwidth ? 'Restore Network Speed' : 'Simulate Poor Network'}
            </button>

            <button
              onClick={() => handleEmergencyRedirect('in_person')}
              className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Doctor Flag: In-person Care
            </button>

            <button
              onClick={() => handleEmergencyRedirect('emergency')}
              className="bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
              Doctor Flag: Emergency care
            </button>
          </div>

          <div className="w-full md:w-auto flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
            <input
              type="text"
              placeholder="Doctor's clinical notes..."
              value={prescribeNotes}
              onChange={(e) => setPrescribeNotes(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded-lg focus:outline-none focus:border-blue-500 w-full md:w-56"
            />
            <button
              onClick={handleDoctorPrescribeAndEnd}
              className="bg-blue-600 hover:bg-blue-500 text-white inline-flex items-center gap-1 px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Issue Rx & End
            </button>
          </div>
        </div>
      )}

      {/* Main Interactive Action Controls */}
      <div className="bg-slate-950 border-t border-slate-900 px-6 py-5 flex justify-between items-center gap-4">
        <div className="flex gap-3">
          <button
            onClick={() => setMicActive(!micActive)}
            className={`p-3.5 rounded-full transition cursor-pointer ${
              micActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
            }`}
          >
            {micActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setVideoActive(!videoActive)}
            className={`p-3.5 rounded-full transition cursor-pointer ${
              videoActive ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 text-white'
            }`}
            disabled={poorBandwidth}
          >
            {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowShareRecords(!showShareRecords)}
            className="p-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition cursor-pointer"
          >
            <Image className="w-5 h-5" />
          </button>
        </div>

        <button
          onClick={onClose}
          className="bg-red-600 hover:bg-red-500 active:scale-95 transition text-white px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 cursor-pointer shrink-0 shadow-lg shadow-red-600/10"
        >
          <PhoneOff className="w-4 h-4 shrink-0" />
          {language === 'en' ? 'Leave Call' : 'परामर्श समाप्त करें'}
        </button>
      </div>

      {/* Share records sheet */}
      {showShareRecords && (
        <div className="absolute inset-0 bg-slate-950/95 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-sm uppercase tracking-wider text-slate-300">
                {language === 'en' ? 'Select Medical Record to Share' : 'साझा करने के लिए रिकॉर्ड चुनें'}
              </h4>
              <button onClick={() => setShowShareRecords(false)} className="text-slate-500 hover:text-white font-bold text-xs">
                {language === 'en' ? 'Close' : 'बंद करें'}
              </button>
            </div>
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {records.filter(r => !r.isDeleted && r.status === 'completed').length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4">No records available to share.</p>
              ) : (
                records.filter(r => !r.isDeleted && r.status === 'completed').map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => shareRecord(rec.name)}
                    className="w-full text-left bg-slate-950 border border-slate-800 hover:border-blue-500 hover:bg-blue-500/5 p-3 rounded-xl flex justify-between items-center gap-3 transition"
                  >
                    <span className="text-xs font-semibold truncate text-slate-300">{rec.name}</span>
                    <ChevronRightIcon className="w-4 h-4 text-slate-500" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Call ended view */}
      {callEnded && (
        <div className="absolute inset-0 bg-slate-950 z-50 flex items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto flex items-center justify-center text-emerald-500 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold">
                {language === 'en' ? 'Consultation Concluded' : 'परामर्श समाप्त हुआ'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {language === 'en'
                  ? 'Your transaction has been processed. All clinical files, prescription version records, and metadata have accrued safely in My Records.'
                  : 'आपका भुगतान और लेजर अपडेट कर दिया गया है। नुस्खे और परामर्श का सारा विवरण सुरक्षित रूप से संग्रहित कर लिया गया है।'}
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
            >
              {language === 'en' ? 'View Prescription & Rate Doctor' : 'नुस्खा देखें और रेटिंग दें'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple Chevron Icon
function ChevronRightIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
