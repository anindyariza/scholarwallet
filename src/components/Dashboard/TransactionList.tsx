import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, ChevronLeft, ChevronRight, Clock, Receipt } from 'lucide-react';
import { Transaction } from '../../types';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface TransactionListProps {
  transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filtered = transactions.filter(t => {
    const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="bento-card overflow-hidden w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] shadow-xl">
      <div className="px-6 py-6 sm:px-8 sm:py-7 border-b border-slate-100 dark:border-slate-800/60 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/30 dark:bg-slate-900/10">
        <div className="space-y-1">
          <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight">Transaksi Terbaru</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider sm:tracking-[0.2em] truncate">Aktivitas terkini pengeluaran & pendapatan Anda</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-48 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input 
              type="text"
              placeholder="Cari aktivitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50/50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-850/80 rounded-2xl text-xs outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-600 shadow-inner"
            />
          </div>
          <div className="flex bg-slate-100/80 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-850/60 items-center justify-start gap-1 overflow-x-auto scrollbar-none shrink-0">
            {(['all', 'income', 'expense'] as const).map((type) => {
              const label = type === 'all' ? 'Semua' : type === 'income' ? 'Pemasukan' : 'Pengeluaran';
              const active = filterType === type;
              const count = transactions.filter(t => {
                const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                      t.description?.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesSearch && (type === 'all' || t.type === type);
              }).length;

              return (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap flex items-center gap-1.5 select-none cursor-pointer",
                    active 
                      ? "text-emerald-700 dark:text-emerald-300" 
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-950 dark:hover:text-slate-100"
                  )}
                >
                  <span className="relative z-10">{label}</span>
                  <span className={cn(
                    "relative z-10 text-[9px] px-1.5 py-0.5 rounded-md font-mono transition-colors",
                    active ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold" : "bg-slate-200/60 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400"
                  )}>
                    {count}
                  </span>
                  {active && (
                    <motion.div
                      layoutId="active-filter-bg"
                      className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200/20 dark:border-slate-800/80"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar hidden md:block">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-slate-50/50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-8 py-4.5 font-black">Detail Transaksi</th>
              <th className="px-8 py-4.5 font-black">Kategori</th>
              <th className="px-8 py-4.5 font-black">Tanggal</th>
              <th className="px-8 py-4.5 font-black text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150/40 dark:divide-slate-850/60">
            <AnimatePresence mode="popLayout">
              {paginated.length > 0 ? paginated.map((t) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  key={t.id} 
                  className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-all cursor-default"
                >
                  <td className="px-8 py-4.5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm",
                        t.type === 'income' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}>
                        {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-slate-950 dark:group-hover:text-white transition-colors">{t.description || t.category}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-0.5">{t.paymentMethod}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4.5">
                    <span className={cn(
                      "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all",
                      t.type === 'income' 
                        ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/10" 
                        : "bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500/10"
                    )}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-4.5">
                    <div className="flex flex-col">
                      <span className="text-slate-700 dark:text-slate-300 text-xs font-semibold">{formatDate(t.date)}</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400/80" />
                        Tercatat
                      </span>
                    </div>
                  </td>
                  <td className={cn(
                    "px-8 py-4.5 text-right font-mono font-bold text-sm tracking-tight transition-all group-hover:scale-105 origin-right",
                    t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    <span className="opacity-50 mr-1">{t.type === 'income' ? '+' : '-'}</span>
                    {formatCurrency(t.amount)}
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-35">
                      <Receipt className="w-12 h-12 text-slate-400 dark:text-slate-600 animate-bounce" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tidak ada riwayat ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
        <AnimatePresence mode="popLayout">
          {paginated.length > 0 ? paginated.map((t) => (
            <motion.div 
              key={t.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 flex items-center justify-between gap-3 group active:bg-slate-50 dark:active:bg-slate-850/40 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <div className={cn(
                  "w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-sm",
                  t.type === 'income' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}>
                  {t.type === 'income' ? <ArrowDownLeft className="w-5.5 h-5.5" /> : <ArrowUpRight className="w-5.5 h-5.5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{t.description || t.category}</p>
                  <div className="flex items-center gap-2 mt-1 truncate">
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-widest truncate">{t.category}</span>
                    <span className="text-slate-300 dark:text-slate-700 font-black flex-shrink-0">•</span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold truncate">{formatDate(t.date)}</span>
                  </div>
                </div>
              </div>
              <div className="text-right flex-shrink-0 pl-2">
                <p className={cn(
                  "text-sm sm:text-base font-mono font-bold tracking-tight whitespace-nowrap",
                  t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                </p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1 truncate">{t.paymentMethod}</p>
              </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Tidak ada aktivitas ditemukan</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/20">
          <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-[0.2em]">
            Halaman <span className="text-emerald-600 dark:text-emerald-400">{currentPage}</span> <span className="opacity-30">/</span> <span className="text-slate-700 dark:text-slate-300">{totalPages}</span>
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-20 transition-all text-slate-500 dark:text-slate-300 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-20 transition-all text-slate-500 dark:text-slate-300 active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
