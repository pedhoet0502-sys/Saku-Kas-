/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { User, Users, ShieldAlert, BadgeCheck, Smartphone, Settings, Bell } from "lucide-react";
import { Kelompok } from "../types";

interface HeaderProps {
  currentRole: "warga" | "petugas" | "bendahara";
  onChangeRole: (role: "warga" | "petugas" | "bendahara") => void;
  kelompoks: Kelompok[];
  activeKelompokId: string;
  onChangeKelompok: (id: string) => void;
  activeOfficerName: string;
  unreadNotificationsCount: number;
  onOpenNotifications: () => void;
  officerType?: "dasawisma" | "khusus";
  onChangeOfficerType?: (type: "dasawisma" | "khusus") => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onChangeRole,
  kelompoks,
  activeKelompokId,
  onChangeKelompok,
  activeOfficerName,
  unreadNotificationsCount,
  onOpenNotifications,
  officerType = "dasawisma",
  onChangeOfficerType,
}) => {
  return (
    <header className="bg-[#111114] text-gray-200 border-b border-[#1E1E24] overflow-hidden">
      <div className="p-5">
        {/* Branding */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider bg-indigo-600/10 text-indigo-450 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
              RT 05 / RW 02 - DIGITAL IURAN
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white mt-1">
              Saku Iuran <span className="text-indigo-400 text-xs font-normal">v1.2</span>
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              id="header-notification-bell-btn"
              onClick={onOpenNotifications}
              className="relative p-2.5 bg-[#1E1E24]/80 hover:bg-[#23232A] border border-[#23232A] rounded-md text-gray-400 hover:text-indigo-400 transition cursor-pointer flex items-center justify-center animate-pulse-once"
              title="Notifikasi Masuk"
            >
              <Bell className="h-4.5 w-4.5" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-600 font-mono text-[9px] font-black text-white px-1">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
            <div className="bg-indigo-600/10 p-2.5 rounded-md border border-indigo-500/20 text-indigo-400">
              <Smartphone className="h-4.5 w-4.5" />
            </div>
          </div>
        </div>


        {/* Sub-context details based on role */}
        <div className="mt-2 pt-3 border-t border-[#1E1E24] flex justify-between items-center text-xs">
          {currentRole === "warga" && (
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2 text-gray-400 py-1">
                <BadgeCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                <span>Mode warga: Lihat riwayat dan konfirmasi iuran Anda.</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-505/20 shrink-0 select-none">
                <span className="animate-pulse">⇄</span>
                <span>Geser Layar</span>
              </div>
            </div>
          )}

          {currentRole === "petugas" && (
            <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-1">
              <div className="text-left">
                <p className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wider">
                  {officerType === "dasawisma" ? "🌸 PETUGAS DASAWIWMA (SOSIAL / KEMATIAN)" : "⚡ PETUGAS KHUSUS (BULANAN / SAMPAH)"}
                </p>
                <p className="font-extrabold text-white text-base mt-0.5 leading-tight">{activeOfficerName}</p>
              </div>
              
              {/* Responsive layout for toggles and dropdown selector */}
              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                {/* Selector switch for Officer Type */}
                <div className="flex items-center gap-1.5 bg-[#16161D] p-1 rounded-md border border-[#23232A]">
                  <button
                    type="button"
                    onClick={() => onChangeOfficerType?.("dasawisma")}
                    className={`px-2 py-1 rounded text-[10.5px] font-bold transition select-none cursor-pointer ${
                      officerType === "dasawisma"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Dasawisma
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeOfficerType?.("khusus")}
                    className={`px-2 py-1 rounded text-[10.5px] font-bold transition select-none cursor-pointer ${
                      officerType === "khusus"
                        ? "bg-indigo-600 text-white shadow"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    Khusus Bulanan & Sampah
                  </button>
                </div>

                <div className="flex items-center gap-2 bg-[#16161D] px-2 py-1.5 rounded-md border border-[#23232A]">
                  <span className="text-[10px] text-gray-450 font-bold uppercase shrink-0">Blok:</span>
                  <select
                    id="header-kelompok-select"
                    value={activeKelompokId}
                    onChange={(e) => onChangeKelompok(e.target.value)}
                    className="bg-transparent text-[#EEF2F6] font-bold outline-none text-[11px] cursor-pointer"
                  >
                    {kelompoks.map((k) => (
                      <option key={k.id} value={k.id} className="bg-[#111114] text-gray-200">
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="hidden sm:flex items-center gap-1 text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-505/20 shrink-0 select-none">
                  <span className="animate-pulse">⇄</span>
                  <span>Geser</span>
                </div>
              </div>
            </div>
          )}

          {currentRole === "bendahara" && (
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-2 text-gray-400 py-1">
                <span className="inline-block h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                <span>Mode Bendahara: Kelola setoran petugas & verifikasi dana masuk.</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-505/20 shrink-0 select-none">
                <span className="animate-pulse">⇄</span>
                <span>Geser Layar</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
