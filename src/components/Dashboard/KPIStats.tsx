import React from 'react';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
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
      label: 'Net Liquid Balance',
      value: formatCurrency(balance),
      icon: Wallet,
      color: 'slate',
      change: '+2.5%',
      isPositive: true,
    },
    {
      label: 'Total Monthly Income',
      value: formatCurrency(income),
      icon: TrendingUp,
      color: 'emerald',
      change: '+12%',
      isPositive: true,
    },
    {
      label: 'Total Monthly Expenses',
      value: formatCurrency(expenses),
      icon: TrendingDown,
      color: 'rose',
      change: '-5%',
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
          transition={{ delay: idx * 0.1 }}
          className="bento-card group p-5 sm:p-8 flex flex-col justify-between min-h-[140px] sm:min-h-[160px] relative overflow-hidden"
        >
          {/* Subtle Accent Gradient */}
          <div className={cn(
            "absolute -top-10 -right-10 w-24 h-24 blur-[80px] opacity-20 transition-opacity group-hover:opacity-40",
            stat.color === 'emerald' ? "bg-emerald-500" : stat.color === 'rose' ? "bg-rose-500" : "bg-indigo-500"
          )} />

          <div className="flex justify-between items-start relative z-10">
            <div className={cn(
              "p-2 rounded-xl sm:p-2.5",
              stat.color === 'emerald' ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" : 
              stat.color === 'rose' ? "bg-rose-500/10 text-rose-500 dark:text-rose-400" : 
              "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
            )}>
              <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className={cn(
              "px-2 py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider",
              stat.isPositive ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400" : "bg-rose-500/10 text-rose-500 dark:text-rose-400"
            )}>
              {stat.change}
            </div>
          </div>

          <div className="space-y-1 relative z-10 mt-3 sm:mt-6">
            <p className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider sm:tracking-[0.2em]">{stat.label}</p>
            <h3 
              title={stat.value}
              className={cn(
              "text-base sm:text-lg lg:text-xl xl:text-2xl font-display font-bold tracking-tight break-all sm:break-words",
              stat.color === 'emerald' ? "text-emerald-500 dark:text-emerald-400" : 
              stat.color === 'rose' ? "text-rose-500 dark:text-rose-400" : 
              "text-slate-900 dark:text-white"
            )}>
              {stat.value}
            </h3>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
