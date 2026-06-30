import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  HelpCircle, 
  ChevronDown, 
  Wallet, 
  PiggyBank, 
  PieChart, 
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  MessageSquare,
  AlertCircle,
  Bot,
  Brain,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AboutPanel() {
  const [activeTab, setActiveTab] = useState<'guide' | 'about' | 'faq'>('guide');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const steps = [
    {
      icon: Receipt,
      title: 'Pembukuan Digital Praktis',
      description: 'Catat setiap rupiah pengeluaran harian dan pemasukan Anda (dana beasiswa, kiriman orang tua, atau gaji magang). Sistem kami mengelompokkan kategori secara otomatis agar Anda dapat melihat aliran dana dengan transparan.',
      color: 'emerald',
      badge: 'Pilar 1'
    },
    {
      icon: Bot,
      title: 'Konsultasi Interaktif AI',
      description: 'Gunakan asisten kecerdasan buatan (AI) di tab "Ask AI" sebagai konselor finansial pribadi Anda. AI akan menganalisis riwayat transaksi pembukuan Anda dan memberikan solusi taktis untuk menghemat dana kuliah.',
      color: 'indigo',
      badge: 'Pilar 2'
    },
    {
      icon: TrendingUp,
      title: 'Monitoring Budget Disiplin',
      description: 'Tetapkan batasan pengeluaran bulanan per kategori. Dapatkan peringatan otomatis saat Anda mencapai batas 85% budget agar AI dapat mengarahkan Anda kembali ke jalur hemat sebelum over-budget.',
      color: 'amber',
      badge: 'Pilar 3'
    },
    {
      icon: PiggyBank,
      title: 'Rencana Tabungan Pintar',
      description: 'Tuliskan impian akademis Anda seperti membeli laptop kuliah, biaya wisuda, atau dana darurat. Pantau progres tabungan secara visual dengan tips menabung adaptif dari sistem kami.',
      color: 'pink',
      badge: 'Pilar 4'
    }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Asisten AI Finansial',
      description: 'Memahami pola keuangan mahasiswa, memberikan rekomendasi hemat makan, menyusun skala prioritas, dan menjawab tantangan ekonomi kost harian Anda.',
    },
    {
      icon: MessageSquare,
      title: 'Kolaborasi Admin & Konselor',
      description: 'Butuh bantuan teknis atau bimbingan ekstra? Selain asisten AI, Anda juga dapat mengirim tiket konsultasi langsung kepada tim admin pengelola.',
    },
    {
      icon: Sparkles,
      title: 'Skor Kesehatan Finansial',
      description: 'Metrik kesehatan dinamis yang mengevaluasi rasio tabungan, disiplin budget, dan tingkat pemborosan berdasarkan data riil pembukuan Anda.',
    }
  ];

  const faqs = [
    {
      q: 'Bagaimana peran Asisten AI dalam ScholarWallet?',
      a: 'Asisten AI bertindak sebagai rekan konsultasi pribadi Anda. Ia terintegrasi langsung dengan database pembukuan digital Anda untuk mengenali pola belanja, memberikan tips menghemat anggaran makan atau transportasi, serta merumuskan simulasi menabung berdasarkan kondisi keuangan nyata Anda.'
    },
    {
      q: 'Apakah Asisten AI dapat melihat detail transaksi pribadi saya?',
      a: 'Ya, Asisten AI dirancang khusus untuk memproses data transaksi Anda guna memberikan rekomendasi finansial yang akurat dan personal. Namun, seluruh data ini diproses secara aman dalam sandbox privat Anda dan tidak pernah dibagikan atau digunakan untuk melatih model publik.'
    },
    {
      q: 'Bagaimana cara mengajukan pertanyaan atau berkonsultasi dengan AI?',
      a: 'Cukup buka tab "Ask" di sidebar utama, lalu ketik pertanyaan Anda. Anda bisa bertanya tentang apa saja, mulai dari "Analisis pengeluaranku bulan ini" hingga "Bagaimana strategi menyisihkan dana beasiswa Rp 1 Juta agar cukup sampai akhir semester?".'
    },
    {
      q: 'Apakah ScholarWallet sepenuhnya gratis bagi mahasiswa?',
      a: 'Tentu saja. ScholarWallet berkomitmen penuh untuk meningkatkan literasi keuangan generasi muda dengan menyediakan platform pembukuan digital dan asisten konsultasi AI secara gratis tanpa iklan maupun biaya langganan tersembunyi.'
    }
  ];

  return (
    <div id="about-and-guide-panel" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Intro Hero Header */}
      <div className="relative p-6 sm:p-10 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-indigo-500/5 dark:from-emerald-500/10 dark:via-slate-900/40 dark:to-indigo-950/20 rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/80 overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-40 h-40 text-emerald-500 dark:text-emerald-400 animate-pulse" />
        </div>
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            <Bot className="w-3.5 h-3.5 animate-bounce" />
            ScholarWallet Center &amp; AI Advisor
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase">
            Pembukuan Keuangan Digital &amp; Konsultasi AI Mahasiswa
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed font-medium">
            ScholarWallet mendefinisikan ulang cara mahasiswa mengelola keuangan. Kami menggabungkan alat pembukuan transaksi digital yang presisi dengan Asisten Kecerdasan Buatan (AI) interaktif yang selalu siap memberikan bimbingan dan analisis cerdas demi kesehatan finansial masa depan akademis Anda.
          </p>
        </div>
      </div>

      {/* Menu / Tabs Selection */}
      <div className="flex bg-slate-100/80 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/60 items-center justify-start gap-1 sm:gap-2 max-w-md">
        {[
          { id: 'guide', label: 'Cara Pakai', icon: BookOpen },
          { id: 'about', label: 'Misi & Fitur', icon: ShieldCheck },
          { id: 'faq', label: 'Tanya Jawab (FAQ)', icon: HelpCircle }
        ].map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap ${
                active 
                  ? 'text-emerald-700 dark:text-emerald-300' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10 hidden sm:inline">{tab.label}</span>
              <span className="relative z-10 sm:hidden">{tab.label.split(' ')[0]}</span>
              {active && (
                <motion.div
                  layoutId="about-active-tab"
                  className="absolute inset-0 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200/40 dark:border-slate-800/80"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Render based on Tabs */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CARA PAKAI */}
          {activeTab === 'guide' && (
            <motion.div
              key="guide-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className="bento-card group p-6 sm:p-8 relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2rem] shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`p-3 bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                        <step.icon className={`w-6 h-6 ${
                          step.color === 'emerald' ? 'text-emerald-500' :
                          step.color === 'indigo' ? 'text-indigo-500' :
                          step.color === 'pink' ? 'text-pink-500' :
                          'text-amber-500'
                        }`} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                        {step.badge}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-base sm:text-lg font-display font-black text-slate-900 dark:text-white tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Tip Box */}
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex items-start gap-4">
                <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Bot className="w-5 h-5 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Metode Belajar Finansial Bersama AI</h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-500 leading-relaxed font-medium">
                    "Setiap kali Anda selesai mencatat transaksi bulanan, cobalah tanyakan kepada Asisten AI Anda: 'Berikan evaluasi keuangan mingguan saya.' AI akan segera menganalisis data pembukuan terbaru Anda dan merancang tips penghematan instan."
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TENTANG APLIKASI (MISI & FITUR) */}
          {activeTab === 'about' && (
            <motion.div
              key="about-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2.5rem] p-6 sm:p-10 shadow-lg space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg sm:text-xl font-display font-black text-slate-900 dark:text-white tracking-tight uppercase">
                    Visi Digitalisasi &amp; Literasi AI Finansial
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                    ScholarWallet didirikan atas dasar tingginya kebutuhan mahasiswa untuk mengontrol anggaran di tengah padatnya jadwal akademis. Kami menyadari bahwa pembukuan manual sering kali membosankan dan membingungkan tanpa bimbingan ahli. Oleh karena itu, kami menghadirkan konsep **Pembukuan Keuangan Digital** terintegrasi yang dipandu langsung oleh **Asisten Konsultasi AI**. Kolaborasi cerdas ini membantu Anda memahami ke mana perginya uang saku secara lebih interaktif, menyenangkan, dan berorientasi jangka panjang.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  {features.map((feature, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl w-fit">
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Version & Specs Card */}
              <div className="bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Sistem Rilis ScholarWallet</h5>
                    <p className="text-[11px] text-slate-400">Teknologi Pembukuan Cerdas &amp; Konsultasi AI Mahasiswa</p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10 whitespace-nowrap">
                  v2.5.0 Stable Edition
                </span>
              </div>
            </motion.div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'faq' && (
            <motion.div
              key="faq-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full px-6 py-4.5 flex justify-between items-center text-left gap-4 font-display font-black text-xs sm:text-sm text-slate-900 dark:text-white hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="text-slate-400 shrink-0"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden border-t border-slate-100 dark:border-slate-800/60"
                        >
                          <div className="px-6 py-5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed bg-slate-50/30 dark:bg-slate-900/10">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

