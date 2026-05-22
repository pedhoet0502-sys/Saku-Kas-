/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IuranCategory, IuranConfig, Kelompok, Warga, Payment, SetoranSubmission } from "./types";

export const IURAN_CONFIGS: IuranConfig[] = [
  {
    id: IuranCategory.BULANAN,
    name: "Iuran Bulanan RT",
    amount: 10000,
    description: "Iuran wajib bulanan untuk operasional kegiatan RT.",
    icon: "Calendar",
    color: "emerald"
  },
  {
    id: IuranCategory.SAMPAH,
    name: "Iuran Kebersihan & Sampah",
    amount: 30000,
    description: "Biaya pengambilan sampah rumah tangga dan kebersihan lingkungan.",
    icon: "Trash2",
    color: "teal"
  },
  {
    id: IuranCategory.KEMATIAN,
    name: "Iuran Kematian",
    amount: 5000,
    description: "Dana santunan kematian untuk warga yang berduka cita.",
    icon: "HeartHandshake",
    color: "rose"
  },
  {
    id: IuranCategory.SOSIAL,
    name: "Iuran Sosial",
    amount: 5000,
    description: "Dana darurat sosial, kerja bakti, santunan sakit, dan kerukunan warga.",
    icon: "Users",
    color: "indigo"
  }
];

export const INITIAL_KELOMPOK: Kelompok[] = [
  {
    id: "dw-01",
    name: "ANYELIR 1",
    officerName: "Bu Eni Hartati",
    officerPhone: "0812-3456-7890",
    specialOfficerName: "Pak Heri Gunawan",
    specialOfficerPhone: "0812-1111-2222"
  },
  {
    id: "dw-02",
    name: "ANYELIR 2",
    officerName: "Bu Sri Wahyuni",
    officerPhone: "0856-9876-5432",
    specialOfficerName: "Pak Agus Wijaya",
    specialOfficerPhone: "0856-3333-4444"
  },
  {
    id: "dw-03",
    name: "ANYELIR 3",
    officerName: "Bu Titi Endang",
    officerPhone: "0819-2233-4455",
    specialOfficerName: "Pak Bambang Prasetio",
    specialOfficerPhone: "0819-5555-6666"
  },
  {
    id: "dw-04",
    name: "ANYELIR 4",
    officerName: "Bu Susi Susanti",
    officerPhone: "0812-9900-8811",
    specialOfficerName: "Pak Rudy Santoso",
    specialOfficerPhone: "0812-7777-8888"
  },
  {
    id: "dw-05",
    name: "ANYELIR 5",
    officerName: "Bu Megawati",
    officerPhone: "0813-8877-6655",
    specialOfficerName: "Pak Darto Mulyono",
    specialOfficerPhone: "0813-9999-0000"
  },
  {
    id: "dw-06",
    name: "ANYELIR 6",
    officerName: "Bu Kartini",
    officerPhone: "0811-2233-4455",
    specialOfficerName: "Pak Joko Susilo",
    specialOfficerPhone: "0811-4444-5555"
  },
  {
    id: "dw-07",
    name: "ANYELIR 7",
    officerName: "Bu Fatmawati",
    officerPhone: "0855-6677-8899",
    specialOfficerName: "Pak Triyono",
    specialOfficerPhone: "0855-8888-9999"
  }
];

export const INITIAL_WARGA: Warga[] = [
  // ANYELIR 1
  { id: "w-01", name: "Pak Budi Santoso", noHouse: "A-12", address: "Jl. Anyelir Raya No. 12", kelompokId: "dw-01", phone: "0811-1111-2222" },
  { id: "w-02", name: "Ibu Siti Aminah", noHouse: "A-14", address: "Jl. Anyelir Raya No. 14", kelompokId: "dw-01", phone: "0811-3333-4444" },
  { id: "w-03", name: "Pak Joko Suprianto", noHouse: "A-16", address: "Jl. Anyelir Barat No. 16", kelompokId: "dw-01", phone: "0812-5555-6666" },
  { id: "w-04", name: "Ibu Ratna Sari", noHouse: "A-20", address: "Jl. Anyelir Barat No. 20", kelompokId: "dw-01", phone: "0813-7777-8888" },
  { id: "w-05", name: "Pak Hendra Wijaya", noHouse: "A-22", address: "Jl. Anyelir Timur No. 22", kelompokId: "dw-01", phone: "0814-9999-0000" },

  // ANYELIR 2
  { id: "w-06", name: "Pak Bambang Pamungkas", noHouse: "M-03", address: "Jl. Anyelir Utama No. 03", kelompokId: "dw-02", phone: "0855-1234-5678" },
  { id: "w-07", name: "Ibu Ani Yudhoyono", noHouse: "M-05", address: "Jl. Anyelir Utama No. 05", kelompokId: "dw-02", phone: "0856-2345-6789" },
  { id: "w-08", name: "Pak Ahmad Fauzi", noHouse: "M-09", address: "Jl. Anyelir Gg. 2 No. 09", kelompokId: "dw-02", phone: "0857-3456-7890" },
  { id: "w-09", name: "Ibu Lilis Suryani", noHouse: "M-11", address: "Jl. Anyelir Gg. 2 No. 11", kelompokId: "dw-02", phone: "0858-4567-8901" },
  { id: "w-10", name: "Pak Agus Setiawan", noHouse: "M-15", address: "Jl. Anyelir Selatan No. 15", kelompokId: "dw-02", phone: "0859-5678-9012" },

  // ANYELIR 3
  { id: "w-11", name: "Pak Slamet Rahardjo", noHouse: "W-02", address: "Jl. Anyelir Gg. Sayur No. 02", kelompokId: "dw-03", phone: "0877-1111-2222" },
  { id: "w-12", name: "Ibu Megawati Soekarno", noHouse: "W-04", address: "Jl. Anyelir Merah No. 04", kelompokId: "dw-03", phone: "0878-3333-4444" },
  { id: "w-13", name: "Pak Prabowo Subianto", noHouse: "W-08", address: "Jl. Anyelir Putih No. 08", kelompokId: "dw-03", phone: "0879-5555-6666" },
  { id: "w-14", name: "Ibu Tri Rismaharini", noHouse: "W-10", address: "Jl. Anyelir Indah No. 10", kelompokId: "dw-03", phone: "0811-9988-7766" },
  { id: "w-15", name: "Pak Susilo Bambang", noHouse: "W-18", address: "Jl. Anyelir Raya No. 18", kelompokId: "dw-03", phone: "0812-7766-5544" },

  // ANYELIR 4
  { id: "w-16", name: "Pak Ganjar Pranowo", noHouse: "W-20", address: "Jl. Anyelir No. 20", kelompokId: "dw-04", phone: "0812-4455-6677" },
  // ANYELIR 5
  { id: "w-17", name: "Pak Anies Baswedan", noHouse: "W-22", address: "Jl. Anyelir No. 22", kelompokId: "dw-05", phone: "0812-5566-7788" },
  // ANYELIR 6
  { id: "w-18", name: "Pak Ridwan Kamil", noHouse: "W-24", address: "Jl. Anyelir No. 24", kelompokId: "dw-06", phone: "0812-6677-8899" },
  // ANYELIR 7
  { id: "w-19", name: "Ibu Khofifah Indar", noHouse: "W-26", address: "Jl. Anyelir No. 26", kelompokId: "dw-07", phone: "0812-7788-9900" }
];

export const MONTHS_LIST = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni", 
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Helper to create date strings for historical data
const getPastDateString = (day: number, monthOffset: number) => {
  const d = new Date();
  d.setMonth(d.getMonth() - monthOffset);
  d.setDate(day);
  return d.toISOString();
};

export const INITIAL_PAYMENTS: Payment[] = [
  // ANYELIR 1 - January (Fully Setor/Approved)
  {
    id: "p-01",
    wargaId: "w-01",
    wargaName: "Pak Budi Santoso",
    kelompokId: "dw-01",
    month: "Januari",
    year: 2026,
    timestamp: getPastDateString(10, 4),
    iuranDetails: [
      { category: IuranCategory.BULANAN, amount: 10000 },
      { category: IuranCategory.SAMPAH, amount: 30000 },
      { category: IuranCategory.KEMATIAN, amount: 5000 },
      { category: IuranCategory.SOSIAL, amount: 5000 }
    ],
    totalAmount: 50000,
    officerName: "Bu Eni Hartati",
    statusSetoran: "SUDAH_DISETOR",
    setoranId: "s-01"
  },
  {
    id: "p-02",
    wargaId: "w-02",
    wargaName: "Ibu Siti Aminah",
    kelompokId: "dw-01",
    month: "Januari",
    year: 2026,
    timestamp: getPastDateString(10, 4),
    iuranDetails: [
      { category: IuranCategory.BULANAN, amount: 10000 },
      { category: IuranCategory.SAMPAH, amount: 30000 },
      { category: IuranCategory.KEMATIAN, amount: 5000 },
      { category: IuranCategory.SOSIAL, amount: 5000 }
    ],
    totalAmount: 50000,
    officerName: "Bu Eni Hartati",
    statusSetoran: "SUDAH_DISETOR",
    setoranId: "s-01"
  },
  {
    id: "p-03",
    wargaId: "w-03",
    wargaName: "Pak Joko Suprianto",
    kelompokId: "dw-01",
    month: "Januari",
    year: 2026,
    timestamp: getPastDateString(11, 4),
    iuranDetails: [
      { category: IuranCategory.BULANAN, amount: 10000 },
      { category: IuranCategory.SAMPAH, amount: 30000 }
    ],
    totalAmount: 40000,
    officerName: "Bu Eni Hartati",
    statusSetoran: "SUDAH_DISETOR",
    setoranId: "s-01"
  },

  // ANYELIR 2 - January (Fully Setor/Approved)
  {
    id: "p-04",
    wargaId: "w-06",
    wargaName: "Pak Bambang Pamungkas",
    kelompokId: "dw-02",
    month: "Januari",
    year: 2026,
    timestamp: getPastDateString(8, 4),
    iuranDetails: [
      { category: IuranCategory.BULANAN, amount: 10000 },
      { category: IuranCategory.SAMPAH, amount: 30000 },
      { category: IuranCategory.KEMATIAN, amount: 5000 },
      { category: IuranCategory.SOSIAL, amount: 5000 }
    ],
    totalAmount: 50000,
    officerName: "Bu Sri Wahyuni",
    statusSetoran: "SUDAH_DISETOR",
    setoranId: "s-02"
  },
  {
    id: "p-05",
    wargaId: "w-07",
    wargaName: "Ibu Ani Yudhoyono",
    kelompokId: "dw-02",
    month: "Januari",
    year: 2026,
    timestamp: getPastDateString(9, 4),
    iuranDetails: [
      { category: IuranCategory.BULANAN, amount: 10000 },
      { category: IuranCategory.SAMPAH, amount: 30000 },
      { category: IuranCategory.KEMATIAN, amount: 5000 },
      { category: IuranCategory.SOSIAL, amount: 5000 }
    ],
    totalAmount: 50000,
    officerName: "Bu Sri Wahyuni",
    statusSetoran: "SUDAH_DISETOR",
    setoranId: "s-02"
  },

  // ANYELIR 1 - Februari (Pending Setor/Approval)
  {
    id: "p-06",
    wargaId: "w-01",
    wargaName: "Pak Budi Santoso",
    kelompokId: "dw-01",
    month: "Februari",
    year: 2026,
    timestamp: getPastDateString(10, 3),
    iuranDetails: [
      { category: IuranCategory.BULANAN, amount: 10000 },
      { category: IuranCategory.SAMPAH, amount: 30000 },
      { category: IuranCategory.KEMATIAN, amount: 5000 },
      { category: IuranCategory.SOSIAL, amount: 5000 }
    ],
    totalAmount: 50000,
    officerName: "Bu Eni Hartati",
    statusSetoran: "PENDING_PERSETUJUAN",
    setoranId: "s-03"
  },
  {
    id: "p-07",
    wargaId: "w-02",
    wargaName: "Ibu Siti Aminah",
    kelompokId: "dw-01",
    month: "Februari",
    year: 2026,
    timestamp: getPastDateString(12, 3),
    iuranDetails: [
      { category: IuranCategory.BULANAN, amount: 10000 },
      { category: IuranCategory.SAMPAH, amount: 30000 },
      { category: IuranCategory.KEMATIAN, amount: 5000 },
      { category: IuranCategory.SOSIAL, amount: 5000 }
    ],
    totalAmount: 50000,
    officerName: "Bu Eni Hartati",
    statusSetoran: "PENDING_PERSETUJUAN",
    setoranId: "s-03"
  },

  // ANYELIR 3 - Maret (Belum Disetor)
  {
    id: "p-08",
    wargaId: "w-11",
    wargaName: "Pak Slamet Rahardjo",
    kelompokId: "dw-03",
    month: "Maret",
    year: 2026,
    timestamp: getPastDateString(5, 2),
    iuranDetails: [
      { category: IuranCategory.BULANAN, amount: 10000 },
      { category: IuranCategory.SAMPAH, amount: 30000 },
      { category: IuranCategory.KEMATIAN, amount: 5000 },
      { category: IuranCategory.SOSIAL, amount: 5000 }
    ],
    totalAmount: 50000,
    officerName: "Bu Titi Endang",
    statusSetoran: "BELUM_DISETOR"
  },
  {
    id: "p-09",
    wargaId: "w-12",
    wargaName: "Ibu Megawati Soekarno",
    kelompokId: "dw-03",
    month: "Maret",
    year: 2026,
    timestamp: getPastDateString(6, 2),
    iuranDetails: [
      { category: IuranCategory.BULANAN, amount: 10000 },
      { category: IuranCategory.SAMPAH, amount: 30000 }
    ],
    totalAmount: 40000,
    officerName: "Bu Titi Endang",
    statusSetoran: "BELUM_DISETOR"
  }
];

export const INITIAL_SETORAN: SetoranSubmission[] = [
  {
    id: "s-01",
    kelompokId: "dw-01",
    officerName: "Bu Eni Hartati",
    amount: 140000,
    paymentIds: ["p-01", "p-02", "p-03"],
    timestamp: getPastDateString(15, 4),
    status: "DISETUJUI",
    verificationTimestamp: getPastDateString(16, 4)
  },
  {
    id: "s-02",
    kelompokId: "dw-02",
    officerName: "Bu Sri Wahyuni",
    amount: 100000,
    paymentIds: ["p-04", "p-05"],
    timestamp: getPastDateString(12, 4),
    status: "DISETUJUI",
    verificationTimestamp: getPastDateString(13, 4)
  },
  {
    id: "s-03",
    kelompokId: "dw-01",
    officerName: "Bu Eni Hartati",
    amount: 100000,
    paymentIds: ["p-06", "p-07"],
    timestamp: getPastDateString(15, 3),
    status: "PENDING"
  }
];
