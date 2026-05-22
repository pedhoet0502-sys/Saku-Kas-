/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Plus, Check, Send, AlertTriangle, Calendar, FileClock, ClipboardList, Wallet, Sparkles, Filter, RefreshCw, X, Eye, ChevronDown, Search } from "lucide-react";
import { Warga, Payment, Kelompok, IuranCategory, SetoranSubmission } from "../types";
import { IURAN_CONFIGS, MONTHS_LIST } from "../initialData";

interface PetugasDashboardProps {
  activeKelompokId: string;
  kelompoks: Kelompok[];
  wargaList: Warga[];
  payments: Payment[];
  submissions: SetoranSubmission[];
  onAddPayment: (payment: Omit<Payment, "id" | "timestamp">) => void;
  onSubmitSetoran: (submission: Omit<SetoranSubmission, "id" | "timestamp">) => void;
  onChangeKelompok?: (id: string) => void;
  officerType?: "dasawisma" | "khusus";
  onChangeOfficerType?: (type: "dasawisma" | "khusus") => void;
}

export const PetugasDashboard: React.FC<PetugasDashboardProps> = ({
  activeKelompokId,
  kelompoks,
  wargaList,
  payments,
  submissions,
  onAddPayment,
  onSubmitSetoran,
  onChangeKelompok,
  officerType = "dasawisma",
  onChangeOfficerType,
}) => {
  const [recordModalOpen, setRecordModalOpen] = useState(false);
  const [selectedWargaId, setSelectedWargaId] = useState<string>("");
  const [recordMonth, setRecordMonth] = useState<string>("Mei");
  const [selectedCategories, setSelectedCategories] = useState<IuranCategory[]>([]);
  const [historyModalWarga, setHistoryModalWarga] = useState<Warga | null>(null);

  // Sync selectedCategories when officerType changes or when modal opens
  useEffect(() => {
    const allowed = officerType === "dasawisma"
      ? [IuranCategory.KEMATIAN, IuranCategory.SOSIAL]
      : [IuranCategory.BULANAN, IuranCategory.SAMPAH];
    setSelectedCategories(allowed);
  }, [officerType, recordModalOpen]);

  // Warga bottom sheet and search states
  const [wargaBottomSheetOpen, setWargaBottomSheetOpen] = useState(false);
  const [wargaSearchQuery, setWargaSearchQuery] = useState("");
  const [bottomSheetExpanded, setBottomSheetExpanded] = useState(false);

  // Group selector dropdown states
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [groupDropdownOpen2, setGroupDropdownOpen2] = useState(false);

  const activeKelompok = kelompoks.find((k) => k.id === activeKelompokId);
  
  // Filter warga belonging to this group
  const groupWarga = wargaList.filter((w) => w.kelompokId === activeKelompokId);

  const selectedWarga = wargaList.find((w) => w.id === selectedWargaId);

  const filteredWarga = groupWarga.filter((w) => {
    const q = wargaSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return w.name.toLowerCase().includes(q) || w.noHouse.toLowerCase().includes(q);
  });

  // Filter payments belonging to this group and the active officerType's responsible categories
  const isPaymentForActiveOfficer = (p: Payment) => {
    return p.iuranDetails.some((d) => {
      if (officerType === "dasawisma") {
        return d.category === IuranCategory.KEMATIAN || d.category === IuranCategory.SOSIAL;
      } else {
        return d.category === IuranCategory.BULANAN || d.category === IuranCategory.SAMPAH;
      }
    });
  };

  const groupPaymentsAll = payments.filter((p) => p.kelompokId === activeKelompokId);
  const groupPayments = groupPaymentsAll.filter(isPaymentForActiveOfficer);

  // Calculate total cash currently held by officer (status: 'BELUM_DISETOR')
  const cashInHand = groupPayments
    .filter((p) => p.statusSetoran === "BELUM_DISETOR")
    .reduce((sum, p) => sum + p.totalAmount, 0);

  // Calculate total cash submitted but pending treasurer approval (status: 'PENDING_PERSETUJUAN')
  const pendingDeposit = groupPayments
    .filter((p) => p.statusSetoran === "PENDING_PERSETUJUAN")
    .reduce((sum, p) => sum + p.totalAmount, 0);

  // Total cash already received and approved by treasurer (status: 'SUDAH_DISETOR')
  const verifiedDeposit = groupPayments
    .filter((p) => p.statusSetoran === "SUDAH_DISETOR")
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const formatRupiah = (num: number) => {
    return "Rp " + num.toLocaleString("id-ID");
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWargaId || selectedCategories.length === 0) return;

    const targetWarga = wargaList.find((w) => w.id === selectedWargaId);
    if (!targetWarga) return;

    // Check pre-existing payment
    const duplicate = groupPayments.find(p => p.wargaId === selectedWargaId && p.month === recordMonth);
    if (duplicate) {
      alert(`Warga tersebut sudah melunasi iuran pada bulan ${recordMonth} melalui petugas ini!`);
      return;
    }

    const details = selectedCategories.map((cat) => {
      const conf = IURAN_CONFIGS.find((c) => c.id === cat);
      return {
        category: cat,
        amount: conf ? conf.amount : 0,
      };
    });

    const total = selectedCategories.reduce((sum, cat) => {
      const conf = IURAN_CONFIGS.find((c) => c.id === cat);
      return sum + (conf ? conf.amount : 0);
    }, 0);

    const activeOfficerNameStr = officerType === "dasawisma"
      ? (activeKelompok?.officerName || "Bu Eni Hartati")
      : (activeKelompok?.specialOfficerName || "Pak Heri Gunawan");

    onAddPayment({
      wargaId: selectedWargaId,
      wargaName: targetWarga.name,
      kelompokId: activeKelompokId,
      month: recordMonth,
      year: 2026,
      iuranDetails: details,
      totalAmount: total,
      officerName: activeOfficerNameStr,
      statusSetoran: "BELUM_DISETOR",
    });

    setRecordModalOpen(false);
    setSelectedWargaId("");
    alert(`Sukses mencatat pembayaran untuk warga ${targetWarga.name}!`);
  };

  const handleSendToTreasurer = () => {
    // Collect all payment IDs that are currently BELUM_DISETOR for active group
    const targetPayments = groupPayments.filter((p) => p.statusSetoran === "BELUM_DISETOR");
    if (targetPayments.length === 0) {
      alert("Tidak ada dana terkumpul baru untuk disetorkan. Semua transaksi sudah disetor!");
      return;
    }

    const totalToSubmit = targetPayments.reduce((sum, p) => sum + p.totalAmount, 0);
    const activeOfficerNameStr = officerType === "dasawisma"
      ? (activeKelompok?.officerName || "Bu Eni Hartati")
      : (activeKelompok?.specialOfficerName || "Pak Heri Gunawan");

    const submission: Omit<SetoranSubmission, "id" | "timestamp"> = {
      kelompokId: activeKelompokId,
      officerName: activeOfficerNameStr,
      amount: totalToSubmit,
      paymentIds: targetPayments.map((p) => p.id),
      status: "PENDING",
    };

    onSubmitSetoran(submission);
    alert(`Sukses menyerahkan setoran sebesar ${formatRupiah(totalToSubmit)} kepada Bendahara! Status sekarang 'PENDING' menanti persetujuan di dasbor Bendahara.`);
  };

  const toggleCategorySelection = (cat: IuranCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Group Summary Stats Grid */}
      <div className="bg-[#111114] p-4 rounded-md border border-[#1E1E24] shadow-md">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-400 shrink-0" />
            <div className="relative">
              <button
                type="button"
                onClick={() => setGroupDropdownOpen(!groupDropdownOpen)}
                className="font-extrabold text-sm text-gray-200 bg-[#1E1E24] hover:bg-[#25252D] border border-[#2B2B35] rounded-md px-2.5 py-1.5 flex items-center gap-1.5 transition cursor-pointer select-none"
              >
                <span>Saku Iuran – {activeKelompok?.name?.toUpperCase()}</span>
                <ChevronDown className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              </button>
              {groupDropdownOpen && (
                <div className="absolute left-0 mt-1.5 w-48 bg-[#16161D] border border-[#2D2D3A] rounded-md shadow-2xl z-40 py-1 overflow-hidden animate-fade-in text-left">
                  {kelompoks.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => {
                        onChangeKelompok?.(k.id);
                        setGroupDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition ${
                        k.id === activeKelompokId
                          ? "bg-indigo-600/15 text-indigo-400 font-bold"
                          : "text-gray-300 hover:bg-[#1E1E24] hover:text-white"
                      }`}
                    >
                      {k.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <span className="text-[11px] text-gray-400 font-medium ml-7 mt-1 block">
            Penanggung Jawab: <span className="text-indigo-400 font-semibold">
              {officerType === "dasawisma" 
                ? (activeKelompok?.officerName || "Bu Eni Hartati") 
                : (activeKelompok?.specialOfficerName || "Pak Heri Gunawan")}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="bg-[#16161D] rounded-md p-3 border border-[#1E1E24] flex flex-col justify-between">
            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider leading-tight block break-words">Di Saku Petugas</span>
            <span className="text-[11px] xs:text-[12.5px] sm:text-xs md:text-sm font-mono font-extrabold text-indigo-300 mt-2 block break-all leading-tight" title={formatRupiah(cashInHand)}>{formatRupiah(cashInHand)}</span>
            <span className="text-[8px] text-gray-450 mt-1 block">Belum disetor</span>
          </div>

          <div className="bg-[#16161D] rounded-md p-3 border border-[#1E1E24] flex flex-col justify-between">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider leading-tight block break-words">Sedang Setoran</span>
            <span className="text-[11px] xs:text-[12.5px] sm:text-xs md:text-sm font-mono font-extrabold text-amber-350 mt-2 block break-all leading-tight" title={formatRupiah(pendingDeposit)}>{formatRupiah(pendingDeposit)}</span>
            <span className="text-[8px] text-gray-450 mt-1 block">Menanti bendahara</span>
          </div>

          <div className="bg-[#16161D] rounded-md p-3 border border-[#1E1E24] flex flex-col justify-between">
            <span className="text-[10px] text-gray-450 font-bold uppercase tracking-wider leading-tight block break-words">Sudah Disetor</span>
            <span className="text-[11px] xs:text-[12.5px] sm:text-xs md:text-sm font-mono font-extrabold text-gray-300 mt-2 block break-all leading-tight" title={formatRupiah(verifiedDeposit)}>{formatRupiah(verifiedDeposit)}</span>
            <span className="text-[8px] text-emerald-400 font-bold mt-1 flex items-center gap-0.5 whitespace-nowrap">
              <Check className="h-2 w-2 text-emerald-400 shrink-0" /> Sukses-Verif
            </span>
          </div>
        </div>        {/* Action button to hand money to treasurer */}
        <button
          id="petugas-setor-bendahara-btn"
          onClick={handleSendToTreasurer}
          disabled={cashInHand === 0}
          className={`w-full py-2.5 px-4 rounded-md text-xs font-extrabold transition flex items-center justify-center gap-2 transition-all duration-150 ${
            cashInHand > 0
              ? "bg-[#6366F1] hover:bg-[#5053E6] active:bg-[#4043D2] text-white shadow-lg shadow-indigo-600/25 cursor-pointer"
              : "bg-[#1E1E24]/75 text-gray-400 border border-[#2B2B35]/70 opacity-50 cursor-not-allowed"
          }`}
        >
          <Send className="h-4 w-4 shrink-0" />
          <span>Serahkan Saku Ke Bendahara ({formatRupiah(cashInHand)})</span>
        </button>
      </div>

      {/* 2. Citizens List of Active Group */}
      <div className="bg-[#111114] p-5 rounded-md border border-[#1E1E24] shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-bold text-gray-200">Daftar Rumah ({groupWarga.length} Warga)</h3>
            <div className="relative mt-1 select-none">
              <button
                type="button"
                onClick={() => setGroupDropdownOpen2(!groupDropdownOpen2)}
                className="text-[10px] font-bold text-gray-400 bg-[#16161D] hover:bg-[#1E1E24] hover:text-white border border-[#23232A] rounded px-1.5 py-0.5 flex items-center gap-1 transition cursor-pointer"
              >
                <span>Kelompok: {activeKelompok?.name}</span>
                <ChevronDown className="h-2.5 w-2.5 text-indigo-400 shrink-0" />
              </button>
              {groupDropdownOpen2 && (
                <div className="absolute left-0 mt-1 w-44 bg-[#16161D] border border-[#23232A] rounded-md shadow-2xl z-40 py-1 overflow-hidden animate-fade-in text-left">
                  {kelompoks.map((k) => (
                    <button
                      key={k.id}
                      type="button"
                      onClick={() => {
                        onChangeKelompok?.(k.id);
                        setGroupDropdownOpen2(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 text-[10px] transition ${
                        k.id === activeKelompokId
                          ? "bg-indigo-600/15 text-indigo-400 font-bold"
                          : "text-gray-305 hover:bg-[#1E1E24] hover:text-white"
                      }`}
                    >
                      {k.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            id="petugas-add-payment-btn"
            onClick={() => {
              if (groupWarga.length > 0) {
                setSelectedWargaId(groupWarga[0].id);
              }
              setRecordModalOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white p-2.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition shadow-lg shadow-indigo-600/15"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Catat Iuran</span>
          </button>
        </div>

        {/* Dynamic scroll table view */}
        <div className="flex flex-col gap-3">
          {groupWarga.map((w) => {
            // Count total paid months for this resident
            const residentPayments = groupPayments.filter((p) => p.wargaId === w.id);
            const paidMonthsCount = residentPayments.length;

            return (
              <div key={w.id} className="p-3 bg-[#16161D] hover:bg-[#1E1E24] rounded-md border border-[#23232A] flex justify-between items-center gap-1.5 transition min-h-[72px]">
                <div className="flex-1 min-w-0 pr-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 font-mono text-[9px] font-bold px-1 py-0.2 rounded shrink-0 w-[42px] text-center">
                      {w.noHouse}
                    </span>
                    <span className="text-xs font-bold text-white truncate min-w-0 block w-full">{w.name}</span>
                  </div>
                  <p className="text-[10px] text-gray-450 mt-1.5 truncate pl-1">{w.address}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 select-none">
                  <div className="text-right shrink-0 min-w-[58px]">
                    <span className="text-[8px] block font-semibold text-gray-500 uppercase leading-none mb-1">Telah Bayar</span>
                    <span className={`text-[10px] font-extrabold block text-center py-0.5 px-1.5 rounded border leading-normal ${
                      paidMonthsCount === 0 
                        ? "text-rose-455 bg-rose-950/20 border-rose-500/20" 
                        : paidMonthsCount < 3
                        ? "text-amber-455 bg-amber-950/20 border-amber-500/20"
                        : "text-emerald-455 bg-emerald-950/20 border-emerald-500/20"
                    }`}>
                      {paidMonthsCount} Bulan
                    </span>
                  </div>
                  
                  {/* View History Button (with larger Google Materials minimum tap area) */}
                  <button
                    onClick={() => {
                      setHistoryModalWarga(w);
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-[#1E1E24] border border-[#23232A] text-gray-400 hover:bg-indigo-600/10 hover:text-indigo-400 hover:border-indigo-500/30 rounded-md transition shadow-sm cursor-pointer shrink-0"
                    title="Verifikasi Riwayat Pembayaran Warga Ini"
                  >
                    <Eye className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedWargaId(w.id);
                      // Auto pick next unpaid month
                      const nextUnpaid = MONTHS_LIST.find(m => !residentPayments.some(p => p.month === m)) || "Maret";
                      setRecordMonth(nextUnpaid);
                      setRecordModalOpen(true);
                    }}
                    className="w-10 h-10 flex items-center justify-center bg-indigo-650 bg-indigo-600 border border-indigo-500/20 text-white hover:bg-indigo-500 rounded-md transition shadow-md cursor-pointer shrink-0"
                    title="Cepat Catat Iuran"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Recent Payment Logs by this Officer */}
      <div className="bg-[#111114] p-5 rounded-md border border-[#1E1E24] shadow-md">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
          <span>Riwayat Koleksi Terakhir</span>
          <span className="text-xs font-normal text-gray-500">Dasawisma Anda</span>
        </h3>

        <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800">
          {groupPayments.slice().reverse().map((p) => {
            const dateObj = new Date(p.timestamp);
            const day = String(dateObj.getDate()).padStart(2, '0');
            const monthNumeric = String(dateObj.getMonth() + 1).padStart(2, '0');
            const yearShort = String(dateObj.getFullYear()).slice(-2);
            const formattedDate = `${day}/${monthNumeric}/${yearShort}`;

            return (
              <div key={p.id} className="p-3 rounded-md border border-[#23232A] bg-[#16161D] hover:bg-[#1E1E24] flex justify-between items-center text-xs transition">
                <div>
                  <div className="flex items-center gap-1.5 font-sans">
                    <span className="font-bold text-white">{p.wargaName}</span>
                  </div>
                  <div className="text-[10px] text-gray-450 mt-1.5 flex items-center gap-1.5 select-none font-medium">
                    <span>{formattedDate}</span>
                    <span className="text-gray-600 font-bold">•</span>
                    <span className="text-slate-200 font-semibold">{p.month}</span>
                    <span className="text-gray-600 font-bold">•</span>
                    <span>{p.iuranDetails.length} jenis</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="font-mono font-bold text-indigo-400">{formatRupiah(p.totalAmount)}</span>
                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                    p.statusSetoran === "SUDAH_DISETOR"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : p.statusSetoran === "PENDING_PERSETUJUAN"
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                      : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  }`}>
                    {p.statusSetoran === "SUDAH_DISETOR" ? "Diterima Bendahara" : p.statusSetoran === "PENDING_PERSETUJUAN" ? "Menunggu Verif" : "Saku Petugas"}
                  </span>
                </div>
              </div>
            );
          })}

          {groupPayments.length === 0 && (
            <div className="text-xs text-gray-500 text-center py-6">Belum ada catatan pembayaran dicatat oleh petugas kelompok ini.</div>
          )}
        </div>
      </div>
      {/* 4. Record Payment Modal Dialog */}
      {recordModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111114] rounded-md w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in border border-[#1E1E24]">
            <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Catat Setoran Iuran Warga</h3>
                <p className="text-xs text-slate-100/80 font-medium mt-1">Petugas menarik iuran langsung di lapangan.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setRecordModalOpen(false)} 
                className="text-indigo-100 hover:text-white cursor-pointer p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Warga Pembayar *</label>
                <button
                  type="button"
                  onClick={() => {
                    setWargaSearchQuery("");
                    setBottomSheetExpanded(false);
                    setWargaBottomSheetOpen(true);
                  }}
                  className="w-full bg-[#16161D] border-2 border-indigo-505/45 hover:border-indigo-500 text-gray-200 rounded-md px-3.5 py-3 text-sm flex justify-between items-center cursor-pointer transition select-none shadow-sm focus:outline-none"
                >
                  <span className={selectedWarga ? "text-slate-100 font-bold" : "text-gray-400 font-medium"}>
                    {selectedWarga ? selectedWarga.name : "Pilih Rumah atau Warga"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-indigo-400 shrink-0 stroke-[2.5]" />
                </button>
                {selectedWarga && (
                  <div className="mt-1.5 text-[10.5px] text-gray-400 pl-1 font-mono">
                    No. Rumah Terpilih: <span className="text-white font-bold bg-[#1E1E24] px-1.5 py-0.5 rounded border border-[#23232A]">{selectedWarga.noHouse}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Bulan Periode *</label>
                <select
                  value={recordMonth}
                  onChange={(e) => setRecordMonth(e.target.value)}
                  className="w-full bg-[#16161D] border border-[#23232A] text-gray-200 rounded-md px-3.5 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-bold text-slate-150"
                >
                  {MONTHS_LIST.slice(0, 6).map((m) => (
                    <option key={m} value={m} className="font-bold">{m} 2026</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Pilih Jenis Penarikan *</label>
                <div className="flex flex-col gap-2 font-sans max-h-[160px] overflow-y-auto pr-0.5 scrollbar-thin">
                  {IURAN_CONFIGS.map((config) => {
                    const isChecked = selectedCategories.includes(config.id);
                    return (
                      <div 
                        key={config.id}
                        onClick={() => toggleCategorySelection(config.id)}
                        className={`flex items-start gap-3 p-3 rounded-md border cursor-pointer select-none transition ${
                          isChecked 
                            ? "bg-indigo-600/15 border-indigo-500 text-indigo-400" 
                            : "border-[#23232A] text-gray-300 hover:bg-[#16161D]"
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          id={`checkbox-${config.id}`}
                          checked={isChecked}
                          onChange={() => {}} // Swallowed, handled by parent div click
                          className="rounded border-gray-600 bg-black/20 text-indigo-600 focus:ring-indigo-500 h-4 w-4 shrink-0 pointer-events-none mt-0.5"
                        />
                        <div className="flex flex-col text-left">
                          <span className={`text-xs ${isChecked ? "font-bold text-indigo-300" : "font-semibold text-gray-200"}`}>
                            {config.name}
                          </span>
                          <span className={`text-[11px] font-mono mt-0.5 font-bold ${isChecked ? "text-indigo-400" : "text-gray-450"}`}>
                            {formatRupiah(config.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#16161D] p-3 rounded-md border border-[#1E1E24] flex justify-between items-center select-none">
                <span className="text-xs font-bold text-gray-400">Total Diterima:</span>
                <span className="text-base font-extrabold text-white font-mono">
                  {formatRupiah(
                    selectedCategories.reduce((sum, cat) => {
                      const conf = IURAN_CONFIGS.find(c => c.id === cat);
                      return sum + (conf ? conf.amount : 0);
                    }, 0)
                  )}
                </span>
              </div>

              {/* Action Buttons: 30% Cancel and 70% Save layout ratio */}
              <div className="flex gap-2.5 mt-2 select-none">
                <button
                  type="button"
                  onClick={() => setRecordModalOpen(false)}
                  className="w-[30%] py-3 border border-gray-600 hover:bg-white/5 rounded-md text-xs font-bold text-gray-300 transition cursor-pointer text-center"
                >
                  Batal
                </button>
                <button
                  id="petugas-submit-record-btn"
                  type="submit"
                  disabled={selectedCategories.length === 0 || !selectedWargaId}
                  className="w-[70%] py-3 bg-indigo-605 disabled:bg-indigo-650/40 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-md text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer text-center"
                >
                  <Plus className="h-4 w-4" />
                  <span>Simpan Pembayaran</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Custom Bottom Sheet for Selecting Citizen with Realtime Live Search */}
      {wargaBottomSheetOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[60] flex items-end justify-center transition-all duration-300 animate-fade-in">
          <div 
            className={`bg-[#111114] rounded-t-2xl w-full max-w-sm border-t border-[#23232A] shadow-2xl flex flex-col transition-all duration-300 ease-out overflow-hidden animate-slide-up ${
              bottomSheetExpanded ? "h-[88vh] max-h-[88vh]" : "h-[55vh] max-h-[55vh]"
            }`}
          >
            {/* Grab indicator wrapper */}
            <div className="w-full pt-3.5 pb-2 flex flex-col items-center shrink-0 select-none border-b border-white/5">
              <div className="w-10 h-1 bg-gray-600/50 rounded-full" />
            </div>

            <div className="px-5 py-3.5 flex justify-between items-center border-b border-white/5 shrink-0 select-none">
              <div className="text-left">
                <h4 className="text-sm font-extrabold text-white">Pilih Rumah atau Warga</h4>
                <p className="text-[10px] text-gray-400 mt-0.5">Saring & pilih warga pembayar iuran langsung.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setWargaBottomSheetOpen(false)}
                className="text-gray-450 hover:text-white font-extrabold text-xs cursor-pointer px-2.5 py-1.5 bg-[#1E1E24]/75 hover:bg-[#2A2A35] rounded transition"
              >
                ✕ Tutup
              </button>
            </div>

            {/* Search Input Box */}
            <div className="p-3.5 bg-[#141418]/60 border-b border-white/5 shrink-0 select-none">
              <div className="relative">
                <input
                  type="text"
                  value={wargaSearchQuery}
                  onFocus={() => setBottomSheetExpanded(true)}
                  onChange={(e) => {
                    setWargaSearchQuery(e.target.value);
                    setBottomSheetExpanded(true);
                  }}
                  className="w-full bg-[#16161D] text-gray-100 border border-[#23232A] rounded-md pl-9 pr-8 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                  placeholder="Ketik nama atau No. Rumah (cth: Bambang / M-03)..."
                  autoFocus
                />
                <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
                {wargaSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setWargaSearchQuery("")}
                    className="absolute right-3 top-3.5 text-[10px] text-gray-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#23232A]/40 min-h-0 text-left">
              {/* Reset/Placeholder Option Row */}
              <div
                onClick={() => {
                  setSelectedWargaId("");
                  setWargaBottomSheetOpen(false);
                }}
                className={`py-3.5 px-5 flex items-center justify-between hover:bg-[#1E1E24]/60 cursor-pointer transition select-none ${
                  !selectedWargaId ? "bg-indigo-600/10 font-bold text-indigo-400" : "text-gray-400"
                }`}
              >
                <div>
                  <span className="text-xs font-semibold">Pilih Rumah atau Warga</span>
                  <p className="text-[10px] text-gray-500 mt-0.5">Kembalikan ke status belum terpilih</p>
                </div>
                <div className="h-4.5 w-4.5 rounded-full border border-gray-600 flex items-center justify-center shrink-0">
                  {!selectedWargaId && <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />}
                </div>
              </div>

              {/* Loop through warga options with spacious spacing preventing fat-fingering */}
              {filteredWarga.map((w) => {
                const isSelected = selectedWargaId === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => {
                      setSelectedWargaId(w.id);
                      setWargaBottomSheetOpen(false);
                    }}
                    className={`py-3.5 px-5 flex items-center justify-between hover:bg-[#1E1E24]/60 cursor-pointer transition ${
                      isSelected ? "bg-indigo-600/10" : ""
                    }`}
                  >
                    <div className="pr-3 text-left">
                      <h5 className={`text-sm tracking-tight ${isSelected ? "font-extrabold text-indigo-400" : "font-bold text-slate-100"}`}>
                        {w.name}
                      </h5>
                      <p className="text-xs text-slate-400 mt-0.5 font-medium">
                        No. Rumah: <span className="text-slate-200 font-bold">{w.noHouse}</span>
                      </p>
                    </div>
                    
                    {/* Circle radio selector style on the right side */}
                    <div className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition ${
                      isSelected ? "border-indigo-500" : "border-gray-500/75"
                    }`}>
                      {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-indigo-500" />}
                    </div>
                  </div>
                );
              })}

              {filteredWarga.length === 0 && (
                <div className="text-center py-12 text-xs text-gray-500 font-medium select-none">
                  Tidak ada nama warga atau No. Rumah yang sesuai.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Resident History Verification Modal Drawer */}
      {historyModalWarga && (() => {
        const citizenPayments = payments.filter((p) => p.wargaId === historyModalWarga.id);
        const formatRupiahLocal = (num: number) => "Rp " + num.toLocaleString("id-ID");
        return (
          <div className="fixed inset-0 bg-[#0A0A0C]/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#111114] border border-[#1E1E24] rounded-md w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-r from-indigo-700 to-indigo-800 text-white p-5 flex justify-between items-start shrink-0">
                <div>
                  <span className="text-[10px] bg-indigo-500/25 border border-indigo-400/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Verifikasi Petugas</span>
                  <h3 className="text-sm font-extrabold mt-1">{historyModalWarga.name}</h3>
                  <p className="text-[10px] text-indigo-200">No. Rumah {historyModalWarga.noHouse} • {activeKelompok?.name}</p>
                </div>
                <button 
                  onClick={() => setHistoryModalWarga(null)}
                  className="p-1.5 bg-black/20 hover:bg-black/40 rounded-sm text-indigo-200 hover:text-white transition cursor-pointer font-extrabold"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* History List Content */}
              <div className="p-4 flex-1 overflow-y-auto space-y-3">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Rekam Transaksi Kolektif ({citizenPayments.length})</p>
                
                {citizenPayments.map((pay) => (
                  <div key={pay.id} className="p-3 bg-[#16161D] border border-[#23232A] rounded-md text-xs space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-bold text-white bg-indigo-600/15 border border-indigo-505/20 px-2 py-0.5 rounded-sm">
                          Bulan {pay.month} {pay.year}
                        </span>
                        <p className="text-[9px] text-gray-500 font-mono mt-1">Dicatat: {new Date(pay.timestamp).toLocaleDateString("id-ID")}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-indigo-400 font-bold block">{formatRupiahLocal(pay.totalAmount)}</span>
                      </div>
                    </div>

                    {/* Breakdown details */}
                    <div className="bg-[#111114] p-2 rounded-sm text-[9px] text-gray-400 space-y-1">
                      {pay.iuranDetails.map((det) => {
                        const conf = IURAN_CONFIGS.find(c => c.id === det.category);
                        return (
                          <div key={det.category} className="flex justify-between">
                            <span>{conf?.name.replace("Iuran ", "") || det.category}</span>
                            <span className="font-mono text-white">{formatRupiahLocal(det.amount)}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Status check with badge */}
                    <div className="flex justify-between items-center pt-1 border-t border-white/5 text-[9px] font-bold">
                      <span className="text-gray-500 uppercase">Status Kas:</span>
                      {pay.statusSetoran === "SUDAH_DISETOR" ? (
                        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm">LUNAS DI BENDAHARA</span>
                      ) : pay.statusSetoran === "PENDING_PERSETUJUAN" ? (
                        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full animate-pulse">PENDING SETORAN</span>
                      ) : (
                        <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-550/20 px-1.5 py-0.5 rounded-sm">DITERIMA PETUGAS</span>
                      )}
                    </div>
                  </div>
                ))}

                {citizenPayments.length === 0 && (
                  <div className="text-center text-gray-500 py-10 flex flex-col items-center gap-1">
                    <FileClock className="h-8 w-8 text-neutral-700" />
                    <span>Warga ini belum membayar iuran apapun di tahun 2026.</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-[#111114] border-t border-[#1E1E24] shrink-0">
                <button 
                  onClick={() => setHistoryModalWarga(null)}
                  className="w-full bg-[#1E1E24] hover:bg-neutral-800 text-gray-300 font-bold py-2 rounded-md text-xs transition border border-[#23232A] cursor-pointer"
                >
                  Tutup Rincian
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
