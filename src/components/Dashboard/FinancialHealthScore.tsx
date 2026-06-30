import React from 'react';
import { Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface HealthScoreProps {
  income: number;
  expenses: number;
  budgetsReached: number;
}

export default function FinancialHealthScore({ income, expenses, budgetsReached }: HealthScoreProps) {
  // Simple scoring logic
  // 1. Savings Ratio (40%)
  const savingsRatio = income > 0 ? (income - expenses) / income : 0;
  const savingsScore = Math.min(Math.max(savingsRatio * 100, 0), 100) * 0.4;

  // 2. Expense coverage (40%) - lower is better up to a point
  const expenseRatio = income > 0 ? expenses / income : 1;
  const coverageScore = Math.max(0, (1 - expenseRatio) * 100) * 0.4;

  // 3. Discipline (20%) - penalty for budgets reached
  const disciplineScore = Math.max(0, (5 - budgetsReached) * 20) * 0.2;

  const totalScore = Math.round(savingsScore + coverageScore + disciplineScore);

  let status = 'Sangat Baik';
  let color = 'text-emerald-500 dark:text-emerald-400';
  let bgColor = 'bg-emerald-500 dark:bg-emerald-400';
  let icon = <ShieldCheck className="w-5.5 h-5.5" />;
  let borderGlow = 'group-hover:border-emerald-500/30';

  if (totalScore < 40) {
    status = 'Butuh Perhatian';
    color = 'text-rose-500 dark:text-rose-400';
    bgColor = 'bg-rose-500 dark:bg-rose-400';
    icon = <AlertCircle className="w-5.5 h-5.5" />;
    borderGlow = 'group-hover:border-rose-500/30';
  } else if (totalScore < 70) {
    status = 'Stabil';
    color = 'text-amber-500 dark:text-amber-400';
    bgColor = 'bg-amber-500 dark:bg-amber-400';
    icon = <Activity className="w-5.5 h-5.5" />;
    borderGlow = 'group-hover:border-amber-500/30';
  }

  return (
    <div className={cn(
      "bento-card p-6 sm:p-8 flex items-center justify-between h-full relative overflow-hidden group bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all duration-500",
      borderGlow
    )}>
      {/* Subtle background glow */}
      <div className={cn(
        "absolute -bottom-10 -left-10 w-32 h-32 blur-[80px] opacity-10 transition-opacity duration-500 group-hover:opacity-20 pointer-events-none",
        totalScore < 40 ? "bg-rose-500" : totalScore < 70 ? "bg-amber-500" : "bg-emerald-500"
      )} />

      <div className="space-y-3.5 relative z-10">
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className={cn("p-2 rounded-2xl bg-slate-50 dark:bg-slate-850 shadow-inner flex items-center justify-center", color)}>
            {icon}
          </div>
          Health Score
        </div>
        
        <div className="space-y-1">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-5xl sm:text-6xl font-display font-black tracking-tighter", color)}>{totalScore}</span>
            <span className="text-slate-400 dark:text-slate-500 font-bold text-sm">/100</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", bgColor)} />
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wide">{status}</p>
          </div>
        </div>
      </div>

      <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center relative z-10">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="currentColor"
            strokeWidth="11"
            className="text-slate-100 dark:text-slate-850"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="currentColor"
            strokeWidth="11"
            strokeDasharray="251.32"
            initial={{ strokeDashoffset: 251.32 }}
            animate={{ strokeDashoffset: 251.32 - (251.32 * totalScore) / 100 }}
            className={color}
            strokeLinecap="round"
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className={cn("w-3 h-3 rounded-full blur-[1px]", bgColor)} />
        </div>
      </div>
    </div>
  );
}

