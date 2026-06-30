import React from 'react';
import { User, Shield, Bell, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { logout } from '../../firebase/services/auth.service';

interface SettingsProps {
  userEmail: string;
}

export default function SettingsPanel({ userEmail }: SettingsProps) {
  const sections = [
    {
      title: 'Profil Mahasiswa',
      icon: <User className="w-5 h-5" />,
      items: [
        { label: 'Email Institusi', value: userEmail, editable: false },
        { label: 'Tahun Akademik', value: '2026', editable: false },
        { label: 'Jurusan / Program Studi', value: 'Sistem Informasi', editable: true }
      ]
    },
    {
      title: 'Keamanan Akun',
      icon: <Shield className="w-5 h-5" />,
      items: [
        { label: 'Login Biometrik', value: 'Aktif', editable: true, status: 'active' },
        { label: 'Autentikasi Dua Faktor', value: 'Nonaktif', editable: true, status: 'inactive' }
      ]
    },
    {
      title: 'Notifikasi & Pengingat',
      icon: <Bell className="w-5 h-5" />,
      items: [
        { label: 'Peringatan Budget (>85%)', value: 'Aktif', editable: true, status: 'active' },
        { label: 'Ringkasan Bulanan', value: 'Nonaktif', editable: true, status: 'inactive' }
      ]
    }
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {sections.map((section, idx) => (
         <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3.5 bg-slate-50/50 dark:bg-slate-900/10">
            <div className="text-emerald-500 dark:text-emerald-400 p-2 bg-emerald-500/10 rounded-xl">
              {section.icon}
            </div>
            <h2 className="font-display font-black text-slate-800 dark:text-slate-100 tracking-tight text-sm">{section.title}</h2>
          </div>
          <div className="divide-y divide-slate-150/40 dark:divide-slate-850/60">
            {section.items.map((item, i) => (
              <div key={i} className="px-6 py-4.5 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors group cursor-pointer">
                <span className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-semibold">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className={`text-xs sm:text-sm font-bold ${
                    item.status === 'active' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full text-[10px]' : 
                    item.status === 'inactive' ? 'text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full text-[10px]' : 
                    'text-slate-800 dark:text-slate-200'
                  }`}>
                    {item.value}
                  </span>
                  {item.editable && (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  )}
                </div>
              </div>
            ))}
          </div>
         </div>
      ))}

      <div className="space-y-4 pt-4">
        <button 
          onClick={() => logout()}
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-2xl py-4 font-black transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm shadow-rose-500/5 cursor-pointer text-sm tracking-wider uppercase"
        >
          <LogOut className="w-5 h-5" />
          Keluar Sesi
        </button>
        <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-xs">
          <HelpCircle className="w-4 h-4" />
          <span>ScholarWallet v1.2.0 &bull; Layanan Bantuan</span>
        </div>
      </div>
    </div>
  );
}

