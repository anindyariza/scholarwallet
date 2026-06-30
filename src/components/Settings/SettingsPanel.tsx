import React from 'react';
import { User, Shield, Bell, HelpCircle, LogOut } from 'lucide-react';
import { logout } from '../../firebase/services/auth.service';

interface SettingsProps {
  userEmail: string;
}

export default function SettingsPanel({ userEmail }: SettingsProps) {
  const sections = [
    {
      title: 'Profil',
      icon: <User className="w-5 h-5" />,
      items: [
        { label: 'Email', value: userEmail },
        { label: 'Tahun Akademik', value: '2026' },
        { label: 'Jurusan', value: 'Belum Diatur' }
      ]
    },
    {
      title: 'Keamanan',
      icon: <Shield className="w-5 h-5" />,
      items: [
        { label: 'Login Biometrik', value: 'Aktif' },
        { label: 'Autentikasi Dua Faktor', value: 'Nonaktif' }
      ]
    },
    {
      title: 'Notifikasi',
      icon: <Bell className="w-5 h-5" />,
      items: [
        { label: 'Peringatan Budget', value: 'Aktif' },
        { label: 'Ringkasan Mingguan', value: 'Nonaktif' }
      ]
    }
  ];

  return (
    <div className="max-w-2xl space-y-8">
      {sections.map((section, idx) => (
        <div key={idx} className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-3">
            <div className="text-emerald-500">
              {section.icon}
            </div>
            <h2 className="font-bold text-white uppercase tracking-widest text-xs">{section.title}</h2>
          </div>
          <div className="divide-y divide-slate-800/50">
            {section.items.map((item, i) => (
              <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-slate-800/20 transition-colors">
                <span className="text-slate-400 text-sm">{item.label}</span>
                <span className="text-slate-100 font-medium text-sm">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-4">
        <button 
          onClick={() => logout()}
          className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-2xl py-4 font-bold transition-all flex items-center justify-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Keluar Sesi
        </button>
        <div className="flex items-center justify-center gap-2 text-slate-500 text-xs">
          <HelpCircle className="w-4 h-4" />
          <span>ScholarWallet v1.2.0 &bull; Layanan Bantuan</span>
        </div>
      </div>
    </div>
  );
}
