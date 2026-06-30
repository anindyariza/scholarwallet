import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart as PieChartIcon, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Plus,
  Shield,
  MessageSquare,
  Megaphone,
  Sun,
  Moon,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { logout } from '../../firebase/services/auth.service';
import { cn } from '../../lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddClick: () => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onFeedbackClick?: () => void;
  onAdminClick?: () => void;
  hasAdminReply?: boolean;
  showFeedback?: boolean;
}

export default function DashboardLayout({ 
  children, 
  activeTab, 
  setActiveTab, 
  onAddClick,
  isDarkMode,
  toggleDarkMode,
  onFeedbackClick,
  onAdminClick,
  hasAdminReply = false,
  showFeedback = true
}: DashboardLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: Receipt },
    { id: 'analytics', label: 'Analisis', icon: PieChartIcon },
    { id: 'ask', label: 'Ask', icon: MessageSquare },
    { id: 'about', label: 'Tentang & Panduan', icon: HelpCircle },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 flex transition-colors duration-500">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex-col py-8 items-center fixed inset-y-0 z-50">
        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center mb-10 shadow-2xl shadow-emerald-500/20 rotate-3 hover:rotate-0 transition-transform duration-500 cursor-pointer">
          <span className="text-white dark:text-slate-950 font-black text-xl font-display">S</span>
        </div>

        <nav className="flex-1 space-y-10">
          {navItems.map((item) => {
            const IsActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "relative group flex flex-col items-center justify-center p-3.5 rounded-2xl transition-all duration-300 cursor-pointer",
                  IsActive 
                    ? "text-emerald-500 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/5" 
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-950 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/40"
                )}
                title={item.label}
              >
                <item.icon className={cn("w-5.5 h-5.5 transition-transform duration-350", IsActive ? "scale-110" : "group-hover:scale-110")} />
                {IsActive && (
                  <>
                    <motion.div 
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-[20%] h-[60%] w-1 bg-emerald-500 rounded-r-full"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                    <motion.div 
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-emerald-500/5 dark:bg-emerald-500/10 blur-xl rounded-full -z-10"
                    />
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <div className="pt-8 space-y-4 border-t border-slate-200 dark:border-slate-800/50 flex flex-col items-center w-full px-4">
          <button 
            onClick={toggleDarkMode}
            className="p-3 text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-all hover:scale-110 active:scale-95"
            title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {isDarkMode ? <Sun className="w-6 h-6 text-amber-400 animate-spin-slow" /> : <Moon className="w-6 h-6 text-slate-400" />}
          </button>

          {showFeedback && (
            <button 
              onClick={onFeedbackClick}
              className="relative p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/5 rounded-2xl transition-all group hover:scale-110 active:scale-95"
              title="Feedback"
            >
              <Megaphone className="w-6 h-6" />
              {hasAdminReply && (
                <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
              )}
            </button>
          )}

          <button 
            onClick={onAdminClick}
            className="p-3 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-2xl transition-all hover:scale-110 active:scale-95"
            title="Portal Admin"
          >
            <Shield className="w-6 h-6" />
          </button>

          <button 
            onClick={() => logout()}
            className="p-3 text-rose-500/80 hover:text-rose-400 hover:bg-rose-500/5 rounded-2xl transition-all hover:scale-110 active:scale-95"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 lg:ml-20 min-w-0 overflow-x-hidden",
        activeTab === 'ask' ? "pb-6 lg:pb-12" : "pb-40 lg:pb-12"
      )}>
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-5 sticky top-0 z-40">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white dark:text-slate-950 font-black text-lg font-display">S</span>
            </div>
            <span className="font-bold text-sm text-slate-900 dark:text-slate-50 tracking-tight font-display">ScholarWallet</span>
          </div>

          <button 
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title={isDarkMode ? "Mode Terang" : "Mode Gelap"}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
          </button>
        </header>

        <AnimatePresence>
          {isMenuOpen && (
            <>
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] lg:hidden"
              />
              
              {/* Drawer */}
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 z-[101] lg:hidden flex flex-col shadow-2xl"
              >
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <span className="text-white dark:text-slate-950 font-black text-lg font-display">S</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-slate-50">ScholarWallet</span>
                  </div>
                  <button 
                    onClick={() => setIsMenuOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map((item) => {
                    const IsActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMenuOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                          IsActive 
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25" 
                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}

                  {/* Divider */}
                  <div className="h-px bg-slate-100 dark:bg-slate-800/80 my-2" />

                  {/* Feedback Button */}
                  {showFeedback && (
                    <button
                      onClick={() => {
                        onFeedbackClick?.();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all duration-200 relative"
                    >
                      <div className="relative">
                        <Megaphone className="w-5 h-5" />
                        {hasAdminReply && (
                          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                          </span>
                        )}
                      </div>
                      <span>Feedback</span>
                    </button>
                  )}

                  {/* Admin Button */}
                  <button
                    onClick={() => {
                      onAdminClick?.();
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    <Shield className="w-5 h-5" />
                    <span>Portal Admin</span>
                  </button>
                </nav>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <button 
                    onClick={toggleDarkMode}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
                      <span>{isDarkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih</span>
                  </button>

                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Keluar Sesi</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className={cn(
          "max-w-7xl mx-auto transition-all duration-300",
          activeTab === 'ask' ? "p-1.5 sm:p-6 lg:p-10" : "p-4 sm:p-6 lg:p-10"
        )}>
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Centered Plus Button */}
      {activeTab !== 'ask' && (
        <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button 
            onClick={onAddClick}
            className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white dark:text-slate-950 shadow-2xl shadow-emerald-500/40 active:scale-90 transition-all border-4 border-white dark:border-slate-900"
          >
            <Plus className="w-10 h-10" />
          </button>
        </div>
      )}

      {/* Desktop Floating Action Button */}
      {activeTab !== 'ask' && (
        <button 
          onClick={onAddClick}
          className="hidden lg:flex fixed bottom-12 right-12 w-16 h-16 bg-emerald-500 hover:bg-emerald-400 rounded-2xl items-center justify-center text-white dark:text-slate-950 shadow-2xl shadow-emerald-500/40 active:scale-95 transition-all z-50 group rotate-45 hover:rotate-0 duration-500"
        >
          <Plus className="w-10 h-10 -rotate-45 group-hover:rotate-0 transition-transform duration-500" />
        </button>
      )}
    </div>
  );
}
