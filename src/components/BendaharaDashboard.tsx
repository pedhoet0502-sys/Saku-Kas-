/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CheckCircle2, TrendingUp, DollarSign, Users, ShieldCheck, UserCheck, Calendar, RotateCcw, BarChart3, Clock, AlertCircle, Search, FileText, Inbox, Plus, Edit, Trash2, Settings } from "lucide-react";
import { Payment, SetoranSubmission, Kelompok, Warga } from "../types";
import { IURAN_CONFIGS, MONTHS_LIST } from "../initialData";

interface BendaharaDashboardProps {
  payments: Payment[];
  submissions: SetoranSubmission[];
  kelompoks: Kelompok[];
  onApproveSubmission: (id: string) => void;
  onResetAllData?: () => void;
  notificationConfig?: {
    title: string;
    message: string;
    dueDate: string;
    daysBefore: number;
    lastSent?: string;
  };
  onSendBroadcast?: (config: {
    title: string;
    message: string;
    dueDate: string;
    daysBefore: number;
  }) => void;
  onUpdateWargaList?: (wargas: Warga[]) => void;
  onUpdateKelompoks?: (kelompoks: Kelompok[]) => void;
  wargaList?: Warga[];
}

export const BendaharaDashboard: React.FC<BendaharaDashboardProps> = ({
  payments,
  submissions,
  kelompoks,
  onApproveSubmission,
  onResetAllData,
  notificationConfig,
  onSendBroadcast,
  onUpdateWargaList,
  onUpdateKelompoks,
  wargaList = [],
}) => {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "reports" | "notifications" | "management">("pending");
  const [reportSearchQuery, setReportSearchQuery] = useState("");
  const [submissionStatusFilter, setSubmissionStatusFilter] = useState<"PENDING" | "DISETUJUI" | "ALL">("PENDING");
  
  // Management tab specific states
  const [managementSubTab, setManagementSubTab] = useState<"warga" | "kelompok">("warga");
  const [managementSearchQuery, setManagementSearchQuery] = useState("");

  // Warga Form modal states
  const [isWargaModalOpen, setIsWargaModalOpen] = useState(false);
  const [editingWarga, setEditingWarga] = useState<Warga | null>(null);
  const [wargaFormName, setWargaFormName] = useState("");
  const [wargaFormNoHouse, setWargaFormNoHouse] = useState("");
  const [wargaFormAddress, setWargaFormAddress] = useState("");
  const [wargaFormKelompokId, setWargaFormKelompokId] = useState("");
  const [wargaFormPhone, setWargaFormPhone] = useState("");

  // Kelompok Form modal states
  const [isKelompokModalOpen, setIsKelompokModalOpen] = useState(false);
  const [editingKelompok, setEditingKelompok] = useState<Kelompok | null>(null);
  const [kelompokFormName, setKelompokFormName] = useState("");
  const [kelompokFormOfficerName, setKelompokFormOfficerName] = useState("");
  const [kelompokFormOfficerPhone, setKelompokFormOfficerPhone] = useState("");

  // Helper to open Warga modal for Adding
  const handleOpenAddWarga = () => {
    setEditingWarga(null);
    setWargaFormName("");
    setWargaFormNoHouse("");
    setWargaFormAddress("");
    // Pre-populate with first kelompok ID if available
    setWargaFormKelompokId(kelompoks[0]?.id || "");
    setWargaFormPhone("");
    setIsWargaModalOpen(true);
  };

  // Helper to open Warga modal for Editing
  const handleOpenEditWarga = (w: Warga) => {
    setEditingWarga(w);
    setWargaFormName(w.name);
    setWargaFormNoHouse(w.noHouse);
    setWargaFormAddress(w.address);
    setWargaFormKelompokId(w.kelompokId);
    setWargaFormPhone(w.phone);
    setIsWargaModalOpen(true);
  };

  // Helper to save Warga (add or edit)
  const handleSaveWarga = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wargaFormName || !wargaFormNoHouse || !wargaFormKelompokId) {
      alert("Nama, Nomor Rumah, dan Kelompok wajib diisi!");
      return;
    }

    if (editingWarga) {
      // Editing
      const updatedList = wargaList.map((w) =>
        w.id === editingWarga.id
          ? {
              ...w,
              name: wargaFormName,
              noHouse: wargaFormNoHouse,
              address: wargaFormAddress,
              kelompokId: wargaFormKelompokId,
              phone: wargaFormPhone,
            }
          : w
      );
      onUpdateWargaList?.(updatedList);
      alert(`Warga "${wargaFormName}" berhasil diperbarui.`);
    } else {
      // Creating new
      const newWarga: Warga = {
        id: `w-${Date.now()}`,
        name: wargaFormName,
        noHouse: wargaFormNoHouse,
        address: wargaFormAddress,
        kelompokId: wargaFormKelompokId,
        phone: wargaFormPhone,
      };
      onUpdateWargaList?.([...wargaList, newWarga]);
      alert(`Warga baru "${wargaFormName}" berhasil ditambahkan.`);
    }
    setIsWargaModalOpen(false);
  };

  // Helper to delete Warga
  const handleDeleteWarga = (wargaId: string) => {
    const targetW = wargaList.find((w) => w.id === wargaId);
    if (!targetW) return;
    if (confirm(`Apakah Anda yakin ingin menghapus data warga "${targetW.name}"?`)) {
      const updated = wargaList.filter((w) => w.id !== wargaId);
      onUpdateWargaList?.(updated);
      alert(`Warga "${targetW.name}" berhasil dihapus.`);
    }
  };

  // Helper to open Kelompok modal for Adding
  const handleOpenAddKelompok = () => {
    setEditingKelompok(null);
    setKelompokFormName("");
    setKelompokFormOfficerName("");
    setKelompokFormOfficerPhone("");
    setIsKelompokModalOpen(true);
  };

  // Helper to open Kelompok modal for Editing
  const handleOpenEditKelompok = (k: Kelompok) => {
    setEditingKelompok(k);
    setKelompokFormName(k.name);
    setKelompokFormOfficerName(k.officerName);
    setKelompokFormOfficerPhone(k.officerPhone);
    setIsKelompokModalOpen(true);
  };

  // Helper to save Kelompok (add or edit)
  const handleSaveKelompok = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kelompokFormName) {
      alert("Nama Kelompok wajib diisi!");
      return;
    }

    if (editingKelompok) {
      // Editing
      const updatedList = kelompoks.map((k) =>
        k.id === editingKelompok.id
          ? {
              ...k,
              name: kelompokFormName,
              officerName: kelompokFormOfficerName,
              officerPhone: kelompokFormOfficerPhone,
            }
          : k
      );
      onUpdateKelompoks?.(updatedList);
      alert(`Kelompok "${kelompokFormName}" berhasil diperbarui.`);
    } else {
      // Creating new
      const newKelompok: Kelompok = {
        id: `dw-${Date.now()}`,
        name: kelompokFormName,
        officerName: kelompokFormOfficerName,
        officerPhone: kelompokFormOfficerPhone,
      };
      onUpdateKelompoks?.([...kelompoks, newKelompok]);
      alert(`Kelompok Dasawisma "${kelompokFormName}" berhasil ditambahkan.`);
    }
    setIsKelompokModalOpen(false);
  };

  // Helper to delete Kelompok
  const handleDeleteKelompok = (kelompokId: string) => {
    const targetK = kelompoks.find((k) => k.id === kelompokId);
    if (!targetK) return;
    
    // Check if any active warga belongs to this kelompok
    const countWargaInKelompok = wargaList.filter((w) => w.kelompokId === kelompokId).length;
    if (countWargaInKelompok > 0) {
      alert(`Kelompok ini tidak dapat dihapus karena saat ini menampung ${countWargaInKelompok} warga. Terlebih dahulu pindahkan warga ke kelompok lain.`);
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus kelompok "${targetK.name}"?`)) {
      const updated = kelompoks.filter((k) => k.id !== kelompokId);
      onUpdateKelompoks?.(updated);
      alert(`Kelompok "${targetK.name}" berhasil dihapus.`);
    }
  };

  // States for date and month range reporting filters
  const [reportFilterType, setReportFilterType] = useState<"ALL" | "MONTH" | "DATERANGE">("ALL");
  const [reportSelectedMonth, setReportSelectedMonth] = useState<string>("");
  const [reportSelectedYear, setReportSelectedYear] = useState<number>(2026);
  const [reportStartDate, setReportStartDate] = useState<string>("");
  const [reportEndDate, setReportEndDate] = useState<string>("");

  // Form states for notification configuration
  const [notifTitle, setNotifTitle] = useState(notificationConfig?.title || "Pengingat Tagihan Iuran RT");
  const [notifMessage, setNotifMessage] = useState(notificationConfig?.message || "Yth. Warga RT 05, jatah pembayaran iuran bulan ini sudah diterbitkan. Mohon persiapkan dana Anda sebelum jatuh tempo.");
  const [notifDueDate, setNotifDueDate] = useState(notificationConfig?.dueDate || "10");
  const [notifDaysBefore, setNotifDaysBefore] = useState(notificationConfig?.daysBefore || 3);

  // Filter submissions by status
  const pendingSubmissions = submissions.filter((s) => s.status === "PENDING");
  const approvedSubmissions = submissions.filter((s) => s.status === "DISETUJUI");

  // Sum total verified funds inside treasurer's ledger (all payments marked SUDAH_DISETOR)
  const totalVerifiedFunds = payments
    .filter((p) => p.statusSetoran === "SUDAH_DISETOR")
    .reduce((sum, p) => sum + p.totalAmount, 0);

  // Sum total pending funds (not yet approved but collected)
  const totalPendingFunds = payments
    .filter((p) => p.statusSetoran === "PENDING_PERSETUJUAN")
    .reduce((sum, p) => sum + p.totalAmount, 0);

  // Calculate stats per category
  const getCategoryStats = (category: string) => {
    return payments
      .filter((p) => p.statusSetoran === "SUDAH_DISETOR")
      .reduce((sum, p) => {
        const detail = p.iuranDetails.find((d) => d.category === category);
        return sum + (detail ? detail.amount : 0);
      }, 0);
  };

  const formatRupiah = (num: number) => {
    return "Rp " + num.toLocaleString("id-ID");
  };

  const formatSmartAbbreviation = (num: number) => {
    if (num >= 1000000) {
      const formatted = (num / 1000000).toFixed(1).replace(".", ",");
      return `Rp ${formatted.endsWith(",0") ? formatted.slice(0, -2) : formatted} Jt`;
    }
    if (num >= 1000) {
      return `Rp ${(num / 1000).toFixed(0)}k`;
    }
    return `Rp ${num}`;
  };

  const totalsByCategory = {
    BULANAN: getCategoryStats("BULANAN"),
    SAMPAH: getCategoryStats("SAMPAH"),
    KEMATIAN: getCategoryStats("KEMATIAN"),
    SOSIAL: getCategoryStats("SOSIAL"),
  };

  const grandTotalLedger = totalVerifiedFunds;

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Global statistics ledger */}
      <div className="bg-[#111114] p-5 rounded-md border border-[#1E1E24] shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-gray-200">Kas Bendahara RT (Verified)</h3>
          </div>
          <span className="text-[10px] bg-indigo-550/10 text-indigo-400 border border-indigo-500/20 font-extrabold px-2.5 py-1 rounded-full uppercase">
            Master Ledger
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3.5 mb-1.5">
          <div className="bg-gradient-to-br from-indigo-700 to-purple-800 text-white rounded-md p-4 shadow-sm relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <DollarSign className="h-20 w-20" />
            </div>
            <span className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">Total Kas Masuk</span>
            <span className="text-xl font-mono font-extrabold block mt-2 tracking-tight">{formatRupiah(totalVerifiedFunds)}</span>
            <span className="text-[9px] text-indigo-200 mt-2.5 block flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> Rekening RT Aman
            </span>
          </div>

          <div className="bg-[#16161D] border border-[#1E1E24] text-white rounded-md p-4 shadow-sm relative overflow-hidden">
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <Clock className="h-20 w-20 text-gray-800" />
            </div>
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-sans">Setoran Pending</span>
            <span className="text-xl font-mono font-extrabold text-amber-400 block mt-2 tracking-tight">{formatRupiah(totalPendingFunds)}</span>
            <span className="text-[9.5px] text-rose-450 text-rose-500 font-extrabold mt-2.5 block flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5 text-rose-500 animate-pulse" /> Butuh Konfirmasi
            </span>
          </div>
        </div>
      </div>

      {/* 2. Ledger details / Chart of Categorized Dues */}
      <div className="bg-[#111114] p-5 rounded-md border border-[#1E1E24] shadow-md">
        <h3 className="text-sm font-bold text-gray-200 mb-3.5 flex items-center justify-between">
          <span>Alokasi Kas Per Jenis Iuran</span>
          <span className="text-[10px] text-gray-500 font-mono">Lunas Terverif</span>
        </h3>

        <div className="flex flex-col gap-3">
          {IURAN_CONFIGS.map((config) => {
            const sumValue = totalsByCategory[config.id as keyof typeof totalsByCategory] || 0;
            // Percent compared to grand total
            const percentage = grandTotalLedger > 0 ? (sumValue / grandTotalLedger) * 100 : 0;

            let barColor = "bg-emerald-500";
            if (config.id === "SAMPAH") barColor = "bg-teal-500";
            else if (config.id === "KEMATIAN") barColor = "bg-rose-500";
            else if (config.id === "SOSIAL") barColor = "bg-indigo-550 bg-indigo-500";

            return (
              <div key={config.id} className="text-xs">
                <div className="flex justify-between items-baseline font-semibold text-gray-300 mb-1">
                  <span className="truncate pr-2">{config.name}</span>
                  <span className="font-mono font-bold text-white tracking-tight shrink-0 min-w-max" title={formatRupiah(sumValue)}>
                    {formatSmartAbbreviation(sumValue)}
                  </span>
                </div>
                {/* Visual horizontal bar chart */}
                <div className="w-full bg-[#1E1E24]/80 rounded-full h-2 overflow-hidden flex">
                  <div 
                    className={`${barColor} h-full rounded-full transition-all duration-500`} 
                    style={{ width: `${Math.max(percentage, 3)}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 mt-0.5">
                  <span>Tarif: {formatSmartAbbreviation(config.amount)}/kk</span>
                  <span>{percentage.toFixed(1)}% Kontribusi</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Inbound submissions from group officers */}
      <div className="bg-[#111114] p-5 rounded-md border border-[#1E1E24] shadow-md">
        <div className="flex border-b border-[#1E1E24] mb-4 pb-1">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 pb-3 text-center text-[10px] font-bold transition ${
              activeTab === "pending"
                ? "border-b-2 border-indigo-550 text-indigo-400 font-extrabold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Antrian ({pendingSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab("approved")}
            className={`flex-1 pb-3 text-center text-[10px] font-bold transition ${
              activeTab === "approved"
                ? "border-b-2 border-indigo-550 text-indigo-400 font-extrabold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Setoran ({approvedSubmissions.length})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex-1 pb-3 text-center text-[10px] font-bold transition ${
              activeTab === "reports"
                ? "border-b-2 border-indigo-550 text-indigo-400 font-extrabold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Laporan
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex-1 pb-3 text-center text-[10px] font-bold transition ${
              activeTab === "notifications"
                ? "border-b-2 border-indigo-550 text-indigo-400 font-extrabold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Notifikasi
          </button>
          <button
            onClick={() => {
              setActiveTab("management");
              setManagementSearchQuery("");
            }}
            className={`flex-1 pb-3 text-center text-[10px] font-bold transition ${
              activeTab === "management"
                ? "border-b-2 border-indigo-550 text-indigo-400 font-extrabold"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            Kelola Data
          </button>
        </div>

        {activeTab === "notifications" && (
          <div className="flex flex-col gap-4 animate-fade-in text-xs">
            <div className="p-3 bg-indigo-600/10 border border-indigo-500/15 rounded-md">
              <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-0.5">Admin Broadcasting</span>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                Sesuaikan jadwal jatuh tempo dan pesan pengingat untuk disiarkan langsung ke handphone warga beberapa hari sebelum tenggat waktu.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Judul Pengingat (Subject)</label>
                <input
                  type="text"
                  value={notifTitle}
                  onChange={(e) => setNotifTitle(e.target.value)}
                  className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Contoh: Tagihan Ioran Bulanan RT"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Isi Pesan Notifikasi (Notification Body)</label>
                <textarea
                  value={notifMessage}
                  onChange={(e) => setNotifMessage(e.target.value)}
                  className="w-full h-20 bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md p-3 text-xs focus:ring-1 focus:ring-indigo-500 outline-none resize-none leading-relaxed"
                  placeholder="Yth. Warga RT 05, dimohon mempersiapkan iuran..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Jatuh Tempo</label>
                  <select
                    value={notifDueDate}
                    onChange={(e) => setNotifDueDate(e.target.value)}
                    className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-white cursor-pointer"
                  >
                    {[5, 10, 15, 20, 25, 28].map((day) => (
                      <option key={day} value={day.toString()}>
                        Tanggal {day}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Kirim H-X</label>
                  <select
                    value={notifDaysBefore}
                    onChange={(e) => setNotifDaysBefore(parseInt(e.target.value))}
                    className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md px-2.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-white cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 7].map((days) => (
                      <option key={days} value={days}>
                        {days} Hari Sebelum
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="p-3 bg-[#16161D] border border-[#23232A] rounded-md text-[10px] text-gray-400 leading-relaxed">
                <span className="font-bold text-gray-300 block mb-1">📅 Rencana Penjadwalan:</span>
                Iuran bulanan jatuh tempo tanggal <span className="font-bold text-white font-mono">{notifDueDate}</span>. Broadcast otomatis terjadwal H-{notifDaysBefore} yaitu tanggal <span className="font-bold text-indigo-400 font-mono">{parseInt(notifDueDate) - notifDaysBefore}</span> setiap bulannya.
              </div>

              <button
                type="button"
                onClick={() => {
                  if (onSendBroadcast) {
                    onSendBroadcast({
                      title: notifTitle,
                      message: notifMessage,
                      dueDate: notifDueDate,
                      daysBefore: notifDaysBefore,
                    });
                    alert(`Broadcast Pengingat RT Berhasil Dikirimkan ke Handphone Warga!`);
                  }
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-md text-xs transition shadow-lg shadow-indigo-650/15 flex items-center justify-center gap-1.5 cursor-pointer border border-[#2F2F3A]"
              >
                <AlertCircle className="h-4 w-4" />
                <span>Siarkan Pengingat RT Sekarang</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === "pending" && (() => {
          const displayedSubmissions = submissions.filter((s) => s.status === "PENDING");

          return (
            <div className="flex flex-col gap-3">
              {displayedSubmissions.map((sub) => {
                const klmpk = kelompoks.find((k) => k.id === sub.kelompokId);
                const isApproved = sub.status === "DISETUJUI";
                return (
                  <div key={sub.id} className={`p-4 border rounded-md flex flex-col gap-3 transition-colors ${
                    isApproved 
                      ? "bg-emerald-500/5 border-emerald-500/15" 
                      : "bg-[#16161D] border-[#22222A]"
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-3">
                        <span className={`text-[9px] font-bold border px-1.5 py-0.5 rounded-full uppercase ${
                          isApproved
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        }`}>
                          {isApproved ? "Setoran Sukses" : "Iuran Dasawisma"}
                        </span>
                        <h4 className="font-bold text-sm text-gray-200 mt-1 truncate">{klmpk?.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                          <Users className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">Petugas: {sub.officerName}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 min-w-max pl-2">
                        <p className="text-[10px] text-gray-500 font-mono">Jumlah Setoran</p>
                        <p className={`font-mono font-extrabold text-sm mt-0.5 tracking-tight ${
                          isApproved ? "text-emerald-400" : "text-indigo-400"
                        }`}>{formatRupiah(sub.amount)}</p>
                      </div>
                    </div>

                    <div className="bg-[#111114] p-2.5 rounded-md border border-[#23232A] text-[10px] text-gray-400 flex justify-between">
                      <span>Terdiri dari {sub.paymentIds.length} KK/Warga</span>
                      <span className="font-mono">
                        {isApproved && sub.verificationTimestamp 
                          ? `Selesai: ${new Date(sub.verificationTimestamp).toLocaleDateString("id-ID")}`
                          : `Dicatat: ${new Date(sub.timestamp).toLocaleDateString("id-ID")}`
                        }
                      </span>
                    </div>

                    {isApproved ? (
                      <div className="w-full bg-emerald-500/10 border border-emerald-500/15 text-emerald-400 font-bold py-2.5 px-4 rounded-md text-xs flex items-center justify-center gap-1.5 select-none uppercase font-sans">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span>Telah Diverifikasi Lunas</span>
                      </div>
                    ) : (
                      <button
                        id={`approve-submission-btn-${sub.id}`}
                        onClick={() => {
                          onApproveSubmission(sub.id);
                          alert(`Sukses memverifikasi iuran sebesar ${formatRupiah(sub.amount)} dari kelompok ${klmpk?.name}!`);
                        }}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-2 px-4 rounded-md text-xs transition shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Terima & Verifikasi Dana Ini</span>
                      </button>
                    )}
                  </div>
                );
              })}

              {displayedSubmissions.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-12 flex flex-col items-center justify-center gap-2.5">
                  <Inbox className="h-9 w-9 text-[#2E2E3A]" />
                  <p className="font-medium text-gray-400">Tidak ada setoran yang masuk di antrean.</p>
                </div>
              )}
            </div>
          );
        })()}

        {activeTab === "approved" && (
          <div className="flex flex-col gap-2.5 max-h-[500px] overflow-y-auto pr-1">
            {approvedSubmissions.slice().reverse().map((sub) => {
              const klmpk = kelompoks.find((k) => k.id === sub.kelompokId);
              return (
                <div key={sub.id} className="p-3 bg-[#16161D] border border-[#23232A] rounded-md flex justify-between items-center text-xs">
                  <div className="flex-1 min-w-0 pr-3">
                    <h5 className="font-bold text-gray-300 truncate">{klmpk?.name}</h5>
                    <div className="text-[10px] text-gray-500 mt-0.5 flex gap-2">
                      <span className="truncate">Oleh: {sub.officerName}</span>
                      <span>•</span>
                      <span className="shrink-0">Verified: {sub.verificationTimestamp ? new Date(sub.verificationTimestamp).toLocaleDateString("id-ID") : "-"}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 min-w-max pl-2">
                    <span className="font-mono font-extrabold text-gray-200 block tracking-tight">{formatRupiah(sub.amount)}</span>
                    <span className="text-[8px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded mt-1 inline-block">
                      LUNAS VERIFIED
                    </span>
                  </div>
                </div>
              );
            })}

            {approvedSubmissions.length === 0 && (
              <div className="text-xs text-gray-500 text-center py-12 flex flex-col items-center justify-center gap-2">
                <Inbox className="h-9 w-9 text-[#2E2E3A]" />
                <p className="font-medium text-gray-400">Belum ada riwayat setoran uang dikonfirmasi.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (() => {
          const filtered = payments.filter((p) => {
            const query = reportSearchQuery.trim().toLowerCase();
            const matchesQuery = p.wargaName.toLowerCase().includes(query) || p.id.toLowerCase().includes(query);
            if (!matchesQuery) return false;

            if (reportFilterType === "MONTH") {
              if (reportSelectedMonth && p.month !== reportSelectedMonth) return false;
              if (reportSelectedYear && p.year !== reportSelectedYear) return false;
            } else if (reportFilterType === "DATERANGE") {
              const pDateStr = p.timestamp.substring(0, 10); // "YYYY-MM-DD"
              if (reportStartDate && pDateStr < reportStartDate) return false;
              if (reportEndDate && pDateStr > reportEndDate) return false;
            }

            return true;
          });

          const totalFilteredAmount = filtered.reduce((sum, p) => sum + p.totalAmount, 0);

          return (
            <div className="flex flex-col gap-3 animate-fade-in text-xs">
              {/* Search input */}
              <div className="relative shrink-0">
                <input
                  type="text"
                  value={reportSearchQuery}
                  onChange={(e) => setReportSearchQuery(e.target.value)}
                  className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md pl-9 pr-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Cari nama warga atau ID pembayaran..."
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>

              {/* Advanced Date/Month Filter Panel */}
              <div className="bg-[#16161D] border border-[#23232A] p-3 rounded-md space-y-2.5 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.03] pb-2">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Filter Waktu Laporan</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setReportFilterType("ALL")}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition cursor-pointer select-none ${
                        reportFilterType === "ALL"
                          ? "bg-indigo-600 text-white"
                          : "bg-[#111114] text-gray-400 hover:text-gray-200 border border-[#1E1E24]"
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportFilterType("MONTH")}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition cursor-pointer select-none ${
                        reportFilterType === "MONTH"
                          ? "bg-indigo-600 text-white"
                          : "bg-[#111114] text-gray-400 hover:text-gray-200 border border-[#1E1E24]"
                      }`}
                    >
                      Bulan
                    </button>
                    <button
                      type="button"
                      onClick={() => setReportFilterType("DATERANGE")}
                      className={`px-2 py-0.5 rounded-md text-[9px] font-bold transition cursor-pointer select-none ${
                        reportFilterType === "DATERANGE"
                          ? "bg-indigo-600 text-white"
                          : "bg-[#111114] text-gray-400 hover:text-gray-200 border border-[#1E1E24]"
                      }`}
                    >
                      Rentang Tanggal
                    </button>
                  </div>
                </div>

                {/* Conditional fields based on selected method */}
                {reportFilterType === "MONTH" && (
                  <div className="flex gap-2 items-center animate-fade-in text-[10px]">
                    <div className="flex-1">
                      <label className="text-[8px] text-gray-500 uppercase font-bold block mb-1">Pilih Bulan</label>
                      <select
                        value={reportSelectedMonth}
                        onChange={(e) => setReportSelectedMonth(e.target.value)}
                        className="w-full bg-[#111114] text-gray-250 border border-[#1E1E24] rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-gray-200 cursor-pointer"
                      >
                        <option value="">Semua Bulan</option>
                        {MONTHS_LIST.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase font-bold block mb-1">Pilih Tahun</label>
                      <select
                        value={reportSelectedYear}
                        onChange={(e) => setReportSelectedYear(Number(e.target.value))}
                        className="bg-[#111114] text-gray-250 border border-[#1E1E24] rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-gray-200 cursor-pointer"
                      >
                        <option value={2026}>2026</option>
                        <option value={2025}>2025</option>
                        <option value={2027}>2027</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Conditional fields based on selected method */}
                {reportFilterType === "DATERANGE" && (
                  <div className="grid grid-cols-2 gap-2 animate-fade-in text-[10px]">
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase font-bold block mb-1">Tanggal Mulai</label>
                      <input
                        type="date"
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full bg-[#111114] text-gray-100 border border-[#1E1E24] rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] text-gray-500 uppercase font-bold block mb-1">Tanggal Akhir</label>
                      <input
                        type="date"
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full bg-[#111114] text-gray-100 border border-[#1E1E24] rounded-md px-2 py-1 text-[11px] focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-white"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Total Filtered Summary Card */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-2.5 px-3.5 rounded-md flex justify-between items-center shrink-0">
                <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">Total Terfilter ({filtered.length} transaksi):</span>
                <span className="font-mono text-indigo-400 font-extrabold text-sm">{formatRupiah(totalFilteredAmount)}</span>
              </div>

              {/* Payments List Container */}
              <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
                {filtered.slice().reverse().map((pay) => {
                  const klmpk = kelompoks.find((k) => k.id === pay.kelompokId);
                  return (
                    <div key={pay.id} className="p-3 bg-[#16161D] border border-[#23232A] rounded-md flex flex-col gap-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-bold text-white bg-indigo-600/15 border border-indigo-500/20 px-2 py-0.5 rounded">
                            Bulan {pay.month} {pay.year}
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono ml-2">ID: {pay.id}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono text-indigo-400 font-bold text-xs">{formatRupiah(pay.totalAmount)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400 border-t border-white/5 pt-1.5">
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-medium">Pembayar / KK</span>
                          <span className="font-extrabold text-gray-200">{pay.wargaName}</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-500 block uppercase font-medium">Dasawisma / Kelompok</span>
                          <span className="font-bold text-gray-300">{klmpk?.name || pay.kelompokId}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-gray-400 border-t border-white/5 pt-1.5">
                        <span>Pencatat: {pay.officerName}</span>
                        {pay.statusSetoran === "SUDAH_DISETOR" ? (
                          <span className="text-[9px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                            Verif Lunas
                          </span>
                        ) : pay.statusSetoran === "PENDING_PERSETUJUAN" ? (
                          <span className="text-[9px] uppercase font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded animate-pulse">
                            Dalam Antrian
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase font-mono font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded">
                            Belum Setor
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="text-center text-gray-500 text-xs py-10 flex flex-col items-center justify-center gap-2">
                    <FileText className="h-8 w-8 text-neutral-700" />
                    <span>Tidak ada data pembayaran yang sesuai kriteria filter.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {activeTab === "management" && (() => {
          const query = managementSearchQuery.trim().toLowerCase();
          
          return (
            <div className="flex flex-col gap-4 animate-fade-in text-xs text-left">
              {/* Top Banner Info */}
              <div className="p-3 bg-indigo-600/10 border border-indigo-500/15 rounded-md flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest block mb-0.5">Modul Manajemen Data</span>
                  <p className="text-[11px] text-gray-300 leading-relaxed">
                    Kelola data warga RT 05 dan penugasan Kelompok Dasawisma untuk penarikan iuran bulanan secara dinamis.
                  </p>
                </div>
              </div>

              {/* Sub-tabs & Search Input inline or compact grid */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#16161D] border border-[#23232A] p-2.5 rounded-md">
                {/* Warga vs Kelompok Choice */}
                <div className="flex bg-[#111114] p-1 rounded-md border border-[#1E1E24] shrink-0 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      setManagementSubTab("warga");
                      setManagementSearchQuery("");
                    }}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      managementSubTab === "warga"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <Users className="h-3.5 w-3.5" />
                    <span>Daftar Warga ({wargaList.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setManagementSubTab("kelompok");
                      setManagementSearchQuery("");
                    }}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-bold transition flex items-center gap-1 cursor-pointer ${
                      managementSubTab === "kelompok"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Kelompok/Petugas ({kelompoks.length})</span>
                  </button>
                </div>

                {/* Add dynamic Button based on selection */}
                <div>
                  {managementSubTab === "warga" ? (
                    <button
                      type="button"
                      onClick={handleOpenAddWarga}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 px-3 rounded flex items-center gap-1 transition shadow-sm cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Warga</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOpenAddKelompok}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold py-1.5 px-3 rounded flex items-center gap-1 transition shadow-sm cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Tambah Kelompok</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  value={managementSearchQuery}
                  onChange={(e) => setManagementSearchQuery(e.target.value)}
                  className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md pl-9 pr-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder={
                    managementSubTab === "warga" 
                      ? "Cari nama warga, nomor rumah, atau alamat..."
                      : "Cari nama kelompok dasawisma atau nama petugas..."
                  }
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
              </div>

              {/* Data List Section */}
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {managementSubTab === "warga" && (() => {
                  const filteredWarga = wargaList.filter((w) => {
                    if (!query) return true;
                    return (
                      w.name.toLowerCase().includes(query) ||
                      w.noHouse.toLowerCase().includes(query) ||
                      w.address.toLowerCase().includes(query)
                    );
                  });

                  return (
                    <div className="space-y-2 text-left">
                      {filteredWarga.map((w) => {
                        const klmpk = kelompoks.find((k) => k.id === w.kelompokId);
                        return (
                          <div
                            key={w.id}
                            className="p-3 bg-[#16161D] border border-[#23232A] rounded-md flex justify-between items-center gap-3 hover:border-indigo-500/20 transition group"
                          >
                            <div className="flex-1 min-w-0 pr-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded leading-none shrink-0">
                                  {w.noHouse}
                                </span>
                                <h4 className="font-bold text-xs text-white truncate min-w-0 leading-tight">
                                  {w.name}
                                </h4>
                                <span className="text-[9px] font-semibold text-gray-450 bg-[#1E1E24] px-1.5 py-0.5 rounded border border-[#2D2D35]/30 shrink-0 text-[8px] uppercase">
                                  🌐 {klmpk ? klmpk.name : "Tanpa Kelompok"}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1.5 truncate pl-0.5">
                                📍 {w.address || "Alamat belum dilengkapi"}
                              </p>
                              <p className="text-[9px] text-gray-500 mt-0.5 font-mono pl-0.5">
                                📞 {w.phone || "No. HP tidak terdaftar"}
                              </p>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex gap-1.5 shrink-0 select-none">
                              <button
                                type="button"
                                onClick={() => handleOpenEditWarga(w)}
                                className="p-1 px-1.5 rounded bg-[#1E1E24] border border-[#2A2A35]/40 text-indigo-400 hover:text-white hover:bg-indigo-600/20 transition cursor-pointer"
                                title="Edit Warga"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteWarga(w.id)}
                                className="p-1 px-1.5 rounded bg-[#1E1E24] border border-[#2A2A35]/40 text-rose-500 hover:text-white hover:bg-rose-600/20 transition cursor-pointer"
                                title="Hapus Warga"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {filteredWarga.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                          Tidak ada warga yang sesuai dengan kriteria pencarian.
                        </div>
                      )}
                    </div>
                  );
                })()}

                {managementSubTab === "kelompok" && (() => {
                  const filteredKelompok = kelompoks.filter((k) => {
                    if (!query) return true;
                    return (
                      k.name.toLowerCase().includes(query) ||
                      k.officerName.toLowerCase().includes(query)
                    );
                  });

                  return (
                    <div className="space-y-2 text-left">
                      {filteredKelompok.map((k) => {
                        const countWarga = wargaList.filter((w) => w.kelompokId === k.id).length;
                        return (
                          <div
                            key={k.id}
                            className="p-3 bg-[#16161D] border border-[#23232A] rounded-md flex justify-between items-center gap-3 hover:border-indigo-500/20 transition group"
                          >
                            <div className="flex-1 min-w-0 pr-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-xs text-white leading-tight">
                                  {k.name}
                                </h4>
                                <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono shrink-0">
                                  {countWarga} kk/warga
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 mt-1.5 pl-0.5 flex items-center gap-1 leading-relaxed">
                                👤 Penanggung Jawab: <span className="text-white font-bold">{k.officerName || "-"}</span>
                              </p>
                              <p className="text-[9px] text-gray-500 mt-0.5 font-mono pl-0.5">
                                📞 {k.officerPhone || "No. HP tidak terdaftar"}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1.5 shrink-0 select-none">
                              <button
                                type="button"
                                onClick={() => handleOpenEditKelompok(k)}
                                className="p-1 px-1.5 rounded bg-[#1E1E24] border border-[#2A2A35]/40 text-indigo-400 hover:text-white hover:bg-indigo-600/20 transition cursor-pointer"
                                title="Edit Kelompok"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteKelompok(k.id)}
                                className="p-1 px-1.5 rounded bg-[#1E1E24] border border-[#2A2A35]/40 text-rose-500 hover:text-white hover:bg-rose-600/20 transition cursor-pointer"
                                title="Hapus Kelompok"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {filteredKelompok.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                          Tidak ada kelompok yang sesuai dengan kriteria pencarian.
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Citizen Modal Form */}
              {isWargaModalOpen && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <form
                    onSubmit={handleSaveWarga}
                    className="w-full max-w-sm bg-[#111114] border border-[#23232A] rounded-md shadow-2xl p-5 space-y-3.5 text-xs text-left animate-fade-in"
                  >
                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                      <h3 className="text-sm font-bold text-white">
                        {editingWarga ? "✏️ Edit Data Warga" : "➕ Tambah Warga Baru"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsWargaModalOpen(false)}
                        className="text-gray-450 hover:text-white transition cursor-pointer font-bold text-base"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Nama Lengkap *</label>
                        <input
                          type="text"
                          required
                          value={wargaFormName}
                          onChange={(e) => setWargaFormName(e.target.value)}
                          className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="cth. Pak Supardi"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">No. Rumah *</label>
                          <input
                            type="text"
                            required
                            value={wargaFormNoHouse}
                            onChange={(e) => setWargaFormNoHouse(e.target.value)}
                            className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none font-mono font-bold"
                            placeholder="cth. A-21 / M-03"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">No. Handphone</label>
                          <input
                            type="text"
                            value={wargaFormPhone}
                            onChange={(e) => setWargaFormPhone(e.target.value)}
                            className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                            placeholder="cth. 0812-xxxx"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Alamat Mukim</label>
                        <input
                          type="text"
                          value={wargaFormAddress}
                          onChange={(e) => setWargaFormAddress(e.target.value)}
                          className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="cth. Jl. Anyelir Gg. 3 No. 21"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Kelompok Dasawisma *</label>
                        <select
                          value={wargaFormKelompokId}
                          onChange={(e) => setWargaFormKelompokId(e.target.value)}
                          className="w-full bg-[#16161D] text-gray-100 border border-[#23232A] rounded-md px-2.5 py-2 focus:ring-1 focus:ring-indigo-500 outline-none font-bold text-white cursor-pointer"
                        >
                          {kelompoks.map((k) => (
                            <option key={k.id} value={k.id}>
                              {k.name} – Penanggung Jawab: {k.officerName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsWargaModalOpen(false)}
                        className="flex-1 py-2 rounded bg-transparent border border-gray-600 text-gray-300 hover:text-white font-bold transition text-center cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition text-center cursor-pointer shadow-lg shadow-indigo-650/10"
                      >
                        {editingWarga ? "Simpan Perubahan" : "Simpan Warga Baru"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Kelompok Modal Form */}
              {isKelompokModalOpen && (
                <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <form
                    onSubmit={handleSaveKelompok}
                    className="w-full max-w-sm bg-[#111114] border border-[#23232A] rounded-md shadow-2xl p-5 space-y-3.5 text-xs text-left animate-fade-in"
                  >
                    <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                      <h3 className="text-sm font-bold text-white">
                        {editingKelompok ? "✏️ Edit Kelompok" : "➕ Tambah Kelompok Baru"}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsKelompokModalOpen(false)}
                        className="text-gray-450 hover:text-white transition cursor-pointer font-bold text-base"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Nama Kelompok Dasawisma *</label>
                        <input
                          type="text"
                          required
                          value={kelompokFormName}
                          onChange={(e) => setKelompokFormName(e.target.value.toUpperCase())}
                          className="w-full bg-[#16161D] text-white border border-[#23232A] rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="cth. ANYELIR 8"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Nama Petugas Penanggung Jawab</label>
                        <input
                          type="text"
                          value={kelompokFormOfficerName}
                          onChange={(e) => setKelompokFormOfficerName(e.target.value)}
                          className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                          placeholder="cth. Ibu Ratnawati"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">No. Handphone Petugas</label>
                        <input
                          type="text"
                          value={kelompokFormOfficerPhone}
                          onChange={(e) => setKelompokFormOfficerPhone(e.target.value)}
                          className="w-full bg-[#16161D] text-gray-200 border border-[#23232A] rounded-md px-3 py-2 focus:ring-1 focus:ring-indigo-500 outline-none font-mono"
                          placeholder="cth. 0812-xxxx"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      <button
                        type="button"
                        onClick={() => setIsKelompokModalOpen(false)}
                        className="flex-1 py-2 rounded bg-transparent border border-gray-600 text-gray-300 hover:text-white font-bold transition text-center cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-grow bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition text-center cursor-pointer shadow-lg shadow-indigo-650/10"
                      >
                        {editingKelompok ? "Simpan Perubahan" : "Simpan Kelompok"}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          );
        })()}
      </div>

      {onResetAllData && (
        <div className="bg-[#16161D] rounded-md p-4 border border-dashed border-[#23232A] mt-2 text-center">
          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-2">Simulasi Sandbox Utilities</p>
          <button
            onClick={() => {
              if (confirm("Apakah Anda yakin ingin menyetel ulang seluruh data pembayaran iuran ke pengaturan bawaan awal?")) {
                onResetAllData();
                alert("Seluruh iuran dan setoran telah direset ke setelan awal pabrik.");
              }
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-rose-400 bg-[#1E1E24] border border-[#23232A] hover:border-rose-500/30 py-1.5 px-3 rounded-sm transition cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Seluruh Tabel Iuran</span>
          </button>
        </div>
      )}
    </div>
  );
};
