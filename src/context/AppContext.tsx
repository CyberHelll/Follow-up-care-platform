/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Patient,
  Doctor,
  FollowUp,
  FollowUpStatus,
  LedgerEntry,
  MedicalRecord,
  Prescription,
  GrievanceTicket,
  ConsentRecord
} from '../types';

interface AppContextType {
  currentPatient: Patient | null;
  doctors: Doctor[];
  followUps: FollowUp[];
  ledger: LedgerEntry[];
  records: MedicalRecord[];
  prescriptions: Prescription[];
  grievances: GrievanceTicket[];
  language: 'en' | 'hi';
  onboardingStep: number;
  qrSimulationDoctorId: string | null;
  qrSimulationStale: boolean;
  
  // Actions
  setLanguage: (lang: 'en' | 'hi') => void;
  registerPatient: (name: string, mobile: string, dob: string, consents: ConsentRecord[]) => void;
  updatePatientProfile: (name: string, mobile: string) => void;
  updateConsent: (consentId: string, agreed: boolean) => void;
  addWalletFunds: (amount: number) => void;
  bookFollowUp: (doctorId: string, slot: string) => { success: boolean; error?: string };
  confirmDoctorScheduledFollowUp: (followUpId: string) => void;
  rescheduleFollowUp: (followUpId: string, newSlot: string) => { success: boolean; error?: string };
  cancelFollowUp: (followUpId: string) => void;
  joinWaitingRoom: (followUpId: string) => void;
  joinCall: (followUpId: string) => void;
  simulateDoctorJoin: (followUpId: string) => void;
  simulateDoctorNoShow: (followUpId: string) => void;
  simulatePatientNoShow: (followUpId: string) => void;
  endCall: (followUpId: string, prescribeNotes?: string) => void;
  triggerEmergencyFlag: (followUpId: string, type: 'in_person' | 'emergency') => void;
  submitRating: (followUpId: string, rating: number) => void;
  uploadReport: (file: { name: string; size: number; type: string }) => Promise<MedicalRecord>;
  softDeleteRecord: (id: string) => void;
  restoreRecord: (id: string) => void;
  permanentlyDeleteRecord: (id: string) => void;
  submitGrievance: (category: string, description: string) => string;
  triggerQRScan: (doctorId: string, stale?: boolean) => void;
  logout: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Consent Categories
const DEFAULT_CONSENTS: ConsentRecord[] = [
  { id: 'record_storage', labelEn: 'Medical record storage & encryption in compliance with DPDP Act 2023', labelHi: 'चिकित्सीय रिकॉर्ड का सुरक्षित भंडारण और एन्क्रिप्शन (डीपीडीपी अधिनियम २०२३)', agreed: false, timestamp: '', withdrawn: false },
  { id: 'doctor_access', labelEn: 'Authorise medical record access by verified clinic doctors & receptionists', labelHi: 'सत्यापित क्लिनिक डॉक्टरों और रिसेप्शनिस्टों द्वारा रिकॉर्ड देखने की अनुमति', agreed: false, timestamp: '', withdrawn: false },
  { id: 'ai_processing', labelEn: 'Allow secure AI background processing of uploads for clinical report summaries', labelHi: 'रिपोर्ट सारांश के लिए अपलोड किए गए दस्तावेजों के सुरक्षित एआई प्रोसेसिंग की सहमति', agreed: false, timestamp: '', withdrawn: false },
  { id: 'consultation_storage', labelEn: 'Secure consultation metadata and prescriptions storage (Sessions are never audio/video recorded)', labelHi: 'परामर्श मेटाडेटा और नुस्खे का सुरक्षित भंडारण (परामर्श को कभी भी रिकॉर्ड नहीं किया जाता है)', agreed: false, timestamp: '', withdrawn: false },
  { id: 'terms_of_service', labelEn: 'Accept Follow-up Platform Terms of Service and legal treatment framework', labelHi: 'फॉलो-अप प्लेटफ़ॉर्म की सेवा की शर्तों और कानूनी ढांचे को स्वीकार करें', agreed: false, timestamp: '', withdrawn: false },
  { id: 'privacy_policy', labelEn: 'Accept Privacy Policy regarding zero-sharing of clinical data with third-parties', labelHi: 'डेटा प्राइवेसी नीति स्वीकार करें (तीसरे पक्षों के साथ कोई नैदानिक डेटा साझा नहीं किया जाएगा)', agreed: false, timestamp: '', withdrawn: false },
  { id: 'notifications', labelEn: 'Receive neutral, specialty-free follow-up alerts via WhatsApp notifications', labelHi: 'व्हाट्सएप के माध्यम से तटस्थ और गोपनीयता-अनुकूल फॉलो-अप सूचनाएं प्राप्त करें', agreed: false, timestamp: '', withdrawn: false },
  { id: 'continuity_of_care', labelEn: 'Consent to share follow-up medical timeline securely with your chosen doctor', labelHi: 'अपने चुने हुए डॉक्टर के साथ फॉलो-अप इतिहास सुरक्षित रूप से साझा करने की सहमति', agreed: false, timestamp: '', withdrawn: false },
  { id: 'withdrawal_notice', labelEn: 'Acknowledge that consent can be withdrawn at any time in Profile Settings', labelHi: 'यह स्वीकार करें कि प्रोफाइल सेटिंग्स में किसी भी समय सहमति वापस ली जा सकती है', agreed: false, timestamp: '', withdrawn: false }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [grievances, setGrievances] = useState<GrievanceTicket[]>([]);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [qrSimulationDoctorId, setQrSimulationDoctorId] = useState<string | null>(null);
  const [qrSimulationStale, setQrSimulationStale] = useState<boolean>(false);
  const [patientWalletBalance, setPatientWalletBalance] = useState<number>(200); // starts with ₹200 to trigger insufficient balance dialog
  const [patientWalletHeld, setPatientWalletHeld] = useState<number>(0);

  // Initialize and load from LocalStorage (Mocking Firestore Database)
  useEffect(() => {
    const storedPatient = localStorage.getItem('care_patient');
    const storedDoctors = localStorage.getItem('care_doctors');
    const storedFollowUps = localStorage.getItem('care_followups');
    const storedLedger = localStorage.getItem('care_ledger');
    const storedRecords = localStorage.getItem('care_records');
    const storedPrescriptions = localStorage.getItem('care_prescriptions');
    const storedGrievances = localStorage.getItem('care_grievances');
    const storedWalletBal = localStorage.getItem('care_wallet_bal');
    const storedWalletHeld = localStorage.getItem('care_wallet_held');
    const storedLanguage = localStorage.getItem('care_language');

    if (storedPatient) setCurrentPatient(JSON.parse(storedPatient));
    if (storedLanguage) setLanguage(storedLanguage as 'en' | 'hi');
    if (storedWalletBal) setPatientWalletBalance(Number(storedWalletBal));
    if (storedWalletHeld) setPatientWalletHeld(Number(storedWalletHeld));

    // Seed Initial Doctors list if not found
    if (storedDoctors) {
      setDoctors(JSON.parse(storedDoctors));
    } else {
      const today = new Date();
      
      const generateSlots = (daysAhead: number) => {
        const slots: string[] = [];
        for (let i = 0; i <= daysAhead; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);
          // morning slot
          date.setHours(10, 0, 0, 0);
          slots.push(date.toISOString());
          // midday slot
          const date2 = new Date(date);
          date2.setHours(14, 30, 0, 0);
          slots.push(date2.toISOString());
          // evening slot
          const date3 = new Date(date);
          date3.setHours(17, 0, 0, 0);
          slots.push(date3.toISOString());
        }
        return slots;
      };

      const seedDoctors: Doctor[] = [
        {
          id: 'doc_amit_sharma',
          name: 'Dr. Amit Sharma',
          photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256&q=80',
          specialty: 'Psychiatry',
          clinicName: 'Patna Neuropsychiatry & De-Addiction Center',
          regNumber: 'BMC-48291',
          medicalCouncil: 'Bihar Medical Council',
          consultationFee: 500,
          followUpFee: 300,
          availableSlots: generateSlots(5),
          hasPriorVisit: true,
          lastVisitDate: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString() // 30 days ago
        },
        {
          id: 'doc_priya_verma',
          name: 'Dr. Priya Verma',
          photo: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=256&h=256&q=80',
          specialty: 'Neurology',
          clinicName: 'Apex Brain & Nerve Clinic',
          regNumber: 'BMC-61582',
          medicalCouncil: 'Bihar Medical Council',
          consultationFee: 600,
          followUpFee: 400,
          availableSlots: generateSlots(4),
          hasPriorVisit: true,
          lastVisitDate: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString() // 45 days ago
        },
        {
          id: 'doc_sameer_khan',
          name: 'Dr. Sameer Khan',
          photo: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256&q=80',
          specialty: 'Sexology',
          clinicName: 'Wellness Sexual Health Centre',
          regNumber: 'DMC-91402',
          medicalCouncil: 'Delhi Medical Council',
          consultationFee: 700,
          followUpFee: 500,
          availableSlots: generateSlots(3),
          hasPriorVisit: true,
          lastVisitDate: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString() // 15 days ago
        },
        {
          id: 'doc_rakesh_ranjan',
          name: 'Dr. Rakesh Ranjan',
          photo: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=256&h=256&q=80',
          specialty: 'Psychiatry',
          clinicName: 'Pataliputra Mental Health Care',
          regNumber: 'MCI-35914',
          medicalCouncil: 'Medical Council of India',
          consultationFee: 500,
          followUpFee: 300,
          availableSlots: generateSlots(5),
          hasPriorVisit: false // INELIGIBLE GATING demo
        },
        {
          id: 'doc_anil_mehta',
          name: 'Dr. Anil Mehta',
          photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256&q=80',
          specialty: 'Neurology',
          clinicName: 'Mehta Brain & Spine Centre',
          regNumber: 'BMC-28491',
          medicalCouncil: 'Bihar Medical Council',
          consultationFee: 800,
          followUpFee: 500,
          availableSlots: generateSlots(2),
          hasPriorVisit: true,
          lastVisitDate: new Date(Date.now() - 400 * 24 * 3600 * 1000).toISOString() // 400 days ago (eligibility expired!)
        },
        {
          id: 'doc_sunita_rao',
          name: 'Dr. Sunita Rao',
          photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
          specialty: 'Psychiatry',
          clinicName: 'Dr. Rao Clinic for Cognitive Care',
          regNumber: 'KMC-73821',
          medicalCouncil: 'Karnataka Medical Council',
          consultationFee: 500,
          followUpFee: 300,
          availableSlots: generateSlots(3),
          hasPriorVisit: true,
          lastVisitDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString() // 10 days ago
        }
      ];
      setDoctors(seedDoctors);
      localStorage.setItem('care_doctors', JSON.stringify(seedDoctors));
    }

    // Seed bookings and records
    if (storedFollowUps) setFollowUps(JSON.parse(storedFollowUps));
    if (storedLedger) {
      setLedger(JSON.parse(storedLedger));
    } else {
      // Seed initial ledger entries (Top-up when opening)
      const seedLedger: LedgerEntry[] = [
        {
          id: 'led_init_topup',
          type: 'Top-up',
          amount: 200,
          timestamp: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
          descriptionEn: 'Initial wallet balance top-up',
          labelEn: 'Top-up Received',
          labelHi: 'वॉलेट टॉप-अप प्राप्त हुआ'
        }
      ];
      setLedger(seedLedger);
      localStorage.setItem('care_ledger', JSON.stringify(seedLedger));
    }

    if (storedRecords) {
      setRecords(JSON.parse(storedRecords));
    } else {
      // Seed pre-existing medical records
      const seedRecords: MedicalRecord[] = [
        {
          id: 'rec_prior_mri',
          name: 'Brain_MRI_Scans_PatnaPath.pdf',
          type: 'pdf',
          size: 4851020,
          uploadedAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
          status: 'completed',
          aiSummary: 'Clinical findings note mild ventriculomegaly consistent with age. No evidence of acute infarction, hemorrhage, or mass effect. Mild chronic microvascular ischemic changes noted.',
          isDeleted: false
        },
        {
          id: 'rec_cbc_test',
          name: 'CBC_Report_July_2026.png',
          type: 'png',
          size: 1540320,
          uploadedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
          status: 'completed',
          aiSummary: 'Complete Blood Count within physiological reference limits. Hemoglobin: 14.2 g/dL, WBC: 7,200 /uL, Platelets: 240,000 /uL. No flags generated.',
          isDeleted: false
        }
      ];
      setRecords(seedRecords);
      localStorage.setItem('care_records', JSON.stringify(seedRecords));
    }

    if (storedPrescriptions) {
      setPrescriptions(JSON.parse(storedPrescriptions));
    } else {
      // Seed pre-existing prescription (previous version)
      const seedPrescriptions: Prescription[] = [
        {
          id: 'rx_prev_sharma',
          appointmentId: 'appt_prior_dummy',
          doctorId: 'doc_amit_sharma',
          doctorName: 'Dr. Amit Sharma',
          doctorRegNumber: 'BMC-48291',
          date: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
          diagnosis: 'Generalized Anxiety Disorder (GAD) - Mild Symptoms',
          medicines: [
            {
              name: 'Sertraline 50mg',
              dosage: '1 tablet once daily',
              duration: '30 days',
              instructions: 'Take in the morning after breakfast'
            },
            {
              name: 'Clonazepam 0.25mg',
              dosage: '1 tablet at bedtime',
              duration: '10 days',
              instructions: 'Take strictly at night if anxious'
            }
          ],
          notes: 'Patient advised daily diaphragmatic breathing exercises for 15 minutes. Avoid excessive screen usage before bedtime. Return for follow-up in 4 weeks.',
          version: 1
        }
      ];
      setPrescriptions(seedPrescriptions);
      localStorage.setItem('care_prescriptions', JSON.stringify(seedPrescriptions));
    }

    if (storedGrievances) setGrievances(JSON.parse(storedGrievances));
  }, []);

  // Save changes to localStorage helper
  const saveToLocal = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const registerPatient = (name: string, mobile: string, dob: string, consents: ConsentRecord[]) => {
    const newPatient: Patient = {
      id: 'pat_' + Math.random().toString(36).substr(2, 9),
      name,
      mobile,
      dob,
      onboardedAt: new Date().toISOString(),
      consents
    };
    setCurrentPatient(newPatient);
    saveToLocal('care_patient', newPatient);

    // If there is an active QR code session, book them or route them to booking
    if (qrSimulationDoctorId) {
      // Land directly on QR scanner profile
    }

    // Add a pre-scheduled Doctor-Initiated Follow-up (E3) to showcase the Doctor-Scheduled confirmation flow!
    const doctorRao = doctors.find(d => d.id === 'doc_sunita_rao') || {
      id: 'doc_sunita_rao',
      name: 'Dr. Sunita Rao',
      photo: '',
      clinicName: 'Dr. Rao Clinic for Cognitive Care',
      regNumber: 'KMC-73821',
      doctorSpecialty: 'Psychiatry'
    };

    const docScheduledTime = new Date();
    docScheduledTime.setDate(docScheduledTime.getDate() + 1); // tomorrow
    docScheduledTime.setHours(11, 0, 0, 0);

    const docScheduled: FollowUp = {
      id: 'appt_doc_scheduled_demo',
      doctorId: 'doc_sunita_rao',
      doctorName: 'Dr. Sunita Rao',
      doctorPhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256&q=80',
      doctorRegNumber: 'KMC-73821',
      doctorSpecialty: 'Psychiatry',
      clinicName: 'Dr. Rao Clinic for Cognitive Care',
      slot: docScheduledTime.toISOString(),
      status: 'needs_consent', // Doctor scheduled, needs patient confirmation (E3)
      reschedulesCount: 0,
      holdAmount: 330, // 300 followUpFee + 10% Platform fee (30)
      doctorFee: 300,
      platformFee: 30,
      reportIds: [],
      createdAt: new Date().toISOString(),
      whatsappRemindersSent: []
    };

    const updatedFollowUps = [docScheduled];
    setFollowUps(updatedFollowUps);
    saveToLocal('care_followups', updatedFollowUps);
  };

  const updatePatientProfile = (name: string, mobile: string) => {
    if (!currentPatient) return;
    const updated = { ...currentPatient, name, mobile };
    setCurrentPatient(updated);
    saveToLocal('care_patient', updated);
  };

  const updateConsent = (consentId: string, agreed: boolean) => {
    if (!currentPatient) return;
    const updatedConsents = currentPatient.consents.map(c => 
      c.id === consentId ? { ...c, agreed, timestamp: new Date().toISOString() } : c
    );
    const updated = { ...currentPatient, consents: updatedConsents };
    setCurrentPatient(updated);
    saveToLocal('care_patient', updated);
  };

  const addWalletFunds = (amount: number) => {
    const newBal = patientWalletBalance + amount;
    setPatientWalletBalance(newBal);
    localStorage.setItem('care_wallet_bal', String(newBal));

    const newEntry: LedgerEntry = {
      id: 'led_topup_' + Math.random().toString(36).substr(2, 9),
      type: 'Top-up',
      amount,
      timestamp: new Date().toISOString(),
      descriptionEn: `Loaded money into platform wallet`,
      labelEn: 'Top-up Completed',
      labelHi: 'वॉलेट टॉप-अप सफल'
    };

    const updatedLedger = [newEntry, ...ledger];
    setLedger(updatedLedger);
    saveToLocal('care_ledger', updatedLedger);
  };

  const bookFollowUp = (doctorId: string, slot: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) return { success: false, error: 'Doctor not found' };

    // Eligibility validation check (Gating)
    if (!doctor.hasPriorVisit) {
      return { 
        success: false, 
        error: `ELIGIBILITY_BLOCK_NEW` 
      };
    }

    // Eligibility expiry checking (e.g. 6 months for Psychiatry, 12 months for others)
    if (doctor.lastVisitDate) {
      const lastVisit = new Date(doctor.lastVisitDate);
      const monthsDiff = (new Date().getTime() - lastVisit.getTime()) / (1000 * 3600 * 24 * 30);
      const limit = doctor.specialty === 'Psychiatry' ? 6 : 12;

      if (monthsDiff > limit) {
        return {
          success: false,
          error: `ELIGIBILITY_BLOCK_EXPIRED`
        };
      }
    }

    // Calculate fees (doctor follow-up fee + 10% Platform fee)
    const doctorFee = doctor.followUpFee;
    const platformFee = Math.round(doctorFee * 0.10);
    const totalFee = doctorFee + platformFee;

    // Wallet hold-placement balance validation (PAY-1)
    if (patientWalletBalance < totalFee) {
      return {
        success: false,
        error: 'INSUFFICIENT_BALANCE',
      };
    }

    // Deduct from available, add to held
    const newBal = patientWalletBalance - totalFee;
    const newHeld = patientWalletHeld + totalFee;
    setPatientWalletBalance(newBal);
    setPatientWalletHeld(newHeld);
    localStorage.setItem('care_wallet_bal', String(newBal));
    localStorage.setItem('care_wallet_held', String(newHeld));

    const apptId = 'appt_' + Math.random().toString(36).substr(2, 9);

    const newFollowUp: FollowUp = {
      id: apptId,
      doctorId,
      doctorName: doctor.name,
      doctorPhoto: doctor.photo,
      doctorRegNumber: doctor.regNumber,
      doctorSpecialty: doctor.specialty,
      clinicName: doctor.clinicName,
      slot,
      status: 'upcoming',
      reschedulesCount: 0,
      holdAmount: totalFee,
      doctorFee,
      platformFee,
      reportIds: [],
      createdAt: new Date().toISOString(),
      whatsappRemindersSent: ['booked'] // sent immediately on booking
    };

    // Ledger record of hold (PAY-5)
    const ledgerEntry: LedgerEntry = {
      id: 'led_hold_' + Math.random().toString(36).substr(2, 9),
      type: 'Hold',
      amount: totalFee,
      relatedAppointmentId: apptId,
      doctorName: doctor.name,
      timestamp: new Date().toISOString(),
      descriptionEn: `Reserved for follow-up with ${doctor.name} (Hold placed)`,
      labelEn: 'Payment Hold',
      labelHi: 'भुगतान आरक्षित (होल्ड)'
    };

    const updatedFollowUps = [newFollowUp, ...followUps];
    setFollowUps(updatedFollowUps);
    saveToLocal('care_followups', updatedFollowUps);

    const updatedLedger = [ledgerEntry, ...ledger];
    setLedger(updatedLedger);
    saveToLocal('care_ledger', updatedLedger);

    return { success: true };
  };

  const confirmDoctorScheduledFollowUp = (followUpId: string) => {
    const appt = followUps.find(f => f.id === followUpId);
    if (!appt) return;

    // Check balance
    const totalFee = appt.holdAmount;
    if (patientWalletBalance < totalFee) {
      // Normally handles insufficient balance
      alert(`Insufficient balance. Please top up ₹${totalFee - patientWalletBalance} first.`);
      return;
    }

    // Place wallet hold
    const newBal = patientWalletBalance - totalFee;
    const newHeld = patientWalletHeld + totalFee;
    setPatientWalletBalance(newBal);
    setPatientWalletHeld(newHeld);
    localStorage.setItem('care_wallet_bal', String(newBal));
    localStorage.setItem('care_wallet_held', String(newHeld));

    const ledgerEntry: LedgerEntry = {
      id: 'led_hold_' + Math.random().toString(36).substr(2, 9),
      type: 'Hold',
      amount: totalFee,
      relatedAppointmentId: followUpId,
      doctorName: appt.doctorName,
      timestamp: new Date().toISOString(),
      descriptionEn: `Reserved for follow-up with ${appt.doctorName} (Consent recorded)`,
      labelEn: 'Payment Hold (E3 Confirm)',
      labelHi: 'भुगतान आरक्षित (सहमति दर्ज)'
    };

    const updated = followUps.map(f => 
      f.id === followUpId ? { ...f, status: 'upcoming' as FollowUpStatus, whatsappRemindersSent: ['booked'] } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);

    const updatedLedger = [ledgerEntry, ...ledger];
    setLedger(updatedLedger);
    saveToLocal('care_ledger', updatedLedger);
  };

  const rescheduleFollowUp = (followUpId: string, newSlot: string) => {
    const appt = followUps.find(f => f.id === followUpId);
    if (!appt) return { success: false, error: 'Appointment not found' };

    if (appt.reschedulesCount >= 2) {
      return { success: false, error: 'MAX_RESCHEDULES_REACHED' };
    }

    const updated = followUps.map(f => 
      f.id === followUpId ? { 
        ...f, 
        slot: newSlot, 
        reschedulesCount: f.reschedulesCount + 1,
        whatsappRemindersSent: ['booked'] // reset reminder triggers for the new slot
      } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);

    return { success: true };
  };

  const cancelFollowUp = (followUpId: string) => {
    const appt = followUps.find(f => f.id === followUpId);
    if (!appt) return;

    // Releases hold amount in full (CNR-1)
    const releaseAmount = appt.holdAmount;
    const newBal = patientWalletBalance + releaseAmount;
    const newHeld = Math.max(0, patientWalletHeld - releaseAmount);
    setPatientWalletBalance(newBal);
    setPatientWalletHeld(newHeld);
    localStorage.setItem('care_wallet_bal', String(newBal));
    localStorage.setItem('care_wallet_held', String(newHeld));

    const ledgerEntry: LedgerEntry = {
      id: 'led_release_' + Math.random().toString(36).substr(2, 9),
      type: 'Release',
      amount: releaseAmount,
      relatedAppointmentId: followUpId,
      doctorName: appt.doctorName,
      timestamp: new Date().toISOString(),
      descriptionEn: `Hold released in full after follow-up cancellation`,
      labelEn: 'Hold Released',
      labelHi: 'आरक्षित राशि जारी (रिफंड)'
    };

    const updated = followUps.map(f => 
      f.id === followUpId ? { ...f, status: 'cancelled' as FollowUpStatus } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);

    const updatedLedger = [ledgerEntry, ...ledger];
    setLedger(updatedLedger);
    saveToLocal('care_ledger', updatedLedger);
  };

  const joinWaitingRoom = (followUpId: string) => {
    const updated = followUps.map(f => 
      f.id === followUpId ? { ...f, status: 'waiting_room' as FollowUpStatus } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);
  };

  const joinCall = (followUpId: string) => {
    // Patient joins
    const updated = followUps.map(f => 
      f.id === followUpId ? { ...f, status: 'active' as FollowUpStatus } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);
  };

  const simulateDoctorJoin = (followUpId: string) => {
    const appt = followUps.find(f => f.id === followUpId);
    if (!appt) return;

    // Both joined -> trigger hold deduction (PAY-3)
    const totalFee = appt.holdAmount;
    const newHeld = Math.max(0, patientWalletHeld - totalFee);
    setPatientWalletHeld(newHeld);
    localStorage.setItem('care_wallet_held', String(newHeld));

    const ledgerEntry: LedgerEntry = {
      id: 'led_deduction_' + Math.random().toString(36).substr(2, 9),
      type: 'Deduction',
      amount: totalFee,
      relatedAppointmentId: followUpId,
      doctorName: appt.doctorName,
      timestamp: new Date().toISOString(),
      descriptionEn: `Consultation started — payment completed. Doctor credited ₹${appt.doctorFee}.`,
      labelEn: 'Payment Completed',
      labelHi: 'भुगतान सफल'
    };

    const updated = followUps.map(f => 
      f.id === followUpId ? { ...f, status: 'active' as FollowUpStatus } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);

    const updatedLedger = [ledgerEntry, ...ledger];
    setLedger(updatedLedger);
    saveToLocal('care_ledger', updatedLedger);
  };

  const simulateDoctorNoShow = (followUpId: string) => {
    const appt = followUps.find(f => f.id === followUpId);
    if (!appt) return;

    // Hold released in full (CNR-5)
    const releaseAmount = appt.holdAmount;
    const newBal = patientWalletBalance + releaseAmount;
    const newHeld = Math.max(0, patientWalletHeld - releaseAmount);
    setPatientWalletBalance(newBal);
    setPatientWalletHeld(newHeld);
    localStorage.setItem('care_wallet_bal', String(newBal));
    localStorage.setItem('care_wallet_held', String(newHeld));

    const ledgerEntry: LedgerEntry = {
      id: 'led_release_doctor_noshow_' + Math.random().toString(36).substr(2, 9),
      type: 'Release',
      amount: releaseAmount,
      relatedAppointmentId: followUpId,
      doctorName: appt.doctorName,
      timestamp: new Date().toISOString(),
      descriptionEn: `Full refund (Doctor No-Show grace period expired)`,
      labelEn: 'Refund (Doctor No-Show)',
      labelHi: 'डॉक्टर अनुपस्थित (रिफंड)'
    };

    const updated = followUps.map(f => 
      f.id === followUpId ? { ...f, status: 'doctor_no_show' as FollowUpStatus } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);

    const updatedLedger = [ledgerEntry, ...ledger];
    setLedger(updatedLedger);
    saveToLocal('care_ledger', updatedLedger);
  };

  const simulatePatientNoShow = (followUpId: string) => {
    const appt = followUps.find(f => f.id === followUpId);
    if (!appt) return;

    // Patient no-show: 50% of doctor fee is deducted, platform convenience fee waived (CNR-7)
    const platformFeeWaived = appt.platformFee;
    const doctorFine = Math.round(appt.doctorFee * 0.50);
    const deduction = doctorFine; // total fine
    const refund = appt.holdAmount - deduction; // rest is refunded to patient wallet

    const newBal = patientWalletBalance + refund;
    const newHeld = Math.max(0, patientWalletHeld - appt.holdAmount);
    setPatientWalletBalance(newBal);
    setPatientWalletHeld(newHeld);
    localStorage.setItem('care_wallet_bal', String(newBal));
    localStorage.setItem('care_wallet_held', String(newHeld));

    const ledgerDeductionEntry: LedgerEntry = {
      id: 'led_noshow_deduct_' + Math.random().toString(36).substr(2, 9),
      type: 'Deduction',
      amount: deduction,
      relatedAppointmentId: followUpId,
      doctorName: appt.doctorName,
      timestamp: new Date().toISOString(),
      descriptionEn: `50% doctor compensation fee deducted for patient no-show.`,
      labelEn: 'No-Show Fee Charged',
      labelHi: 'अनुपस्थिति शुल्क लागू'
    };

    const ledgerRefundEntry: LedgerEntry = {
      id: 'led_noshow_refund_' + Math.random().toString(36).substr(2, 9),
      type: 'Release',
      amount: refund,
      relatedAppointmentId: followUpId,
      doctorName: appt.doctorName,
      timestamp: new Date().toISOString(),
      descriptionEn: `Remaining balance released back to wallet (Platform fee waived).`,
      labelEn: 'Hold Released (No-Show)',
      labelHi: 'शेष राशि वापस'
    };

    const updated = followUps.map(f => 
      f.id === followUpId ? { ...f, status: 'patient_no_show' as FollowUpStatus } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);

    const updatedLedger = [ledgerRefundEntry, ledgerDeductionEntry, ...ledger];
    setLedger(updatedLedger);
    saveToLocal('care_ledger', updatedLedger);
  };

  const endCall = (followUpId: string, prescribeNotes?: string) => {
    const appt = followUps.find(f => f.id === followUpId);
    if (!appt) return;

    // Create prescription if notes or prescription simulated
    const rxId = 'rx_' + Math.random().toString(36).substr(2, 9);
    const newRx: Prescription = {
      id: rxId,
      appointmentId: followUpId,
      doctorId: appt.doctorId,
      doctorName: appt.doctorName,
      doctorRegNumber: appt.doctorRegNumber,
      date: new Date().toISOString(),
      diagnosis: appt.doctorSpecialty === 'Psychiatry' ? 'Generalized Anxiety Disorder (GAD) — Improving' : 'Routine Clinical Review',
      medicines: [
        {
          name: 'Sertraline 50mg',
          dosage: '1 tablet once daily',
          duration: '30 days',
          instructions: 'Take in the morning after breakfast (Continuation)'
        }
      ],
      notes: prescribeNotes || 'Continue current therapy line. Daily breathing protocols recommended. Rebook after 30 days if symptoms flare.',
      version: 2,
      signature: 'Dr. Signed Digital Certificate'
    };

    const updatedPrescriptions = [newRx, ...prescriptions];
    setPrescriptions(updatedPrescriptions);
    saveToLocal('care_prescriptions', updatedPrescriptions);

    const updated = followUps.map(f => 
      f.id === followUpId ? { ...f, status: 'completed' as FollowUpStatus, prescriptionId: rxId } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);
  };

  const triggerEmergencyFlag = (followUpId: string, type: 'in_person' | 'emergency') => {
    // If flagged as emergency/in-person, doctor redirects patient immediately (SB-3)
    const updated = followUps.map(f => 
      f.id === followUpId ? { 
        ...f, 
        emergencyFlagged: true, 
        emergencyNoticeType: type 
      } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);
  };

  const submitRating = (followUpId: string, rating: number) => {
    const updated = followUps.map(f => 
      f.id === followUpId ? { ...f, rating } : f
    );
    setFollowUps(updated);
    saveToLocal('care_followups', updated);
  };

  const uploadReport = (file: { name: string; size: number; type: string }) => {
    return new Promise<MedicalRecord>((resolve, reject) => {
      // Supported file check
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const allowedExts = ['pdf', 'jpg', 'png', 'jpeg'];
      
      if (!allowedExts.includes(ext)) {
        reject(new Error('Only PDF, JPG, PNG accepted'));
        return;
      }

      // Max 10MB check
      if (file.size > 10 * 1024 * 1024) {
        reject(new Error('Max file size 10 MB exceeded'));
        return;
      }

      const recordId = 'rec_' + Math.random().toString(36).substr(2, 9);
      const newRec: MedicalRecord = {
        id: recordId,
        name: file.name,
        type: (ext === 'pdf' ? 'pdf' : (ext === 'png' ? 'png' : 'jpg')) as 'pdf' | 'jpg' | 'png',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'processing',
        isDeleted: false
      };

      // Add to state and save
      const updated = [newRec, ...records];
      setRecords(updated);
      saveToLocal('care_records', updated);

      // Simulate background OCR/AI Summary processing (AI-1, AI-3)
      setTimeout(() => {
        setRecords(prev => {
          const updatedWithAI = prev.map(r => {
            if (r.id === recordId) {
              return {
                ...r,
                status: 'completed' as const,
                aiSummary: `AI-generated report abstract extracted from ${file.name}: Blood hematology parameters show standard metabolic values. Iron levels trace slightly below median. Re-evaluation advised upon subsequent clinical appointment.`
              };
            }
            return r;
          });
          saveToLocal('care_records', updatedWithAI);
          return updatedWithAI;
        });
      }, 3000);

      resolve(newRec);
    });
  };

  const softDeleteRecord = (id: string) => {
    // 30 days recycle bin tracking (MR-4)
    const updated = records.map(r => 
      r.id === id ? { ...r, isDeleted: true, deletedAt: new Date().toISOString() } : r
    );
    setRecords(updated);
    saveToLocal('care_records', updated);
  };

  const restoreRecord = (id: string) => {
    const updated = records.map(r => 
      r.id === id ? { ...r, isDeleted: false, deletedAt: undefined } : r
    );
    setRecords(updated);
    saveToLocal('care_records', updated);
  };

  const permanentlyDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveToLocal('care_records', updated);
  };

  const submitGrievance = (category: string, description: string) => {
    const ticketNo = 'TKT-' + Math.floor(100000 + Math.random() * 900000);
    const newTicket: GrievanceTicket = {
      ticketNumber: ticketNo,
      category,
      description,
      status: 'Open',
      createdAt: new Date().toISOString()
    };
    const updated = [newTicket, ...grievances];
    setGrievances(updated);
    saveToLocal('care_grievances', updated);
    return ticketNo;
  };

  const triggerQRScan = (doctorId: string, stale = false) => {
    setQrSimulationDoctorId(doctorId);
    setQrSimulationStale(stale);
  };

  const logout = () => {
    setCurrentPatient(null);
    localStorage.removeItem('care_patient');
  };

  const resetAllData = () => {
    localStorage.clear();
    setCurrentPatient(null);
    setFollowUps([]);
    setGrievances([]);
    setPatientWalletBalance(200);
    setPatientWalletHeld(0);
    // Reload page to re-seed default records
    window.location.reload();
  };

  return (
    <AppContext.Provider value={{
      currentPatient,
      doctors,
      followUps,
      ledger,
      records,
      prescriptions,
      grievances,
      language,
      onboardingStep,
      qrSimulationDoctorId,
      qrSimulationStale,
      setLanguage: (lang) => {
        setLanguage(lang);
        localStorage.setItem('care_language', lang);
      },
      registerPatient,
      updatePatientProfile,
      updateConsent,
      addWalletFunds,
      bookFollowUp,
      confirmDoctorScheduledFollowUp,
      rescheduleFollowUp,
      cancelFollowUp,
      joinWaitingRoom,
      joinCall,
      simulateDoctorJoin,
      simulateDoctorNoShow,
      simulatePatientNoShow,
      endCall,
      triggerEmergencyFlag,
      submitRating,
      uploadReport,
      softDeleteRecord,
      restoreRecord,
      permanentlyDeleteRecord,
      submitGrievance,
      triggerQRScan,
      logout,
      resetAllData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
