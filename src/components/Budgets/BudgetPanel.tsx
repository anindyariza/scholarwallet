import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Target, 
  AlertCircle, 
  Edit3, 
  Save, 
  X, 
  Trash2, 
  Plus, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Budget, Transaction, EXPENSE_CATEGORIES } from '../../types';
import { cn } from '../../lib/utils';
import { upsertBudget, deleteBudget } from '../../firebase/services/db.service';

interface BudgetPanelProps {
  budgets: Budget[];
  transactions: Transaction[];
  userId: string;
}

export default function BudgetPanel({ budgets, transactions, userId }: BudgetPanelProps) {
  const currentMonthYearStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonthYear, setSelectedMonthYear] = useState(currentMonthYearStr);
  const [isAdding, setIsAdding] = useState(false);
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Add form states
  const [newCategory, setNewCategory] = useState<string>(EXPENSE_CATEGORIES[0]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newMonthYear, setNewMonthYear] = useState(currentMonthYearStr);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getConsumption = (budget: Budget) => {
    const totalSpent = transactions
      .filter(t => t.type === 'expense' && t.category.toLowerCase() === budget.category.toLowerCase() && t.date.startsWith(budget.monthYear))
      .reduce((acc, t) => acc + t.amount, 0);
    
    return {
      spent: totalSpent,
      limit: budget.limitAmount,
      percent: budget.limitAmount > 0 ? (totalSpent / budget.limitAmount) * 100 : 0
    };
  };

  const handleSaveBudget = async (id: string, category: string, monthYear: string, val: string) => {
    if (!val || isNaN(parseFloat(val)) || parseFloat(val) <= 0) {
      showToastMessage('Masukkan batas budget yang valid!', 'error');
      return;
    }
    
    try {
      await upsertBudget({
        userId,
        category,
        limitAmount: parseFloat(val),
        monthYear
      });
      setEditingBudgetId(null);
      setEditValue('');
      showToastMessage('Batas budget berhasil diperbarui!');
    } catch (err) {
      showToastMessage('Gagal menyimpan budget', 'error');
    }
  };

  const handleDelete = async (budgetId: string | undefined) => {
    if (!budgetId) return;
    if (window.confirm('Apakah Anda yakin ingin menghapus budget ini?')) {
      try {
        await deleteBudget(budgetId);
        showToastMessage('Budget berhasil dihapus!');
      } catch (err) {
        showToastMessage('Gagal menghapus budget', 'error');
      }
    }
  };

  const handleAddBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = isCustomCategory ? customCategoryName.trim() : newCategory;
    if (!finalCategory) {
      showToastMessage('Kategori tidak boleh kosong!', 'error');
      return;
    }
    if (!newLimit || isNaN(parseFloat(newLimit)) || parseFloat(newLimit) <= 0) {
      showToastMessage('Masukkan batas limit budget yang valid!', 'error');
      return;
    }

    // Check if budget already exists for this category and monthYear
    const exists = budgets.some(
      b => b.category.toLowerCase() === finalCategory.toLowerCase() && b.monthYear === newMonthYear
    );
    if (exists) {
      showToastMessage(`Budget untuk ${finalCategory} pada periode ${newMonthYear} sudah terdaftar!`, 'error');
      return;
    }

    try {
      await upsertBudget({
        userId,
        category: finalCategory,
        limitAmount: parseFloat(newLimit),
        monthYear: newMonthYear
      });
      setIsAdding(false);
      setNewLimit('');
      setCustomCategoryName('');
      setIsCustomCategory(false);
      setSelectedMonthYear(newMonthYear); // Automatically switch view to the added budget month
      showToastMessage('Budget baru berhasil ditambahkan!');
    } catch (err) {
      showToastMessage('Gagal menambahkan budget baru', 'error');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Filter budgets of currently selected month-year
  const filteredBudgets = budgets.filter(b => b.monthYear === selectedMonthYear);

  // Helper to change month
  const changeMonth = (direction: number) => {
    const [year, month] = selectedMonthYear.split('-').map(Number);
    const date = new Date(year, month - 1 + direction, 1);
    const newStr = date.toISOString().slice(0, 7);
    setSelectedMonthYear(newStr);
  };

  const formatMonthLabel = (myStr: string) => {
    const [year, month] = myStr.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Total summary of selected month
  const totalBudgeted = filteredBudgets.reduce((acc, b) => acc + b.limitAmount, 0);
  const totalSpentInBudgets = filteredBudgets.reduce((acc, b) => {
    const { spent } = getConsumption(b);
    return acc + spent;
  }, 0);
  const overallPercent = totalBudgeted > 0 ? (totalSpentInBudgets / totalBudgeted) * 100 : 0;

  // Let's check spend warning conditions
  const exceededCount = filteredBudgets.filter(b => getConsumption(b).percent >= 100).length;
  const warningCount = filteredBudgets.filter(b => {
    const p = getConsumption(b).percent;
    return p >= 85 && p < 100;
  }).length;

  return (
    <div id="budget-monitor-panel" className="bento-card p-6 sm:p-8 group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl">
      {/* Subtle background glow */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-emerald-500 blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none" />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={cn(
              "absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-lg border text-xs font-semibold",
              toast.type === 'success' 
                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/50 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/50 text-rose-800 dark:text-rose-300"
            )}
          >
            {toast.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
              <Target className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-slate-900 dark:text-white tracking-tight">Monitor Budget Pengeluaran</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Atur, kustomisasi & pantau batas pengeluaran</p>
            </div>
          </div>
        </div>

        {/* Navigation & Add Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Month Navigator */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <button 
              onClick={() => changeMonth(-1)}
              className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
              title="Bulan sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 px-3 min-w-[120px] text-center uppercase tracking-wider">
              {formatMonthLabel(selectedMonthYear)}
            </span>
            <button 
              onClick={() => changeMonth(1)}
              className="p-1 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
              title="Bulan berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Add budget button */}
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={cn(
              "flex items-center gap-2 text-xs font-black px-4 py-2.5 rounded-2xl transition-all uppercase tracking-wider",
              isAdding 
                ? "bg-slate-150 dark:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700" 
                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/10"
            )}
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isAdding ? 'Batal' : 'Tambah Budget'}
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-slate-50 dark:bg-slate-800/10 rounded-3xl p-5 border border-slate-100 dark:border-slate-800/40 relative z-10">
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Batas Budget ({formatMonthLabel(selectedMonthYear)})</p>
          <p className="text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(totalBudgeted)}</p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Total Penggunaan</p>
          <p className="text-xl font-black text-slate-850 dark:text-slate-200">
            {formatCurrency(totalSpentInBudgets)} 
            <span className="text-xs font-medium text-slate-400 ml-1.5">({Math.round(overallPercent)}%)</span>
          </p>
        </div>
        <div className="flex items-center">
          <div className="w-full bg-slate-200/50 dark:bg-slate-850 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/20">
            <div 
              style={{ width: `${Math.min(overallPercent, 100)}%` }}
              className={cn(
                "h-full rounded-full transition-all duration-700",
                overallPercent < 50 ? "bg-emerald-500" :
                overallPercent < 85 ? "bg-amber-500" :
                "bg-rose-500"
              )}
            />
          </div>
        </div>
      </div>

      {/* Dynamic Add Budget Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddBudget}
            className="overflow-hidden mb-8 p-6 bg-slate-50 dark:bg-slate-850/40 rounded-3xl border border-slate-200/60 dark:border-slate-800 relative z-10"
          >
            <h3 className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-widest mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" /> Tambah Kategori Budget Baru
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category selector type */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Kategori</label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="custom-cat-toggle"
                      checked={isCustomCategory}
                      onChange={(e) => setIsCustomCategory(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                    />
                    <label htmlFor="custom-cat-toggle" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer font-bold">Kategori kustom baru?</label>
                  </div>
                  
                  {isCustomCategory ? (
                    <input 
                      type="text"
                      placeholder="Contoh: Hiburan, Kos"
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                      required
                    />
                  ) : (
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-semibold"
                    >
                      {EXPENSE_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Limit Amount Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Batas Limit (IDR)</label>
                <input 
                  type="number"
                  placeholder="Batas nominal, misal: 500000"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-bold"
                  required
                />
              </div>

              {/* Month / Year */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Periode Bulan</label>
                <input 
                  type="month"
                  value={newMonthYear}
                  onChange={(e) => setNewMonthYear(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:border-emerald-500 text-slate-900 dark:text-white font-semibold"
                  required
                />
              </div>

              {/* Save Button Container */}
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-emerald-500/10 transition-colors uppercase tracking-widest"
                >
                  Simpan Batas
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Main Budget List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        <AnimatePresence mode="popLayout">
          {filteredBudgets.map((budget) => {
            const { spent, limit, percent } = getConsumption(budget);
            const isEditing = editingBudgetId === budget.id;

            return (
              <motion.div 
                key={budget.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex flex-col justify-between p-5 rounded-[2rem] border transition-all relative overflow-hidden bg-slate-50/50 dark:bg-slate-800/10",
                  percent >= 100 
                    ? "border-rose-200 dark:border-rose-900/30 bg-rose-50/10 dark:bg-rose-950/5" 
                    : percent >= 85 
                      ? "border-amber-200 dark:border-amber-900/30 bg-amber-50/10" 
                      : "border-slate-100 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700/50"
                )}
              >
                {/* Decorative status indicators */}
                {percent >= 100 && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500 blur-[50px] opacity-10 pointer-events-none" />
                )}

                <div className="space-y-4">
                  {/* Category and consumption percent tag */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-850 dark:text-slate-100 tracking-tight">{budget.category}</span>
                        {percent >= 100 && <AlertCircle className="w-4 h-4 text-rose-500 animate-bounce" />}
                      </div>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">{formatMonthLabel(budget.monthYear)}</p>
                    </div>

                    <span className={cn(
                      "text-[10px] font-black tracking-widest px-2.5 py-1 rounded-xl",
                      percent < 85 
                        ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" 
                        : percent < 100 
                          ? "text-amber-600 dark:text-amber-400 bg-amber-500/10 animate-pulse" 
                          : "text-rose-600 dark:text-rose-400 bg-rose-500/10"
                    )}>
                      {Math.round(percent)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="h-3 w-full bg-slate-150 dark:bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800/80">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percent, 100)}%` }}
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          percent < 50 ? "bg-emerald-500" :
                          percent < 85 ? "bg-amber-500" :
                          "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                        )}
                      />
                    </div>
                  </div>

                  {/* Amounts Info */}
                  <div className="pt-1">
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      Penggunaan: <span className="text-slate-700 dark:text-slate-300 font-extrabold">{formatCurrency(spent)}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                      Batas Batas: <span className="text-slate-800 dark:text-slate-200 font-black">{formatCurrency(limit)}</span>
                    </p>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  {/* Left Side: Delete */}
                  <button 
                    onClick={() => handleDelete(budget.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                    title="Hapus budget ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Right Side: Edit control state */}
                  {!isEditing ? (
                    <button 
                      onClick={() => { setEditingBudgetId(budget.id || null); setEditValue(limit.toString()); }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10 transition-all uppercase tracking-widest"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Sesuaikan
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 animate-in fade-in slide-in-from-right-1">
                      <input 
                        type="number"
                        value={editValue}
                        autoFocus
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold outline-none text-slate-900 dark:text-white focus:border-emerald-500"
                        placeholder="Limit baru"
                      />
                      <button 
                        onClick={() => handleSaveBudget(budget.id || '', budget.category, budget.monthYear, editValue)} 
                        className="p-1.5 text-emerald-600 hover:bg-emerald-500/10 rounded-lg transition-colors"
                        title="Simpan perubahan"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setEditingBudgetId(null)} 
                        className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Batal"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredBudgets.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50 dark:bg-slate-800/5 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-[1.5rem] flex items-center justify-center text-slate-400 mb-4">
              <Info className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Belum ada budget untuk bulan ini.</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Atur batas pengeluaran bulanan Anda untuk memantau kesehatan keuangan.</p>
            <button 
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 text-xs font-black bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-xl transition-all uppercase tracking-widest"
            >
              <Plus className="w-4 h-4" />
              Atur Budget Sekarang
            </button>
          </div>
        )}
      </div>

      {/* Spacing warnings if any */}
      {(exceededCount > 0 || warningCount > 0) && (
        <div className="mt-8 p-5 bg-gradient-to-br from-rose-500/10 to-transparent border border-rose-500/20 rounded-3xl flex items-center gap-4 relative overflow-hidden group/alert">
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover/alert:opacity-10 transition-opacity">
            <AlertCircle className="w-16 h-16 text-rose-500" />
          </div>
          <div className="p-3 bg-rose-500/10 rounded-2xl">
            <AlertCircle className="w-6 h-6 text-rose-500 shrink-0" />
          </div>
          <div className="space-y-1 relative z-10">
            <p className="font-black text-rose-600 dark:text-rose-200 uppercase tracking-widest text-xs">Peringatan Batas Limit Pengeluaran</p>
            <p className="text-rose-500/80 dark:text-rose-400/80 text-[11px] leading-relaxed font-medium">
              {exceededCount > 0 && `Ada ${exceededCount} kategori budget yang telah melebihi 100% batas pengeluaran. `}
              {warningCount > 0 && `Ada ${warningCount} kategori budget yang mendekati batas limit (>85%). `}
              Segera evaluasi pengeluaran Anda agar tabungan tetap terjaga.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
