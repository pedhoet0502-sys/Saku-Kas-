/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, MapPin, Calendar, CheckCircle2, AlertCircle, FileText, Download, Send, CreditCard, ChevronRight, ChevronDown, ChevronUp, Bell, Trash2, Users, Heart } from "lucide-react";
import { Warga, Payment, Kelompok, IuranCategory, IuranConfig, NotificationItem } from "../types";
import { IURAN_CONFIGS, MONTHS_LIST } from "../initialData";

interface WargaDashboardProps {
  wargaList: Warga[];
  payments: Payment[];
  kelompoks: Kelompok[];
  onAddPayment: (payment: Omit<Payment, "id" | "timestamp">) => void;
  activeNotification?: NotificationItem;
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({
  wargaList,
  payments,
  kelompoks,
  onAddPayment,
  activeNotification,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWargaId, setSelectedWargaId] = useState<string>("w-01"); // Default to Pak Budi
  const [paymentSimulationOpen, setPaymentSimulationOpen] = useState(false);
  const [simMonth, setSimMonth] = useState<string>("Maret");
  const [selectedCategories, setSelectedCategories] = useState<IuranCategory[]>([
    IuranCategory.BULANAN,
    IuranCategory.SAMPAH,
    IuranCategory.KEMATIAN,
    IuranCategory.SOSIAL,
  ]);
  const [activeReceiptPayment, setActiveReceiptPayment] = useState<Payment | null>(null);
  const [dashboardTab, setDashboardTab] = useState<"bulanan" | "riwayat">("bulanan");
  const [expandedPaymentIds, setExpandedPaymentIds] = useState<string[]>([]);
  
  // Custom manual collapse tracking for month cards
  const [collapsedMonthsState, setCollapsedMonthsState] = useState<Record<string, boolean>>({});

  const toggleExpandPayment = (id: string) => {
    if (expandedPaymentIds.includes(id)) {
      setExpandedPaymentIds(expandedPaymentIds.filter((pId) => pId !== id));
    } else {
      setExpandedPaymentIds([...expandedPaymentIds, id]);
    }
  };

  // Helper to determine whether a month's accordion is expanded
  const isMonthExpanded = (month: string, isAnyPaid: boolean) => {
    if (collapsedMonthsState[month] !== undefined) {
      return !collapsedMonthsState[month];
    }
    // Default behavior: unpaid is expanded (true), paid (verified) is collapsed (false)
    if (isAnyPaid) {
      const payment = payments.filter((p) => p.wargaId === selectedWargaId).find((p) => p.month === month);
      if (payment && payment.statusSetoran === "SUDAH_DISETOR") {
        return false; // Collapsed by default if verified
      }
    }
    return true; // Expanded by default if unpaid or pending
  };

  const toggleMonthAccordion = (month: string, isAnyPaid: boolean) => {
    const currentlyExpanded = isMonthExpanded(month, isAnyPaid);
    setCollapsedMonthsState({
      ...collapsedMonthsState,
      [month]: currentlyExpanded, // opposite of currentlyExpanded is collapsed
    });
  };

  // Filter warga by search
  const filteredWarga = wargaList.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.noHouse.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedWarga = wargaList.find((w) => w.id === selectedWargaId) || wargaList[0];
  const selectedKelompok = kelompoks.find((k) => k.id === selectedWarga?.kelompokId);

  // Filter payments for selected warga
  const wargaPayments = payments.filter((p) => p.wargaId === selectedWarga?.id);

  // Helper to check status of a category for a month
  const getCategoryStatusForMonth = (month: string, category: IuranCategory) => {
    const payment = wargaPayments.find((p) => p.month === month);
    if (!payment) return "UNPAID";
    const detail = payment.iuranDetails.find((d) => d.category === category);
    if (!detail) return "UNPAID";
    return payment.statusSetoran; // 'BELUM_DISETOR' | 'PENDING_PERSETUJUAN' | 'SUDAH_DISETOR'
  };

  const calculateTotalDueForSimulation = () => {
    return selectedCategories.reduce((sum, cat) => {
      const config = IURAN_CONFIGS.find((c) => c.id === cat);
      return sum + (config ? config.amount : 0);
    }, 0);
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarga || selectedCategories.length === 0) return;

    // Check if payment already exists for this month
    const existingMonthPayment = wargaPayments.find((p) => p.month === simMonth);
    if (existingMonthPayment) {
      alert(`Warga tersebut sudah memiliki rekaman pembayaran untuk bulan ${simMonth}. Silakan pilih bulan lain.`);
      return;
    }

    const details = selectedCategories.map((cat) => {
      const conf = IURAN_CONFIGS.find((c) => c.id === cat);
      return {
        category: cat,
        amount: conf ? conf.amount : 0,
      };
    });

    const hasSpecialIuran = selectedCategories.some(
      cat => cat === IuranCategory.BULANAN || cat === IuranCategory.SAMPAH
    );
    const simulatedOfficerName = hasSpecialIuran
      ? (selectedKelompok?.specialOfficerName || "Pak Heri Gunawan")
      : (selectedKelompok?.officerName || "Bu Eni Hartati");

    const newPayment: Omit<Payment, "id" | "timestamp"> = {
      wargaId: selectedWarga.id,
      wargaName: selectedWarga.name,
      kelompokId: selectedWarga.kelompokId,
      month: simMonth,
      year: 2026,
      iuranDetails: details,
      totalAmount: calculateTotalDueForSimulation(),
      officerName: simulatedOfficerName,
      statusSetoran: "BELUM_DISETOR",
    };

    onAddPayment(newPayment);
    setPaymentSimulationOpen(false);
    // Success simulation modal could trigger
    alert(`Sukses mencatat simulasi pembayaran untuk ${selectedWarga.name} bulan ${simMonth}. Tagihan diterima & diproses oleh ${simulatedOfficerName}.`);
  };

  const toggleCategorySelection = (cat: IuranCategory) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Rupiah formatter
  const formatRupiah = (num: number) => {
    return "Rp " + num.toLocaleString("id-ID");
  };

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Selector Section: Choose Household (Sticky Pinned Header) */}
      <div className="sticky top-0 z-30 bg-[#0B0B0E] pt-4 pb-4 px-4 md:px-6 lg:px-8 -mx-4 -mt-4 md:-mx-6 md:-mt-6 lg:-mx-8 lg:-mt-8 border-b border-[#1E1E24]/80 shadow-xl">
        <label className="block text-xs font-semibold text-slate-400 tracking-wide mb-2">
          Pilih Rumah / Warga
        </label>
        
        <div className="relative mb-3">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-450">
            <Search className="h-4 w-4" />
          </span>
          <input
            id="search-warga-input"
            type="text"
            placeholder="Cari nama Anda atau nomor Rumah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#16161D] border border-[#23232A] rounded-md py-2.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white transition"
          />
        </div>

        {/* Vertical Grid/List for easier vertical selection */}
        <div className="relative overflow-hidden">
          <div className="max-h-56 overflow-y-auto pr-1 pb-4 scrollbar-thin scrollbar-thumb-slate-800/80">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {filteredWarga.map((w) => {
                const klmpk = kelompoks.find((k) => k.id === w.kelompokId);
                const isActive = selectedWargaId === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => setSelectedWargaId(w.id)}
                    className={`py-2 px-3 rounded-md border text-left transition-all h-[54px] flex flex-col justify-center cursor-pointer ${
                      isActive
                        ? "bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/10 text-indigo-400 font-extrabold"
                        : "bg-[#16161D]/90 border-[#23232A] hover:border-gray-700 text-slate-150"
                    }`}
                  >
                    <div className={`font-bold text-xs truncate w-full ${isActive ? "text-indigo-400" : "text-slate-100"}`}>{w.name}</div>
                    <div className="text-[10px] text-slate-300 flex items-center gap-1.5 mt-1 min-w-0">
                      <span className="font-mono bg-[#1E1E24] text-slate-50 px-1 py-0.2 rounded shrink-0 font-medium">{w.noHouse}</span>
                      <span className="text-gray-500">•</span>
                      <span className="truncate text-slate-300">{klmpk?.name.replace("Dasawisma ", "")}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {filteredWarga.length === 0 && (
              <div className="text-xs text-gray-500 py-4 text-center bg-[#16161D]/40 rounded-md border border-dashed border-[#23232A]">
                Nama tidak ditemukan. Coba ketik nama lain.
              </div>
            )}
          </div>
          {/* Elegant Gradient Fade to bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/90 to-transparent pointer-events-none z-10" />
        </div>
      </div>

      {/* Active Notification Banner Alert */}
      {activeNotification && (
        <div className="bg-gradient-to-r from-indigo-950/20 to-indigo-900/10 border border-indigo-500/25 p-4 rounded-md flex gap-3 items-start animate-pulse-once">
          <div className="bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 p-2.5 rounded-sm flex items-center justify-center shrink-0 shadow-inner">
            <Bell className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">Pengumuman Resmi RT</span>
              <span className="text-[8px] text-gray-500 font-mono">Pemberitahuan</span>
            </div>
            <h4 className="text-xs font-bold text-white mt-1 break-words">{activeNotification.title}</h4>
            <p className="text-[10px] text-gray-300 mt-0.5 leading-relaxed break-words">{activeNotification.message}</p>
            <div className="flex gap-4 text-[8px] text-indigo-400 font-bold uppercase mt-2.5">
              <span>📅 Jatuh Tempo: Tanggal {activeNotification.dueDate}</span>
              <span>🔔 Terjadwal: H-{activeNotification.daysBefore} Hari</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. Resident Profile Card */}
      {selectedWarga && (
        <div className="bg-gradient-to-br from-[#16161D] to-[#111114] border border-[#1E1E24] text-white p-5 rounded-md shadow-md relative overflow-hidden">
          {/* Subtle green ambient spot */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] bg-indigo-550/20 text-indigo-400 border border-indigo-550/30 px-2 py-0.5 rounded-full font-semibold uppercase">
                {selectedKelompok?.name || "Kelompok Dasawisma"}
              </span>
              <h2 className="text-lg font-bold mt-1 text-slate-100">
                {selectedWarga.name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-1">
                <MapPin className="h-3 w-3 text-slate-400" />
                <span>No. {selectedWarga.noHouse} ({selectedWarga.address})</span>
              </div>
            </div>
            <div className="bg-[#1E1E24]/80 border border-[#23232A] p-3 rounded-md flex flex-col items-center">
              <span className="text-[9px] text-slate-405 font-bold uppercase tracking-wider">No Rumah</span>
              <span className="text-lg font-mono font-extrabold text-indigo-400">{selectedWarga.noHouse}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#1E1E24] text-xs">
            <div className="border-r border-[#1E1E24] pr-2">
              <p className="text-gray-400 font-bold text-[9px] uppercase tracking-wider mb-1">🌸 1. Petugas Dasawisma</p>
              <p className="text-[10px] text-gray-550 leading-none">Menangani: Kematian & Sosial</p>
              <p className="font-extrabold text-slate-200 mt-1">{selectedKelompok?.officerName || "Bu Eni Hartati"}</p>
              <a 
                href={`https://wa.me/${(selectedKelompok?.officerPhone || "").replace(/[^0-9]/g, "")}`} 
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline mt-1 block font-mono animate-fade-in"
              >
                {selectedKelompok?.officerPhone || "0812-xxxx-xxxx"}
              </a>
            </div>
            <div className="pl-1">
              <p className="text-gray-400 font-bold text-[9px] uppercase tracking-wider mb-1">⚡ 2. Petugas Khusus</p>
              <p className="text-[10px] text-gray-550 leading-none">Menangani: Bulanan & Sampah</p>
              <p className="font-extrabold text-slate-200 mt-1">{selectedKelompok?.specialOfficerName || "Pak Heri Gunawan"}</p>
              <a 
                href={`https://wa.me/${(selectedKelompok?.specialOfficerPhone || "").replace(/[^0-9]/g, "")}`} 
                className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline mt-1 block font-mono animate-fade-in"
              >
                {selectedKelompok?.specialOfficerPhone || "0812-xxxx-xxxx"}
              </a>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              id="warga-simulate-pay-btn"
              onClick={() => {
                // Find next unpaid month from available list to prefill beautifully
                const paidMonths = wargaPayments.map(p => p.month);
                const nextUnpaid = MONTHS_LIST.find(m => !paidMonths.includes(m)) || "Maret";
                setSimMonth(nextUnpaid);
                setPaymentSimulationOpen(true);
              }}
              className="flex-1 bg-indigo-600 hover:bg-indigo-750 active:bg-indigo-800 text-white py-2.5 px-4 rounded-md text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/15"
            >
              <CreditCard className="h-4 w-4" />
              <span>Simulasi Bayar Iuran</span>
            </button>
          </div>
        </div>
      )}
      {/* 3. Segmented Navigation: Status Bulanan vs Riwayat Pembayaran */}
      <div className="bg-[#111114] p-5 rounded-md border border-[#1E1E24] shadow-md mt-6">
        <div className="flex bg-black/40 p-1 rounded-md border border-[#1E1E24] mb-4">
          <button
            onClick={() => setDashboardTab("bulanan")}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded transition-all cursor-pointer ${
              dashboardTab === "bulanan"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Status Iuran
          </button>
          <button
            onClick={() => setDashboardTab("riwayat")}
            className={`flex-1 py-1.5 text-center text-xs font-bold rounded transition-all cursor-pointer ${
              dashboardTab === "riwayat"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Riwayat Pembayaran
          </button>
        </div>

        {dashboardTab === "bulanan" ? (
          <div>
            <h3 className="text-xs font-semibold text-slate-400 tracking-wide mb-4 flex items-center justify-between">
              <span>Ringkasan Iuran Warga (2026)</span>
              <span className="text-[10px] font-normal text-indigo-400 font-mono">Status Lapor</span>
            </h3>

            <div className="flex flex-col gap-3.5">
              {MONTHS_LIST.slice(0, 6).map((month) => {
                const correspondingPayment = wargaPayments.find((p) => p.month === month);
                const isAnyPaid = !!correspondingPayment;
                const expanded = isMonthExpanded(month, isAnyPaid);
                
                return (
                  <div 
                    key={month} 
                    className={`rounded-md border transition-all duration-200 overflow-hidden ${
                      isAnyPaid 
                        ? "bg-[#16161D]/60 border-[#1E1E24]" 
                        : "bg-rose-500/[0.03] border-rose-500/15"
                    }`}
                  >
                    {/* Header Clickable trigger zone */}
                    <div 
                      onClick={() => toggleMonthAccordion(month, isAnyPaid)}
                      className="p-3.5 flex justify-between items-center cursor-pointer select-none hover:bg-white/[0.02] transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="font-bold text-sm text-slate-200">{month} 2026</span>
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        {isAnyPaid ? (
                          <div className="flex items-center gap-1.5">
                            {correspondingPayment.statusSetoran === "SUDAH_DISETOR" ? (
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shadow-sm">
                                <CheckCircle2 className="h-3 w-3" /> Lunas
                              </span>
                            ) : correspondingPayment.statusSetoran === "PENDING_PERSETUJUAN" ? (
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full animate-pulse shadow-sm">
                                Proses Setoran
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full shadow-sm">
                                Diterima Petugas
                              </span>
                            )}
                            
                            {/* Button to see mini-receipt */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid toggling accordion
                                setActiveReceiptPayment(correspondingPayment);
                              }}
                              className="p-1 hover:bg-[#1E1E24] rounded text-slate-400 hover:text-indigo-400 transition cursor-pointer"
                              title="Lihat Bukti"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-rose-400 bg-rose-950/40 border border-rose-500/50 px-2 py-0.5 rounded-full shadow-sm">
                            <AlertCircle className="h-3 w-3 text-rose-400 animate-pulse" /> Belum Dibayar
                          </span>
                        )}

                        {/* Toggle indicators */}
                        <div className="text-slate-500 p-0.5 hover:text-white transition">
                          {expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Collapsible Content */}
                    {expanded && (
                      <div className="px-3.5 pb-3.5 pt-0.5 border-t border-[#1E1E24]/40 animate-fade-in">
                        {/* Sub items row represent different categories */}
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          {IURAN_CONFIGS.map((config) => {
                            const status = getCategoryStatusForMonth(month, config.id);
                            let pillBg = "bg-[#1E1E24] border-[#23232A] text-slate-450";
                            let stateText = "Belum";

                            if (status === "SUDAH_DISETOR") {
                              pillBg = "bg-emerald-600 border-transparent text-white animate-pulse-once";
                              stateText = "Lunas";
                            } else if (status === "PENDING_PERSETUJUAN") {
                              pillBg = "bg-amber-600 border-transparent text-white";
                              stateText = "Proses";
                            } else if (status === "BELUM_DISETOR") {
                              pillBg = "bg-indigo-600 border-transparent text-white";
                              stateText = "Diterima";
                            }

                            // Choose icon
                            let categoryIcon = null;
                            if (config.id === "BULANAN") {
                              categoryIcon = <Calendar className="h-3.5 w-3.5" />;
                            } else if (config.id === "SAMPAH") {
                              categoryIcon = <Trash2 className="h-3.5 w-3.5" />;
                            } else if (config.id === "KEMATIAN") {
                              categoryIcon = <Heart className="h-3.5 w-3.5" />;
                            } else if (config.id === "SOSIAL") {
                              categoryIcon = <Users className="h-3.5 w-3.5" />;
                            }

                            // Short translation
                            let shortName = config.name.replace("Iuran ", "");
                            if (shortName === "Kebersihan & Sampah") shortName = "Sampah";
                            if (shortName === "Bulanan RT") shortName = "Wajib RT";

                            return (
                              <div 
                                key={config.id} 
                                className={`py-2 px-1 rounded-sm text-center border text-[8px] font-bold flex flex-col items-center justify-between gap-1 min-h-[54px] shadow-sm ${pillBg}`}
                                title={`${config.name}: ${stateText}`}
                              >
                                <div className="opacity-80 shrink-0">{categoryIcon}</div>
                                <span className="truncate w-full block max-w-full font-sans text-[7.5px] tracking-tight leading-none mt-0.5">{shortName}</span>
                                <span className="opacity-95 font-mono text-[7px] bg-black/25 px-1 py-0.2 rounded-full leading-none">{stateText}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Amount note if paid */}
                        {isAnyPaid && (
                          <div className="mt-3.5 pt-2 border-t border-[#1E1E24]/60 flex justify-between items-center text-[10px] text-slate-400">
                            <span>Kolektor: <span className="font-semibold text-slate-300">{correspondingPayment.officerName}</span></span>
                            <span className="font-extrabold text-slate-200">Total: {formatRupiah(correspondingPayment.totalAmount)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 animate-fade-in text-xs">
            <h3 className="text-xs font-semibold text-gray-400 tracking-wide mb-3 flex items-center justify-between">
              <span>Semua Riwayat Transaksi</span>
              <span className="text-[10px] bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full font-bold">{wargaPayments.length} KK</span>
            </h3>

            <div className="flex flex-col gap-3 max-h-[550px] overflow-y-auto pr-1">
              {wargaPayments.slice().reverse().map((payment) => {
                const isExpanded = expandedPaymentIds.includes(payment.id);
                return (
                  <div key={payment.id} className="bg-[#16161D] border border-[#23232A] rounded-md flex flex-col gap-2.5 transition hover:border-neutral-750 overflow-hidden">
                    {/* Header Clickable Zone for Expand/Collapse */}
                    <div 
                      onClick={() => toggleExpandPayment(payment.id)}
                      className="p-4 pb-1.5 flex justify-between items-start cursor-pointer select-none hover:bg-white/[0.02] transition"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full select-none">
                            Iuran Bulan {payment.month} {payment.year}
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono">ID: {payment.id}</span>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono mt-1.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-600" />
                          {new Date(payment.timestamp).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <div className="text-right">
                          <p className="text-[9px] text-gray-450 uppercase font-bold tracking-wider">Total Bayar</p>
                          <p className="font-mono font-extrabold text-indigo-400 text-sm mt-0.5">{formatRupiah(payment.totalAmount)}</p>
                        </div>
                        <div className="mt-1 p-1 bg-[#1E1E24] rounded-sm text-gray-400 hover:text-white transition">
                          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable Breakdown Details Section */}
                    {isExpanded ? (
                      <div className="px-4 pb-1.5 animate-fade-in space-y-2">
                        <div className="bg-[#111114] p-3 border border-[#1E1E24] rounded-sm text-[10px] space-y-2">
                          <span className="block text-[8px] font-extrabold uppercase text-gray-500 tracking-wider select-none">
                            Rincian Pembayaran Per Kategori
                          </span>
                          <div className="space-y-2 divide-y divide-white/5">
                            {payment.iuranDetails.map((det) => {
                              const conf = IURAN_CONFIGS.find((c) => c.id === det.category);
                              
                              // Select category status labels
                              let statusBadge = null;
                              if (payment.statusSetoran === "SUDAH_DISETOR") {
                                statusBadge = (
                                  <span className="text-[7.5px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1 py-0.5 rounded font-bold tracking-wide uppercase">
                                    Verified by Treasurer
                                  </span>
                                );
                              } else if (payment.statusSetoran === "PENDING_PERSETUJUAN") {
                                statusBadge = (
                                  <span className="text-[7.5px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1 py-0.5 rounded font-bold tracking-wide uppercase animate-pulse">
                                    Pending Verification
                                  </span>
                                );
                              } else {
                                statusBadge = (
                                  <span className="text-[7.5px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1 py-0.5 rounded font-bold tracking-wide uppercase">
                                    Paid by Officer
                                  </span>
                                );
                              }

                              return (
                                <div key={det.category} className="flex justify-between items-center pt-2 first:pt-0">
                                  <div className="space-y-1">
                                    <span className="text-gray-300 font-bold block text-xs">
                                      {conf?.name || det.category}
                                    </span>
                                    <div className="flex items-center">
                                      {statusBadge}
                                    </div>
                                  </div>
                                  <span className="font-mono font-bold text-white text-xs">{formatRupiah(det.amount)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={() => toggleExpandPayment(payment.id)}
                        className="mx-4 px-3 py-2 bg-[#111114] border border-dashed border-[#1E1E24] rounded-sm flex items-center justify-between text-[9px] text-gray-500 cursor-pointer hover:text-gray-300 hover:border-gray-700 transition"
                      >
                        <span>Terdiri dari {payment.iuranDetails.length} kategori iuran</span>
                        <span className="font-semibold text-indigo-400 underline">Klik untuk Detail Rincian</span>
                      </div>
                    )}

                    <div className="px-4 pb-4 pt-2.5 flex justify-between items-center border-t border-[#1E1E24]/40 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        {payment.statusSetoran === "SUDAH_DISETOR" ? (
                          <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full select-none uppercase">
                            Lunas / Verified
                          </span>
                        ) : payment.statusSetoran === "PENDING_PERSETUJUAN" ? (
                          <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full select-none uppercase animate-pulse">
                            Pending Setoran
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[8.5px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full select-none uppercase">
                            Diterima / Pending Bendahara
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => setActiveReceiptPayment(payment)}
                        className="text-[10.5px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer py-1 px-1.5 hover:bg-[#1E1E24] rounded-sm transition"
                      >
                        <span>Lihat Slip Bayar</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {wargaPayments.length === 0 && (
                <div className="text-center text-gray-500 text-xs py-10">
                  <FileText className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                  <span>Belum ada catatan transaksi pembayaran iuran untuk warga ini.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 4. Payment Simulation Modal Dialog (Traditional flow but beautiful UI overlay) */}
      {paymentSimulationOpen && (
        <div className="fixed inset-0 bg-[#0A0A0C]/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111114] border border-[#1E1E24] rounded-md w-full max-w-sm overflow-hidden shadow-2xl animate-fade-in">
            <div className="bg-indigo-600 text-white p-5">
              <h3 className="text-base font-bold">Simulasi Pembayaran Mandiri</h3>
              <p className="text-xs text-indigo-200 mt-1">Simulasikan warga membayar lagsung ke petugas kelompok Dasawisma.</p>
            </div>

            <form onSubmit={handleSimulatePayment} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Nama Warga</label>
                <input 
                  type="text" 
                  disabled 
                  value={`${selectedWarga?.name} (${selectedWarga?.noHouse})`} 
                  className="w-full bg-[#16161D] border border-[#23232A] rounded-md px-3 py-2 text-sm text-gray-400 cursor-not-allowed animate-pulse"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Pilih Bulan Pembayaran</label>
                <select
                  value={simMonth}
                  onChange={(e) => setSimMonth(e.target.value)}
                  className="w-full bg-[#16161D] border border-[#23232A] text-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {MONTHS_LIST.slice(0, 6).map((m) => (
                    <option key={m} value={m}>{m} 2026</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Jenis Iuran yang Dibayar</label>
                <div className="flex flex-col gap-2 font-sans">
                  {IURAN_CONFIGS.map((config) => {
                    const isChecked = selectedCategories.includes(config.id);
                    return (
                      <div 
                        key={config.id}
                        onClick={() => toggleCategorySelection(config.id)}
                        className={`flex justify-between items-center p-2.5 rounded-md border cursor-pointer transition ${
                          isChecked 
                            ? "bg-indigo-550/10 border-indigo-500 text-indigo-400" 
                            : "border-[#23232A] text-gray-305 hover:bg-[#16161D]"
                        }`}
                      >
                        <div className="flex items-center gap-2 font-sans">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => {}} // Hanled by parent click
                            className="rounded border-gray-600 bg-[#0A0A0C] text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-semibold">{config.name}</span>
                        </div>
                        <span className="text-xs font-mono font-bold">{formatRupiah(config.amount)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#16161D] p-3 rounded-md border border-[#1E1E24] mt-1 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400">Total Pembayaran:</span>
                <span className="text-base font-extrabold text-white">{formatRupiah(calculateTotalDueForSimulation())}</span>
              </div>

              <div className="flex gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setPaymentSimulationOpen(false)}
                  className="flex-1 py-2.5 border border-[#1E1E24] hover:bg-[#16161D] rounded-md text-xs font-bold text-gray-400 transition"
                >
                  Batal
                </button>
                <button
                  id="submit-simulation-payment"
                  type="submit"
                  disabled={selectedCategories.length === 0}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-770 active:bg-indigo-805 text-white rounded-md text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Kirim ke Petugas</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Receipt details view modal */}
      {activeReceiptPayment && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111114] border border-[#1E1E24] rounded-md w-full max-w-sm overflow-hidden shadow-2xl relative">
            {/* Stamp mock water-mark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-4 border-dashed border-indigo-500/15 text-indigo-500/15 font-mono text-2xl font-extrabold px-3 py-1 rotate-12 rounded pointer-events-none select-none uppercase tracking-widest text-center">
              RT 05 / RW 02<br />LUNAS
            </div>

            <div className="bg-indigo-950/25 border-b border-[#1E1E24] p-5 text-center flex flex-col items-center">
              <CheckCircle2 className="h-10 w-10 text-indigo-400 mb-2" />
              <h3 className="text-sm font-bold text-white">Bukti Penerimaan Iuran RT</h3>
              <p className="text-[10px] text-gray-500 font-mono tracking-wider mt-0.5 uppercase">ID: {activeReceiptPayment.id}</p>
            </div>

            <div className="p-5 flex flex-col gap-3 text-xs text-gray-300">
              <div className="flex justify-between items-center py-1 border-b border-[#1E1E24]">
                <span className="text-gray-400">Pembayar:</span>
                <span className="font-bold text-white">{activeReceiptPayment.wargaName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E1E24]">
                <span className="text-gray-400">Periode Bulan:</span>
                <span className="font-bold text-white">{activeReceiptPayment.month} 2026</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E1E24]">
                <span className="text-gray-400">Diterima Oleh Petugas:</span>
                <span className="font-bold text-white">{activeReceiptPayment.officerName}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#1E1E24]">
                <span className="text-gray-400">Tanggal Bayar:</span>
                <span className="font-mono text-white">{new Date(activeReceiptPayment.timestamp).toLocaleString("id-ID", { dateStyle: "medium" })}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Status Setoran Bendahara:</span>
                <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] ${
                  activeReceiptPayment.statusSetoran === "SUDAH_DISETOR" 
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                    : activeReceiptPayment.statusSetoran === "PENDING_PERSETUJUAN"
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                }`}>
                  {activeReceiptPayment.statusSetoran === "SUDAH_DISETOR" ? "Disetujui Bendahara" : "Disimpan Petugas"}
                </span>
              </div>

              <div className="bg-[#16161D] p-3 rounded-md border border-[#23232A] mt-2">
                <p className="font-bold text-gray-450 text-[10px] mb-1.5 uppercase tracking-wider">Rincian Pembayaran:</p>
                <div className="flex flex-col gap-1.5 font-mono">
                  {activeReceiptPayment.iuranDetails.map(det => {
                    const conf = IURAN_CONFIGS.find(c => c.id === det.category);
                    return (
                      <div key={det.category} className="flex justify-between text-[11px] text-gray-350">
                        <span>• {conf?.name.replace("Iuran ", "")}</span>
                        <span>{formatRupiah(det.amount)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-[#1E1E24] mt-2.5 pt-2 flex justify-between font-bold text-white">
                  <span>TOTAL BEBAN:</span>
                  <span>{formatRupiah(activeReceiptPayment.totalAmount)}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-[#16161D] border-t border-[#1E1E24] flex gap-2">
              <button
                onClick={() => {
                  alert("Fitur simpan PDF tersimulasi! Bukti penerimaan telah diunduh ke ponsel Anda.");
                }}
                className="flex-1 py-2 px-3 bg-[#111114] border border-[#1E1E24] hover:bg-black text-indigo-400 rounded-md text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Simpan Gambar</span>
              </button>
              <button
                onClick={() => setActiveReceiptPayment(null)}
                className="flex-1 py-2 px-3 border border-[#1E1E24] bg-[#111114] hover:bg-black text-gray-300 rounded-md text-xs font-bold transition text-center"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
