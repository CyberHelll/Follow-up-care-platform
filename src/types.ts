/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  id: string;
  name: string;
  mobile: string;
  dob: string;
  onboardedAt: string;
  consents: ConsentRecord[];
}

export interface ConsentRecord {
  id: string; // matches consent category
  labelEn: string;
  labelHi: string;
  agreed: boolean;
  timestamp: string;
  withdrawn: boolean;
}

export type Specialty = 'Psychiatry' | 'Neurology' | 'Sexology';

export interface Doctor {
  id: string;
  name: string;
  photo: string;
  specialty: Specialty;
  clinicName: string;
  regNumber: string;
  medicalCouncil: string;
  consultationFee: number; // e.g. 500
  followUpFee: number; // e.g. 300
  availableSlots: string[]; // ISO string slots
  hasPriorVisit: boolean; // Eligibility tracker
  lastVisitDate?: string; // Eligibility tracker date
}

export type FollowUpStatus =
  | 'needs_consent'       // Doctor scheduled, patient needs to confirm
  | 'upcoming'            // Confirmed, hold placed
  | 'waiting_room'        // Waiting room portal active (10m before)
  | 'active'              // Currently in consultation (both joined)
  | 'completed'           // Consultation completed successfully
  | 'cancelled'           // Cancelled before start
  | 'patient_no_show'     // Patient didn't join within grace period
  | 'doctor_no_show';     // Doctor didn't join within grace period

export interface FollowUp {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorPhoto: string;
  doctorRegNumber: string;
  doctorSpecialty: Specialty;
  clinicName: string;
  slot: string; // ISO string
  status: FollowUpStatus;
  reschedulesCount: number; // Max 2
  holdAmount: number; // Consultation fee + 10%
  doctorFee: number;
  platformFee: number;
  reportIds: string[]; // Uploaded medical reports
  prescriptionId?: string; // Link to prescription
  rating?: number; // 1-5 stars
  whatsappRemindersSent: string[]; // 'booked', '48h', '24h', '10m'
  emergencyFlagged?: boolean; // Doctor marked as emergency/in-person
  emergencyNoticeType?: 'in_person' | 'emergency';
  createdAt: string;
}

export type LedgerEntryType = 'Top-up' | 'Hold' | 'Release' | 'Deduction';

export interface LedgerEntry {
  id: string;
  type: LedgerEntryType;
  amount: number;
  relatedAppointmentId?: string;
  doctorName?: string;
  timestamp: string;
  descriptionEn: string;
  labelEn: string;
  labelHi: string;
}

export interface MedicalRecord {
  id: string;
  name: string;
  type: 'pdf' | 'jpg' | 'png';
  size: number; // in bytes
  uploadedAt: string;
  status: 'processing' | 'completed' | 'failed';
  aiSummary?: string;
  isDeleted: boolean; // Soft delete Recycle Bin
  deletedAt?: string; // Soft delete timestamp
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorRegNumber: string;
  date: string;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    duration: string;
    instructions: string;
  }[];
  notes: string;
  version: number;
  signature?: string;
  history?: PrescriptionVersionHistory[];
}

export interface PrescriptionVersionHistory {
  version: number;
  date: string;
  medicinesCount: number;
  notes: string;
}

export interface GrievanceTicket {
  ticketNumber: string;
  category: string;
  description: string;
  status: 'Open' | 'Resolved';
  createdAt: string;
}
