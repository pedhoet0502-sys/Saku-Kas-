/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum IuranCategory {
  BULANAN = "BULANAN",
  SAMPAH = "SAMPAH",
  KEMATIAN = "KEMATIAN",
  SOSIAL = "SOSIAL"
}

export interface IuranConfig {
  id: IuranCategory;
  name: string;
  amount: number;
  description: string;
  icon: string;
  color: string;
}

export interface Kelompok {
  id: string; // e.g. "dw-01"
  name: string; // e.g. "Kelompok Dasawisma Anggrek"
  officerName: string; // Name of Petugas
  officerPhone: string;
  specialOfficerName?: string; // Petugas Khusus Bulanan & Sampah
  specialOfficerPhone?: string;
}

export interface Warga {
  id: string;
  name: string;
  noHouse: string;
  address: string;
  kelompokId: string;
  phone: string;
}

export interface Payment {
  id: string;
  wargaId: string;
  wargaName: string;
  kelompokId: string;
  month: string; // e.g. "Januari", "Februari"
  year: number;  // 2026
  timestamp: string; // ISO date string
  iuranDetails: {
    category: IuranCategory;
    amount: number;
  }[];
  totalAmount: number;
  officerName: string;
  statusSetoran: 'BELUM_DISETOR' | 'PENDING_PERSETUJUAN' | 'SUDAH_DISETOR';
  setoranId?: string;
}

export interface SetoranSubmission {
  id: string;
  kelompokId: string;
  officerName: string;
  amount: number;
  paymentIds: string[];
  timestamp: string;
  status: 'PENDING' | 'DISETUJUI';
  verificationTimestamp?: string;
}

export interface NotificationConfig {
  title: string;
  message: string;
  dueDate: string;
  daysBefore: number;
  lastSent?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  dueDate: string;
  daysBefore: number;
  timestamp: string;
  isRead?: boolean;
}

export interface TabOption {
  id: string;
  label: string;
  icon: string;
}
