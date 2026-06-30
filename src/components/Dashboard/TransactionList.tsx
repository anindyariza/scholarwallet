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
    <div className="bento-card overflow-hidden w-full">
      <div className="px-5 py-5 sm:px-8 sm:py-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight">Transaksi Terbaru</h2>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider sm:tracking-[0.2em] truncate">Aktivitas terkini Anda</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              placeholder="Cari aktivitas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-slate-50 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
          </div>
          <div className="relative">
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="w-full sm:w-auto pl-4 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-slate-50 appearance-none font-bold uppercase tracking-widest cursor-pointer"
            >
              <option value="all">Semua</option>
              <option value="income">Pemasukan</option>
              <option value="expense">Pengeluaran</option>
            </select>
            <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto custom-scrollbar hidden md:block">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="bg-slate-50/50 dark:bg-slate-800/20 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
            <tr>
              <th className="px-8 py-4 font-black">Detail Transaksi</th>
              <th className="px-8 py-4 font-black">Kategori</th>
              <th className="px-8 py-4 font-black">Tanggal</th>
              <th className="px-8 py-4 font-black text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            <AnimatePresence mode="popLayout">
              {paginated.length > 0 ? paginated.map((t) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  key={t.id} 
                  className="group hover:bg-emerald-500/[0.02] transition-all cursor-default"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                        t.type === 'income' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}>
                        {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t.description || t.category}</p>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">{t.paymentMethod}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={cn(
                      "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] border transition-all",
                      t.type === 'income' 
                        ? "bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500/10" 
                        : "bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 border-indigo-500/20 group-hover:bg-indigo-500/10"
                    )}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="text-slate-600 dark:text-slate-300 text-xs font-semibold">{formatDate(t.date)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-600 font-medium uppercase mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Hari Ini
                      </span>
                    </div>
                  </td>
                  <td className={cn(
                    "px-8 py-5 text-right font-mono font-bold text-sm tracking-tight transition-all group-hover:scale-105 origin-right",
                    t.type === 'income' ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                  )}>
                    <span className="opacity-50 mr-1">{t.type === 'income' ? '+' : '-'}</span>
                    {formatCurrency(t.amount)}
                  </td>
                </motion.tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3 opacity-20">
                      <Receipt className="w-12 h-12 text-slate-400" />
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Tidak ada riwayat ditemukan</p>
                    </div>
                  </td>
                </tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        <AnimatePresence mode="popLayout">
          {paginated.length > 0 ? paginated.map((t) => (
            <motion.div 
              key={t.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 sm:p-6 flex items-center justify-between gap-3 group active:bg-slate-50 dark:active:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={cn(
                  "w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex-shrink-0 flex items-center justify-center",
                  t.type === 'income' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                )}>
                  {t.type === 'income' ? <ArrowDownLeft className="w-5 h-5 sm:w-6 sm:h-6" /> : <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{t.description || t.category}</p>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1 truncate">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{t.category}</span>
                    <span className="text-slate-300 dark:text-slate-700 font-black flex-shrink-0">•</span>
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest truncate">{formatDate(t.date)}</span>
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
                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1 truncate">{t.paymentMethod}</p>
              </div>
            </motion.div>
          )) : (
            <div className="py-20 text-center">
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tidak ada aktivitas ditemukan</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {totalPages > 1 && (
        <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50 backdrop-blur-sm">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">
            Halaman <span className="text-emerald-600 dark:text-emerald-400">{currentPage}</span> <span className="opacity-30">/</span> <span className="text-slate-700 dark:text-slate-300">{totalPages}</span>
          </p>
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-20 transition-all text-slate-500 dark:text-slate-300"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-20 transition-all text-slate-500 dark:text-slate-300"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
