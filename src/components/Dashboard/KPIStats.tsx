import React from 'react';
import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface KPIStatsProps {
  balance: number;
  income: number;
  expenses: number;
}

export default function KPIStats({ balance, income, expenses }: KPIStatsProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const stats = [
    {
      label: 'Saldo Bersih',
      value: formatCurrency(balance),
      icon: Wallet,
      color: 'indigo',
      change: 'Aktif',
      isPositive: true,
    },
    {
      label: 'Total Pemasukan',
      value: formatCurrency(income),
      icon: TrendingUp,
      color: 'emerald',
      change: 'Bulan Ini',
      isPositive: true,
    },
    {
      label: 'Total Pengeluaran',
      value: formatCurrency(expenses),
      icon: TrendingDown,
      color: 'rose',
      change: 'Bulan Ini',
      isPositive: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
          className={cn(
            "bento-card group p-6 sm:p-8 flex flex-col justify-between min-h-[160px] sm:min-h-[180px] relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500",
            stat.color === 'emerald' ? "hover:border-emerald-500/30" : stat.color === 'rose' ? "hover:border-rose-500/30" : "hover:border-indigo-500/30"
          )}
        >
          {/* Subtle Accent Gradient Background Glow */}
          <div className={cn(
            "absolute -top-10 -right-10 w-28 h-28 blur-[80px] opacity-10 transition-opacity duration-500 group-hover:opacity-25 pointer-events-none",
            stat.color === 'emerald' ? "bg-emerald-500" : stat.color === 'rose' ? "bg-rose-500" : "bg-indigo-500"
          )} />

          <div className="flex justify-between items-start relative z-10">
            <div className={cn(
              "p-3 rounded-2xl shadow-sm flex items-center justify-center",
              stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
              stat.color === 'rose' ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : 
              "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            )}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest",
              stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : 
              stat.color === 'rose' ? "bg-rose-500/10 text-rose-600 dark:text-rose-400" : 
              "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            )}>
              {stat.change}
            </div>
          </div>

          <div className="space-y-1 relative z-10 mt-6">
            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <h3 
              title={stat.value}
              className={cn(
                "text-lg sm:text-xl lg:text-2xl font-display font-black tracking-tight truncate",
                stat.color === 'emerald' ? "text-emerald-600 dark:text-emerald-400" : 
                stat.color === 'rose' ? "text-rose-600 dark:text-rose-400" : 
                "text-indigo-600 dark:text-white"
              )}
            >
              {stat.value}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

