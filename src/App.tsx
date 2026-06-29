import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Bell } from 'lucide-react';
import { subscribeToAuthChanges } from './firebase/services/auth.service';
import { subscribeToTransactions, subscribeToBudgets, subscribeToSavingGoals, subscribeToAnnouncements, subscribeToUserFeedbacks } from './firebase/services/db.service';
import { Transaction, Budget, SavingGoal, Announcement } from './types';
import { cn } from './lib/utils';
import AuthScreen from './components/Auth/AuthScreen';
import DashboardLayout from './components/Layout/DashboardLayout';
import KPIStats from './components/Dashboard/KPIStats';
import TransactionList from './components/Dashboard/TransactionList';
import TransactionModal from './components/Transactions/TransactionModal';
import BudgetPanel from './components/Budgets/BudgetPanel';
import AnalyticsCharts from './components/Analytics/Charts';
import SavingGoals from './components/Savings/SavingGoals';
import FinancialHealthScore from './components/Dashboard/FinancialHealthScore';
import SettingsPanel from './components/Settings/SettingsPanel';
import FeedbackModal from './components/Feedback/FeedbackModal';
import AskPanel from './components/Ask/AskPanel';
import AdminLogin from './components/Admin/AdminLogin';
import AdminDashboard from './components/Admin/AdminDashboard';
import { subscribeToAppConfig } from './firebase/services/db.service';
import { AppConfig } from './types';
import { Shield, MessageSquare } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appConfig, setAppConfig] = useState<AppConfig | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('scholarwallet-theme');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [userFeedbacks, setUserFeedbacks] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'warning' | 'info' } | null>(null);

  // 1. Auth Listener
  useEffect(() => {
    const unsubAuth = subscribeToAuthChanges((u) => {
      setUser(u);
      setAuthLoading(false);
    });
    const unsubConfig = subscribeToAppConfig(setAppConfig);
    return () => {
      unsubAuth();
      unsubConfig();
    };
  }, []);

  // 2. Data Listeners
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      setBudgets([]);
      return;
    }

    const unsubTransactions = subscribeToTransactions(user.uid, (data) => {
      setTransactions(data);
      checkBudgetAlerts(data, budgets);
    });

    const unsubBudgets = subscribeToBudgets(user.uid, (data) => {
      setBudgets(data);
    });

    const unsubSavingGoals = subscribeToSavingGoals(user.uid, (data) => {
      setSavingGoals(data);
    });

    const unsubAnnouncements = subscribeToAnnouncements((data) => {
      const now = new Date();
      const filtered = data.filter(a => {
        if (!a.isActive) return false;
        
        const scheduledDate = a.scheduledFor?.toDate?.() || (a.scheduledFor ? new Date(a.scheduledFor) : null);
        const expiryDate = a.expiresAt?.toDate?.() || (a.expiresAt ? new Date(a.expiresAt) : null);

        if (scheduledDate && scheduledDate > now) return false;
        if (expiryDate && expiryDate < now) return false;
        
        return true;
      });
      setAnnouncements(filtered);
    });

    const unsubUserFeedbacks = subscribeToUserFeedbacks(user.uid, (data) => {
      setUserFeedbacks(data);
    });

    return () => {
      unsubTransactions();
      unsubBudgets();
      unsubSavingGoals();
      unsubAnnouncements();
      unsubUserFeedbacks();
    };
  }, [user]);

  const checkBudgetAlerts = (allTransactions: Transaction[], allBudgets: Budget[]) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    allBudgets.forEach(budget => {
      if (budget.monthYear === currentMonth) {
        const spent = allTransactions
          .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(currentMonth))
          .reduce((acc, t) => acc + t.amount, 0);
        
        if (spent > budget.limitAmount) {
          setToast({ message: `Budget exceeded for ${budget.category}!`, type: 'warning' });
        } else if (spent > budget.limitAmount * 0.85) {
          setToast({ message: `You've used 85% of your ${budget.category} budget.`, type: 'info' });
        }
      }
    });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;
    
    if (isDarkMode) {
      root.classList.add('dark');
      body.classList.add('dark');
      root.style.colorScheme = 'dark';
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      body.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('scholarwallet-theme', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev: boolean) => !prev);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isAdmin) {
    return <AdminDashboard onLogout={() => setIsAdmin(false)} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  if (!user) {
    return <AuthScreen isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;
  }

  const totals = transactions.reduce((acc, t) => {
    if (t.type === 'income') acc.income += t.amount;
    else acc.expense += t.amount;
    return acc;
  }, { income: 0, expense: 0 });

  const budgetsReached = budgets.filter(b => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (b.monthYear !== currentMonth) return false;
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(currentMonth))
      .reduce((acc, t) => acc + t.amount, 0);
    return spent >= b.limitAmount;
  }).length;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <AnimatePresence>
              {announcements.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="p-6 bg-indigo-600/10 border border-indigo-500/30 rounded-[2rem] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Bell className="w-20 h-20 text-indigo-400 rotate-12" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">System Broadcast</span>
                      </div>
                      <h2 className="text-lg font-black text-white mb-1 uppercase tracking-tight">{announcements[0].title}</h2>
                      <p className="text-slate-400 text-sm leading-relaxed">{announcements[0].content}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2">
                <KPIStats 
                  balance={totals.income - totals.expense}
                  income={totals.income}
                  expenses={totals.expense}
                />
              </div>
              <div className="h-full">
                <FinancialHealthScore 
                  income={totals.income} 
                  expenses={totals.expense} 
                  budgetsReached={budgetsReached}
                />
              </div>
            </div>

            <div className="space-y-6 sm:space-y-8">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Financial Analytics</h3>
                  <p className="text-[10px] text-slate-500 uppercase tracking-tight mt-1">Live data visualization</p>
                </div>
              </div>
              <AnalyticsCharts transactions={transactions} />
            </div>

            {appConfig?.features?.budgets !== false && (
              <BudgetPanel budgets={budgets} transactions={transactions} userId={user.uid} />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                {appConfig?.features?.transactions !== false && (
                  <TransactionList transactions={transactions} />
                )}
              </div>
              <div className="space-y-6 sm:space-y-8">
                {appConfig?.features?.savings !== false && (
                  <SavingGoals userId={user.uid} goals={savingGoals} />
                )}
              </div>
            </div>
          </div>
        );
      case 'transactions':
        return <TransactionList transactions={transactions} />;
      case 'analytics':
        return <AnalyticsCharts transactions={transactions} />;
      case 'ask':
        return <AskPanel user={user} />;
      case 'settings':
        return <SettingsPanel userEmail={user.email!} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500">
            <p>View coming soon.</p>
          </div>
        );
    }
  };

  return (
    <DashboardLayout 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onAddClick={() => setIsModalOpen(true)}
      isDarkMode={isDarkMode}
      toggleDarkMode={toggleDarkMode}
      onFeedbackClick={() => setIsFeedbackOpen(true)}
      onAdminClick={() => setIsAdminLoginOpen(true)}
      hasAdminReply={userFeedbacks.some(f => f.adminReply)}
      showFeedback={appConfig?.features?.feedback !== false}
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[200] w-[90%] max-w-sm"
          >
            <div className={cn(
              "p-4 rounded-xl shadow-2xl border flex items-center gap-3",
              toast.type === 'warning' 
                ? "bg-rose-500/10 border-rose-500/20 text-rose-200"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-200"
            )}>
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                toast.type === 'warning' ? "bg-rose-500/20" : "bg-emerald-500/20"
              )}>
                {toast.type === 'warning' ? <AlertCircle className="w-6 h-6 text-rose-500" /> : <Bell className="w-6 h-6 text-emerald-500" />}
              </div>
              <div>
                <p className="font-bold text-xs uppercase tracking-widest">Toast Notification</p>
                <p className="text-[11px] opacity-80">{toast.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        key={activeTab}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        <header className="mb-6 sm:mb-8 px-1 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tight capitalize italic uppercase">{activeTab === 'dashboard' ? 'Selamat Datang' : `${activeTab} Control`}</h1>
          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-widest flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="truncate">{user.email}</span>
            <span className="hidden sm:inline">&bull;</span>
            <span className="flex-shrink-0">Academic Cycle 2026</span>
          </p>
        </header>
        {renderContent()}
      </motion.div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        userId={user.uid} 
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        userId={user.uid}
        userEmail={user.email || ''}
        userName={user.displayName || ''}
      />

      <AdminLogin
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onLogin={() => setIsAdmin(true)}
      />
    </DashboardLayout>
  );
}
