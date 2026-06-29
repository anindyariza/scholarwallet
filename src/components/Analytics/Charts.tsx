import React from 'react';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
} from 'chart.js';
import { BarChart3, PieChart } from 'lucide-react';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Transaction, EXPENSE_CATEGORIES } from '../../types';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title,
  PointElement,
  LineElement
);

interface AnalyticsChartsProps {
  transactions: Transaction[];
}

export default function AnalyticsCharts({ transactions }: AnalyticsChartsProps) {
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));

  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Resilience: Helper to get month string from date (Timestamp or String)
  const getMonthStr = (date: any) => {
    try {
      if (!date) return "";
      const d = date.toDate ? date.toDate() : new Date(date);
      return d.toISOString().slice(0, 7);
    } catch (e) {
      return "";
    }
  };

  const currentMonth = new Date().toISOString().slice(0, 7);

  // 1. Expense Breakdown (Doughnut)
  const expenseDataResults = React.useMemo(() => {
    const categories = EXPENSE_CATEGORIES;
    const data = categories.map(cat => {
      const total = transactions
        .filter(t => t.type === 'expense' && t.category === cat && getMonthStr(t.date) === currentMonth)
        .reduce((acc, t) => acc + t.amount, 0);
      return total;
    });
    
    // Filter out categories with 0 for the doughnut to look better
    const filtered = categories.map((cat, i) => ({ label: cat, value: data[i] })).filter(d => d.value > 0);
    
    return {
      labels: filtered.length > 0 ? filtered.map(f => f.label) : [...categories],
      values: filtered.length > 0 ? filtered.map(f => f.value) : data,
      isEmpty: filtered.length === 0 && data.every(v => v === 0)
    };
  }, [transactions, currentMonth]);

  const doughnutData = React.useMemo(() => ({
    labels: expenseDataResults.labels,
    datasets: [
      {
        data: expenseDataResults.values,
        backgroundColor: [
          '#3b82f6', // blue
          '#10b981', // emerald
          '#f59e0b', // amber
          '#f43f5e', // rose
          '#8b5cf6', // violet
          '#6366f1', // indigo
        ],
        borderWidth: 0,
        hoverOffset: 15,
      },
    ],
  }), [expenseDataResults]);

  // 2. Month-over-Month Comparison (Stacked Bar)
  const chartData6Months = React.useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toISOString().slice(0, 7);
    });

    const income = months.map(m => 
      transactions.filter(t => t.type === 'income' && getMonthStr(t.date) === m).reduce((acc, t) => acc + t.amount, 0)
    );

    const expense = months.map(m => 
      transactions.filter(t => t.type === 'expense' && getMonthStr(t.date) === m).reduce((acc, t) => acc + t.amount, 0)
    );

    return {
      labels: months.map(m => {
        const [year, month] = m.split('-');
        return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('en-US', { month: 'short' });
      }),
      income,
      expense
    };
  }, [transactions]);

  const barData = React.useMemo(() => ({
    labels: chartData6Months.labels,
    datasets: [
      {
        label: 'Income',
        data: chartData6Months.income,
        backgroundColor: '#10b981',
        borderRadius: 8,
      },
      {
        label: 'Expenses',
        data: chartData6Months.expense,
        backgroundColor: '#f43f5e',
        borderRadius: 8,
      },
    ],
  }), [chartData6Months]);

  const textColor = isDark ? '#71717a' : '#64748b';
  const gridColor = isDark ? '#27272a' : '#f1f5f9';

  const commonPlugins = React.useMemo(() => ({
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        padding: 20,
        color: textColor,
        font: { family: 'Inter', size: 10, weight: '500' as any },
      },
    },
    tooltip: {
      enabled: true,
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      titleColor: isDark ? '#f8fafc' : '#0f172a',
      bodyColor: isDark ? '#a1a1aa' : '#64748b',
      borderColor: isDark ? '#27272a' : '#f1f5f9',
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
      callbacks: {
        label: (context: any) => ` Rp ${context.raw.toLocaleString()}`
      }
    }
  }), [isDark, textColor]);

  const doughnutOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: commonPlugins,
    cutout: '70%',
  }), [commonPlugins]);

  const barOptions = React.useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: commonPlugins,
    scales: {
      y: { 
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { 
          color: textColor, 
          font: { size: 10 },
          callback: (value: any) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : value.toLocaleString()
        }
      },
      x: { 
        grid: { display: false },
        ticks: { color: textColor, font: { size: 10 } }
      },
    }
  }), [commonPlugins, gridColor, textColor]);

  if (transactions.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center h-[300px] sm:h-[400px]">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl mb-4">
            <BarChart3 className="w-8 h-8 text-slate-300 dark:text-slate-700" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">No Analytics</h3>
          <p className="text-[10px] text-slate-500 mt-2 max-w-[200px]">Enter transactions to unlock financial insights.</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center h-[300px] sm:h-[400px]">
          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl mb-4">
            <PieChart className="w-8 h-8 text-slate-300 dark:text-slate-700" />
          </div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Awaiting Data</h3>
          <p className="text-[10px] text-slate-500 mt-2 max-w-[200px]">Category breakdown will appear here once you log expenses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm h-[350px] sm:h-[400px] flex flex-col transition-all">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Expense Breakdown</h3>
          <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-tight mt-1">Category Distribution</p>
        </div>
        <div key={`doughnut-${isDark}`} className="relative flex-1 mt-4 sm:mt-6">
          <Doughnut data={doughnutData} options={doughnutOptions} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm h-[350px] sm:h-[400px] flex flex-col transition-all">
        <div>
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50 uppercase tracking-widest">Income vs Expenses</h3>
          <p className="text-[9px] sm:text-[10px] text-slate-500 uppercase tracking-tight mt-1">6-Month Academic Cycle</p>
        </div>
        <div key={`bar-${isDark}`} className="relative flex-1 mt-4 sm:mt-6">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}
