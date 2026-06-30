import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Banknote, Tag, Calendar as CalendarIcon, CreditCard, Type } from 'lucide-react';
import { Transaction, EXPENSE_CATEGORIES, INCOME_CATEGORIES, TransactionType, PaymentMethod } from '../../types';
import { cn } from '../../lib/utils';
import { addTransaction } from '../../firebase/services/db.service';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export default function TransactionModal({ isOpen, onClose, userId }: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Debit');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!userId) throw new Error('Pengguna tidak terautentikasi. Silakan masuk kembali.');
      
      const cleanAmount = amount.replace(/\./g, '');
      const val = parseFloat(cleanAmount);
      if (isNaN(val) || val <= 0) throw new Error('Masukkan nominal jumlah yang valid dan lebih dari nol.');

      // Add a timeout to prevent infinite loading if Firestore is hanging
      const savePromise = addTransaction({
        userId,
        amount: val,
        type,
        category,
        date: new Date(date).toISOString(),
        paymentMethod,
        description
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Koneksi terputus. Gagal terhubung ke database. Silakan periksa koneksi internet Anda atau muat ulang halaman.')), 20000)
      );

      await Promise.race([savePromise, timeoutPromise]);

      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Failed to add transaction:', err);
      setError(err.message || 'Terjadi kesalahan saat menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 bottom-8 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-xl bento-card z-[101] overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/50">
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-display font-black text-slate-900 dark:text-white tracking-tighter">Catat Transaksi</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider sm:tracking-[0.2em]">Buku Transaksi</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-2xl transition-all hover:scale-110 active:scale-95 border border-slate-200 dark:border-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 sm:space-y-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="flex bg-slate-100 dark:bg-slate-800/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/50">
                <button 
                  type="button"
                  onClick={() => { setType('expense'); setCategory(EXPENSE_CATEGORIES[0]); }}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300",
                    type === 'expense' ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Pengeluaran
                </button>
                <button 
                  type="button"
                  onClick={() => { setType('income'); setCategory(INCOME_CATEGORIES[0]); }}
                  className={cn(
                    "flex-1 py-3 text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all duration-300",
                    type === 'income' ? "bg-emerald-500 text-white dark:text-slate-950 shadow-xl shadow-emerald-500/20" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  Pemasukan
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Jumlah</label>
                  <div className="relative group">
                    <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="text" 
                      required
                      value={amount}
                      onChange={(e) => {
                        const cleanVal = e.target.value.replace(/\D/g, '');
                        if (cleanVal) {
                          setAmount(new Intl.NumberFormat('id-ID').format(parseInt(cleanVal, 10)));
                        } else {
                          setAmount('');
                        }
                      }}
                      placeholder="0"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-lg font-bold outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Tanggal</label>
                  <div className="relative group">
                    <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                    <input 
                      type="date" 
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Kategori</label>
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white appearance-none text-sm font-bold"
                    >
                      {categories.map(c => <option key={c} value={c} className="bg-white dark:bg-slate-900">{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Metode Pembayaran</label>
                  <div className="relative group">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <select 
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white appearance-none text-sm font-bold"
                    >
                      <option value="Cash" className="bg-white dark:bg-slate-900">Uang Tunai</option>
                      <option value="Debit" className="bg-white dark:bg-slate-900">Debit Rekening</option>
                      <option value="E-Wallet" className="bg-white dark:bg-slate-900">E-Wallet (GoPay/OVO/Dana)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Catatan Deskripsi</label>
                <div className="relative group">
                  <Type className="absolute left-4 top-6 w-5 h-5 text-slate-400 dark:text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tulis catatan atau deskripsi transaksi..."
                    rows={3}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-white resize-none text-sm font-medium placeholder:text-slate-300 dark:placeholder:text-slate-700"
                  />
                </div>
              </div>
              
              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs text-center font-bold uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
                  {error}
                </div>
              )}

              <div className="pt-4 pb-2">
                <button 
                  type="submit"
                  disabled={loading || !amount}
                  className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-950 rounded-2xl font-black shadow-2xl shadow-emerald-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Plus className="w-6 h-6" /> Simpan Transaksi</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
