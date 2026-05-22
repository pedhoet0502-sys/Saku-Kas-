/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, TouchEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "./components/Header";
import { WargaDashboard } from "./components/WargaDashboard";
import { PetugasDashboard } from "./components/PetugasDashboard";
import { BendaharaDashboard } from "./components/BendaharaDashboard";
import { Payment, SetoranSubmission, Warga, Kelompok, NotificationConfig, NotificationItem } from "./types";
import { 
  INITIAL_KELOMPOK, 
  INITIAL_WARGA, 
  INITIAL_PAYMENTS, 
  INITIAL_SETORAN 
} from "./initialData";
import { Info, HelpCircle, Heart, ArrowUpRight, Bell, X, Volume2, User, Users, ShieldAlert } from "lucide-react";

export default function App() {
  // Roles toggling
  const [currentRole, setCurrentRole] = useState<"warga" | "petugas" | "bendahara">("warga");
  const [direction, setDirection] = useState<number>(0);
  const [activeKelompokId, setActiveKelompokId] = useState<string>("dw-01");
  const [officerType, setOfficerType] = useState<"dasawisma" | "khusus">("dasawisma");

  // State populated from LocalStorage or defaults
  const [payments, setPayments] = useState<Payment[]>([]);
  const [submissions, setSubmissions] = useState<SetoranSubmission[]>([]);
  const [wargaList, setWargaList] = useState<Warga[]>([]);
  const [kelompoks, setKelompoks] = useState<Kelompok[]>([]);

  // Notification reminder states
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>({
    title: "Pengingat Tagihan Iuran RT",
    message: "Yth. Warga RT 05, jatah pembayaran iuran bulan ini sudah diterbitkan. Mohon persiapkan dana Anda sebelum tanggal jatuh tempo.",
    dueDate: "10",
    daysBefore: 3,
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "notif-1",
      title: "Pemberitahuan Tagihan Iuran Mei",
      message: "Yth. Warga RT 05, batas pembayaran iuran bulan Mei 2026 adalah tanggal 10 Mei. Mohon persiapkan pembayaran melalui Dasawisma Anda.",
      dueDate: "10",
      daysBefore: 3,
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
      isRead: false,
    },
    {
      id: "notif-2",
      title: "Sosialisasi Fitur Saku Iuran",
      message: "Selamat datang di aplikasi Saku Iuran Android! Sekarang warga dapat mensimulasikan pembayaran langsung ke petugas Dasawisma masing-masing dan tracking status verifikasi lunas.",
      dueDate: "10",
      daysBefore: 3,
      timestamp: new Date(Date.now() - 3600000 * 120).toISOString(), // 5 days ago
      isRead: true,
    }
  ]);

  const [activePush, setActivePush] = useState<{ title: string; message: string } | null>(null);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState(false);

  // Load from static or localStorage on mount
  useEffect(() => {
    const savedPayments = localStorage.getItem("saku_rt_payments");
    const savedSubmissions = localStorage.getItem("saku_rt_submissions");
    const savedNotifications = localStorage.getItem("saku_rt_notifications");
    const savedNotifConfig = localStorage.getItem("saku_rt_notif_config");
    const savedWarga = localStorage.getItem("saku_rt_warga");
    const savedKelompoks = localStorage.getItem("saku_rt_kelompoks");

    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      setPayments(INITIAL_PAYMENTS);
    }

    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    } else {
      setSubmissions(INITIAL_SETORAN);
    }

    if (savedWarga) {
      setWargaList(JSON.parse(savedWarga));
    } else {
      setWargaList(INITIAL_WARGA);
    }

    if (savedKelompoks) {
      setKelompoks(JSON.parse(savedKelompoks));
    } else {
      setKelompoks(INITIAL_KELOMPOK);
    }

    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    if (savedNotifConfig) {
      setNotificationConfig(JSON.parse(savedNotifConfig));
    }
  }, []);

  // Save to localStorage whenever state modifies
  const savePaymentsToLocalStorage = (newPayments: Payment[]) => {
    setPayments(newPayments);
    localStorage.setItem("saku_rt_payments", JSON.stringify(newPayments));
  };

  const saveSubmissionsToLocalStorage = (newSubmissions: SetoranSubmission[]) => {
    setSubmissions(newSubmissions);
    localStorage.setItem("saku_rt_submissions", JSON.stringify(newSubmissions));
  };

  const saveWargaToLocalStorage = (newWarga: Warga[]) => {
    setWargaList(newWarga);
    localStorage.setItem("saku_rt_warga", JSON.stringify(newWarga));
  };

  const saveKelompoksToLocalStorage = (newKelompoks: Kelompok[]) => {
    setKelompoks(newKelompoks);
    localStorage.setItem("saku_rt_kelompoks", JSON.stringify(newKelompoks));
  };

  const saveNotificationsToLocalStorage = (newNotifs: NotificationItem[]) => {
    setNotifications(newNotifs);
    localStorage.setItem("saku_rt_notifications", JSON.stringify(newNotifs));
  };

  const saveNotifConfigToLocalStorage = (newConfig: NotificationConfig) => {
    setNotificationConfig(newConfig);
    localStorage.setItem("saku_rt_notif_config", JSON.stringify(newConfig));
  };

  // Push Trigger Helper
  const triggerPushNotification = (title: string, message: string) => {
    setActivePush({ title, message });
    setTimeout(() => {
      setActivePush(null);
    }, 5000);
  };

  // Admin triggers a broadcast message
  const handleSendBroadcast = (config: NotificationConfig) => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: config.title,
      message: config.message,
      dueDate: config.dueDate,
      daysBefore: config.daysBefore,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    const updated = [newNotif, ...notifications];
    saveNotificationsToLocalStorage(updated);
    saveNotifConfigToLocalStorage({ ...config, lastSent: new Date().toISOString() });
    
    // Simulate real Android sliding notifications toast
    triggerPushNotification(config.title, config.message);
  };

  const handleMarkNotificationsAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    saveNotificationsToLocalStorage(updated);
  };

  // Add a new payment record (used by Warga simulation and Petugas directly)
  const handleAddPayment = (rawPayment: Omit<Payment, "id" | "timestamp">) => {
    const newPayment: Payment = {
      ...rawPayment,
      id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newPayment, ...payments];
    savePaymentsToLocalStorage(updated);
  };

  // Officer submits collections to Treasurer
  const handleSubmitSetoran = (rawSubmission: Omit<SetoranSubmission, "id" | "timestamp">) => {
    const subId = `setor-${Date.now()}`;
    const newSubmission: SetoranSubmission = {
      ...rawSubmission,
      id: subId,
      timestamp: new Date().toISOString(),
      status: "PENDING",
    };

    // Update the state of payments bundled inside this submission to PENDING_PERSETUJUAN
    const updatedPayments = payments.map((p) => {
      if (rawSubmission.paymentIds.includes(p.id)) {
        return {
          ...p,
          statusSetoran: "PENDING_PERSETUJUAN" as const,
          setoranId: subId,
        };
      }
      return p;
    });

    savePaymentsToLocalStorage(updatedPayments);
    saveSubmissionsToLocalStorage([...submissions, newSubmission]);
  };

  // Treasurer approves / accepts a submission
  const handleApproveSubmission = (id: string) => {
    const targetSub = submissions.find((s) => s.id === id);
    if (!targetSub) return;

    // Update submission status to DISETUJUI
    const updatedSubmissions = submissions.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          status: "DISETUJUI" as const,
          verificationTimestamp: new Date().toISOString(),
        };
      }
      return s;
    });

    // Update all payments inside this submission to SUDAH_DISETOR
    const updatedPayments = payments.map((p) => {
      if (targetSub.paymentIds.includes(p.id)) {
        return {
          ...p,
          statusSetoran: "SUDAH_DISETOR" as const,
        };
      }
      return p;
    });

    savePaymentsToLocalStorage(updatedPayments);
    saveSubmissionsToLocalStorage(updatedSubmissions);
  };

  // Reset helper
  const handleResetAllData = () => {
    setPayments(INITIAL_PAYMENTS);
    setSubmissions(INITIAL_SETORAN);
    setWargaList(INITIAL_WARGA);
    setKelompoks(INITIAL_KELOMPOK);
    localStorage.removeItem("saku_rt_payments");
    localStorage.removeItem("saku_rt_submissions");
    localStorage.removeItem("saku_rt_warga");
    localStorage.removeItem("saku_rt_kelompoks");
  };

  // Swipe mechanics to navigate between roles
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartX === null || touchStartY === null) return;

    const touch = e.changedTouches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    const roleOrder: Array<"warga" | "petugas" | "bendahara"> = ["warga", "petugas", "bendahara"];
    const currentIndex = roleOrder.indexOf(currentRole);

    // Horizontal swipe threshold: 60px distance, and horizontal direction should dominate
    if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 60) {
      if (diffX < 0) {
        // Swiped left -> Next Role (warga -> petugas -> bendahara)
        if (currentIndex < roleOrder.length - 1) {
          const nextRole = roleOrder[currentIndex + 1];
          setDirection(1);
          setCurrentRole(nextRole);
          triggerPushNotification(
            "Ubah Tampilan", 
            `Bergeser ke dashboard ${nextRole.charAt(0).toUpperCase() + nextRole.slice(1)}`
          );
        }
      } else {
        // Swiped right -> Previous Role (bendahara -> petugas -> warga)
        if (currentIndex > 0) {
          const prevRole = roleOrder[currentIndex - 1];
          setDirection(-1);
          setCurrentRole(prevRole);
          triggerPushNotification(
            "Ubah Tampilan", 
            `Bergeser ke dashboard ${prevRole.charAt(0).toUpperCase() + prevRole.slice(1)}`
          );
        }
      }
    }

    setTouchStartX(null);
    setTouchStartY(null);
  };

  // Active officer calculations
  const activeKelompok = kelompoks.find((k) => k.id === activeKelompokId) || kelompoks[0] || { id: "", name: "TANPA KELOMPOK", officerName: "Petugas Kelompok", officerPhone: "" };

  return (
    <div className="h-screen w-full bg-[#0A0A0C] text-gray-200 flex flex-col select-none font-sans overflow-hidden">
      
      {/* 2. Main Dashboard Panel */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-grow flex flex-col min-w-0 bg-[#0B0B0E] relative overflow-y-auto pb-16 scrollbar-thin scrollbar-thumb-slate-800"
      >
        
        {/* Real Android Slide-down Push Notification Banner */}
        {activePush && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-[#16161D]/95 border border-indigo-500/30 backdrop-blur-md rounded-md p-4 shadow-2xl flex gap-3 items-start animate-fade-in ring-1 ring-black/40">
            <div className="bg-indigo-600 text-white p-2 rounded-sm flex items-center justify-center shrink-0">
              <Bell className="h-4.5 w-4.5 animate-bounce" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Notifikasi RT</span>
                <span className="text-[9px] text-gray-500 font-mono">Baru saja</span>
              </div>
              <h4 className="text-xs font-bold text-white mt-1 truncate">{activePush.title}</h4>
              <p className="text-[10px] text-gray-300 mt-0.5 leading-relaxed">{activePush.message}</p>
            </div>
            <button onClick={() => setActivePush(null)} className="text-gray-450 hover:text-white p-1 cursor-pointer">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <Header
          currentRole={currentRole}
          onChangeRole={(role) => {
            const roleOrder: Array<"warga" | "petugas" | "bendahara"> = ["warga", "petugas", "bendahara"];
            const prevIndex = roleOrder.indexOf(currentRole);
            const nextIndex = roleOrder.indexOf(role as any);
            if (nextIndex !== -1 && prevIndex !== -1) {
              setDirection(nextIndex > prevIndex ? 1 : -1);
            }
            setCurrentRole(role);
          }}
          kelompoks={kelompoks}
          activeKelompokId={activeKelompokId}
          onChangeKelompok={(id) => setActiveKelompokId(id)}
          activeOfficerName={
            officerType === "dasawisma"
              ? (activeKelompok?.officerName || "Petugas Dasawisma")
              : (activeKelompok?.specialOfficerName || "Petugas Khusus Bulanan & Sampah")
          }
          officerType={officerType}
          onChangeOfficerType={setOfficerType}
          unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
          onOpenNotifications={() => {
            setNotificationsModalOpen(true);
            handleMarkNotificationsAsRead();
          }}
        />

        {/* Main Simulated Screen Contents Area */}
        <main className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentRole}
              custom={direction}
              initial={{ opacity: 0, x: direction * 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 50 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full flex-1 flex flex-col gap-6"
            >
              {currentRole === "warga" && (
                <WargaDashboard
                  wargaList={wargaList}
                  payments={payments}
                  kelompoks={kelompoks}
                  onAddPayment={handleAddPayment}
                  activeNotification={notifications[0]} // Pass actual latest notification reminder
                />
              )}

              {currentRole === "petugas" && (
                <PetugasDashboard
                  activeKelompokId={activeKelompokId}
                  kelompoks={kelompoks}
                  wargaList={wargaList}
                  payments={payments}
                  submissions={submissions}
                  onAddPayment={handleAddPayment}
                  onSubmitSetoran={handleSubmitSetoran}
                  onChangeKelompok={setActiveKelompokId}
                  officerType={officerType}
                  onChangeOfficerType={setOfficerType}
                />
              )}

              {currentRole === "bendahara" && (
                <BendaharaDashboard
                  payments={payments}
                  submissions={submissions}
                  kelompoks={kelompoks}
                  onApproveSubmission={handleApproveSubmission}
                  onResetAllData={handleResetAllData}
                  notificationConfig={notificationConfig}
                  onSendBroadcast={handleSendBroadcast}
                  onUpdateWargaList={saveWargaToLocalStorage}
                  onUpdateKelompoks={saveKelompoksToLocalStorage}
                  wargaList={wargaList}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Real Android Contained Messages Modal Overlay */}
        {notificationsModalOpen && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col">
            <div className="bg-[#111114] border-b border-[#1E1E24] p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-indigo-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Kotak Pesan & Notifikasi</h3>
                  <p className="text-[10px] text-gray-500">Pemberitahuan Resmi RT 05</p>
                </div>
              </div>
              <button 
                onClick={() => setNotificationsModalOpen(false)}
                className="p-1.5 bg-[#1E1E24] hover:bg-neutral-850 rounded-md text-gray-400 hover:text-white transition cursor-pointer border border-[#23232A]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-3">
              <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-md p-3 flex gap-2.5 items-center">
                <Volume2 className="h-4 w-4 text-indigo-400 shrink-0" />
                <p className="text-[10px] text-indigo-200">Menyinkronkan pengumuman RT penting langsung ke handphone Anda.</p>
              </div>

              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 bg-[#16161D] border border-[#23232A] rounded-md flex gap-3 items-start transition hover:border-[#2C2C35]">
                  <div className="bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 p-2 rounded-sm shrink-0">
                    <Bell className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-bold text-white leading-snug break-words">{notif.title}</h4>
                      <span className="text-[9px] font-mono text-gray-500 shrink-0 select-none">
                        {new Date(notif.timestamp).toLocaleDateString("id-ID", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed break-words">{notif.message}</p>
                    <div className="mt-2.5 pt-2 border-t border-[#1E1E24] flex items-center justify-between text-[8px] text-indigo-400 font-semibold tracking-wide uppercase">
                      <span>📅 JATUH TEMPO: TANGGAL {notif.dueDate}</span>
                      <span>🔔 H-{notif.daysBefore} HARI</span>
                    </div>
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-xs text-center text-gray-500 py-12 flex flex-col items-center gap-2">
                  <Bell className="h-8 w-8 text-neutral-700" />
                  <span>Kotak pesan Anda kosong.</span>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-[#111114] border-t border-[#1E1E24]">
              <button 
                onClick={() => setNotificationsModalOpen(false)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md text-xs shadow-lg transition text-center cursor-pointer"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Bottom Navigation Bar */}
      <div 
        id="bottom-navigation-bar"
        className="z-40 bg-[#121216] border-t border-[#1E1E24] px-4 py-2 flex justify-around items-center shrink-0 w-full shadow-[0_-8px_30px_rgba(0,0,0,0.65)] relative"
      >
        <button
          id="nav-warga-btn"
          onClick={() => {
            setDirection(currentRole === "warga" ? 0 : -1);
            setCurrentRole("warga");
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all duration-300 relative cursor-pointer ${
            currentRole === "warga"
              ? "bg-indigo-600/10 text-indigo-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <User className={`h-5 w-5 mb-1.5 transition-transform ${currentRole === "warga" ? "scale-105 text-indigo-400" : ""}`} />
          <span className={`text-[11px] tracking-wide ${currentRole === "warga" ? "font-bold text-white" : "text-gray-300 font-medium"}`}>
            Warga
          </span>
          {currentRole === "warga" && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_6px_#6366f1]" />
          )}
        </button>

        <button
          id="nav-petugas-btn"
          onClick={() => {
            const index = currentRole === "warga" ? 1 : -1;
            setDirection(index);
            setCurrentRole("petugas");
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all duration-300 relative cursor-pointer ${
            currentRole === "petugas"
              ? "bg-indigo-600/10 text-indigo-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Users className={`h-5 w-5 mb-1.5 transition-transform ${currentRole === "petugas" ? "scale-105 text-indigo-400" : ""}`} />
          <span className={`text-[11px] tracking-wide ${currentRole === "petugas" ? "font-bold text-white" : "text-gray-300 font-medium"}`}>
            Petugas
          </span>
          {currentRole === "petugas" && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_6px_#6366f1]" />
          )}
        </button>

        <button
          id="nav-bendahara-btn"
          onClick={() => {
            setDirection(currentRole === "bendahara" ? 0 : 1);
            setCurrentRole("bendahara");
          }}
          className={`flex-1 flex flex-col items-center justify-center py-2.5 px-3 rounded-xl transition-all duration-300 relative cursor-pointer ${
            currentRole === "bendahara"
              ? "bg-indigo-600/10 text-indigo-400"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <ShieldAlert className={`h-5 w-5 mb-1.5 transition-transform ${currentRole === "bendahara" ? "scale-105 text-indigo-400" : ""}`} />
          <span className={`text-[11px] tracking-wide ${currentRole === "bendahara" ? "font-bold text-white" : "text-gray-300 font-medium"}`}>
            Bendahara
          </span>
          {currentRole === "bendahara" && (
            <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_6px_#6366f1]" />
          )}
        </button>
      </div>

      {/* Small credit footers */}
      <div className="absolute bottom-2 right-4 text-[9px] text-gray-500 font-mono tracking-wider hidden lg:flex items-center gap-1 pointer-events-none select-none">
        <span>Made with ❤️ in RT 05 Rukun Tetangga</span>
        <span>•</span>
        <span>Aplikasi Iuran Mandiri</span>
      </div>
    </div>
  );
}
