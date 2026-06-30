import React, { useState } from 'react';
import { Target, Plus, Trash2, TrendingUp, Calendar, ChevronRight, Save, X, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SavingGoal } from '../../types';
import { addSavingGoal, updateSavingGoalAmount, deleteSavingGoal } from '../../firebase/services/db.service';
import { cn } from '../../lib/utils';

interface SavingGoalsProps {
  userId: string;
  goals: SavingGoal[];
}

export default function SavingGoals({ userId, goals }: SavingGoalsProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingGoalId, setUpdatingGoalId] = useState<string | null>(null);
  const [updateAmountStr, setUpdateAmountStr] = useState<string>('');
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '0',
    deadline: '',
    category: 'Travel'
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cleanTarget = newGoal.targetAmount.replace(/\./g, '');
      const target = Number(cleanTarget);
      if (isNaN(target) || target <= 0) throw new Error('Batas target nominal tidak valid');

      const savePromise = addSavingGoal({
        userId,
        title: newGoal.title,
        targetAmount: target,
        currentAmount: Number(newGoal.currentAmount),
        deadline: newGoal.deadline,
        category: newGoal.category
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Koneksi terputus. Silakan coba lagi.')), 20000)
      );

      await Promise.race([savePromise, timeoutPromise]);

      setIsAdding(false);
      setNewGoal({ title: '', targetAmount: '', currentAmount: '0', deadline: '', category: 'Travel' });
    } catch (err: any) {
      console.error('Failed to add saving goal:', err);
      setError(err.message || 'Gagal membuat target');
    } finally {
      setLoading(false);
    }
  };

  const startUpdateProgress = (goalId: string, current: number) => {
    setUpdatingGoalId(goalId);
    setUpdateAmountStr(new Intl.NumberFormat('id-ID').format(current));
  };

  const handleSaveProgress = async (goalId: string, targetAmount: number) => {
    const cleanAmount = updateAmountStr.replace(/\./g, '');
    const numAmount = Number(cleanAmount);
    if (isNaN(numAmount) || numAmount < 0) {
      alert('Masukkan jumlah tabungan yang valid');
      return;
    }
    try {
      await updateSavingGoalAmount(goalId, Math.min(numAmount, targetAmount));
      setUpdatingGoalId(null);
      setUpdateAmountStr('');
    } catch (err) {
      console.error('Gagal memperbarui tabungan:', err);
    }
  };

  return (
    <div className="bento-card p-6 sm:p-8 flex flex-col group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] shadow-xl">
      {/* Subtle background glow */}
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-indigo-500 blur-[80px] opacity-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
            <Target className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-0.5">
            <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight">Target Tabungan</h2>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-normal leading-normal">Rencanakan & amankan masa depan finansial Anda</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="self-end sm:self-auto p-3 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-950 text-slate-500 dark:text-slate-300 rounded-2xl transition-all hover:scale-110 active:scale-95 shadow-sm cursor-pointer"
          title="Tambah target baru"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        {goals.length === 0 && !isAdding && (
          <div className="flex flex-col items-center justify-center h-52 space-y-4 opacity-40 py-8">
            <TrendingUp className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Belum ada target tabungan aktif</p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="bg-slate-50/50 dark:bg-slate-800/40 rounded-[2rem] p-6 border border-slate-200/60 dark:border-indigo-500/20 shadow-lg"
            >
              <form onSubmit={handleAddGoal} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Nama Target</label>
                  <input 
                    type="text" 
                    placeholder="misal: Macbook Pro Baru atau Tabungan Kos" 
                    required
                    value={newGoal.title}
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Target Nominal (Rp)</label>
                    <input 
                      type="text" 
                      placeholder="0" 
                      required
                      value={newGoal.targetAmount}
                      onChange={e => {
                        const cleanVal = e.target.value.replace(/\D/g, '');
                        if (cleanVal) {
                          setNewGoal({
                            ...newGoal,
                            targetAmount: new Intl.NumberFormat('id-ID').format(parseInt(cleanVal, 10))
                          });
                        } else {
                          setNewGoal({ ...newGoal, targetAmount: '' });
                        }
                      }}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Tenggat Waktu</label>
                    <input 
                      type="date" 
                      required
                      value={newGoal.deadline}
                      onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
                
                {error && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-[10px] text-center font-bold uppercase tracking-wider">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button"
                    disabled={loading}
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-4 py-3.5 text-xs font-black text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors uppercase tracking-widest disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl px-4 py-3.5 text-xs font-black transition-all shadow-lg shadow-indigo-600/20 active:scale-95 uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Buat Target'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = progress >= 100;

            return (
              <motion.div
                key={goal.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50/50 dark:bg-slate-800/20 border border-slate-100 dark:border-slate-800/40 rounded-3xl p-6 group/item hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-all duration-300 shadow-sm"
              >
                <div className="flex justify-between items-start mb-5">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">{goal.title}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{new Date(goal.deadline).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        if (updatingGoalId === goal.id) {
                          setUpdatingGoalId(null);
                        } else {
                          startUpdateProgress(goal.id!, goal.currentAmount);
                        }
                      }}
                      className={cn(
                        "p-2.5 bg-white dark:bg-slate-900 border rounded-xl transition-all hover:scale-110 active:scale-90 cursor-pointer",
                        updatingGoalId === goal.id
                          ? "border-amber-500/50 bg-amber-500/5 text-amber-500"
                          : "border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                      )}
                      title="Update tabungan"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm(`Hapus target "${goal.title}"?`)) {
                          deleteSavingGoal(goal.id!);
                        }
                      }}
                      className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-rose-500/50 hover:bg-rose-500/5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl transition-all hover:scale-110 active:scale-90 cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {updatingGoalId === goal.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mb-4"
                    >
                      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500">Update Jumlah Terkumpul</span>
                          <span className="text-[9px] text-slate-400 font-mono">Maks: {formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                            <input 
                              type="text"
                              value={updateAmountStr}
                              onChange={(e) => {
                                const cleanVal = e.target.value.replace(/\D/g, '');
                                if (cleanVal) {
                                  setUpdateAmountStr(new Intl.NumberFormat('id-ID').format(parseInt(cleanVal, 10)));
                                } else {
                                  setUpdateAmountStr('0');
                                }
                              }}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-bold font-mono text-slate-950 dark:text-white outline-none focus:border-indigo-500"
                            />
                          </div>
                          <button
                            onClick={() => handleSaveProgress(goal.id!, goal.targetAmount)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-3 flex items-center justify-center gap-1 text-xs font-bold shadow-sm cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Simpan
                          </button>
                          <button
                            onClick={() => setUpdatingGoalId(null)}
                            className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-xl px-2.5 flex items-center justify-center cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-mono font-bold text-slate-900 dark:text-white">{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Target {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="h-3.5 bg-slate-200/50 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200/20 dark:border-slate-800/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      className={cn(
                        "h-full rounded-full transition-all duration-1000",
                        isCompleted 
                          ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                          : "bg-gradient-to-r from-indigo-600 to-indigo-400"
                      )}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>{Math.round(progress)}% Selesai</span>
                    {isCompleted && <span className="text-emerald-500 dark:text-emerald-400 animate-pulse font-extrabold">Selesai!</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
