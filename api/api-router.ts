import express from "express";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

function generateLocalAiReply(message: string): string {
  const msg = message.toLowerCase();
  
  if (msg === "halo" || msg === "hai" || msg === "pagi" || msg === "siang" || msg === "sore" || msg === "malam") {
    return "Halo! Terima kasih telah menghubungi ScholarWallet. Saya adalah ScholarWallet AI Assistant. Ada yang bisa saya bantu hari ini? Anda bisa bertanya tentang mengelola anggaran, membuat target tabungan, mencatat transaksi, atau melaporkan kendala teknis.";
  }
  
  if (msg.includes("cara membuat anggaran") || msg.includes("bantu saya mengatur anggaran") || msg.includes("cara mengatur budget")) {
    return "Tentu! Di ScholarWallet, Anda bisa mengelola anggaran dengan bijak melalui fitur **Anggaran (Budget Monitors)**.\n\n" +
           "💡 **Tips Hemat untuk Mahasiswa:**\n" +
           "1. **Bagi Anggaran (50/30/20):** Alokasikan 50% untuk kebutuhan pokok (kos, makan), 30% untuk keinginan (jajan, hiburan), dan 20% untuk tabungan/investasi.\n" +
           "2. **Pantau Pengeluaran:** Selalu catat setiap transaksi pengeluaran harian Anda di menu 'Catatan Transaksi'.\n" +
           "3. **Aktifkan Alert:** Atur batas anggaran di aplikasi agar Anda mendapat peringatan saat pengeluaran mendekati limit.\n\n" +
           "Apakah ada anggaran khusus yang ingin Anda diskusikan?";
  }
  
  if (msg.includes("cara menabung") || msg.includes("tips menabung") || msg.includes("buat target tabungan")) {
    return "Wah, senang mendengarnya! Menabung adalah langkah awal yang luar biasa untuk masa depan Anda.\n\n" +
           "Di ScholarWallet, Anda bisa menggunakan fitur **Target Tabungan (Savings & Goals)** untuk:\n" +
           "1. Menentukan target tabungan spesifik (misal: Beli Laptop Baru, Dana Darurat).\n" +
           "2. Memantau progres tabungan secara berkala.\n" +
           "3. Menghitung berapa banyak yang perlu disisihkan setiap minggu/bulan untuk mencapai target Anda.\n\n" +
           "Mulailah dengan target kecil dan konsisten! Adakah target tabungan yang sedang ingin Anda capai saat ini?";
  }
  
  if (msg.includes("aplikasi error") || msg.includes("ada bug") || msg.includes("tidak bisa dibuka")) {
    return "Mohon maaf atas ketidaknyamanan yang Anda alami. Kami sangat memahami kendala teknis dapat mengganggu aktivitas belajar Anda.\n\n" +
           "Silakan berikan detail kendala tersebut:\n" +
           "- Halaman/fitur apa yang bermasalah?\n" +
           "- Apakah ada pesan error tertentu yang muncul?\n" +
           "- Langkah apa yang sudah Anda lakukan?\n\n" +
           "Laporan Anda telah diteruskan ke tim teknis kami untuk segera ditindaklanjuti. Terima kasih telah membantu kami meningkatkan kualitas ScholarWallet!";
  }
  
  if (msg.includes("cara mencatat transaksi") || msg.includes("tambah pemasukan") || msg.includes("tambah pengeluaran")) {
    return "Fitur **Catatan Transaksi (Transaction Ledger)** di ScholarWallet dirancang untuk melacak seluruh aliran uang Anda dengan mudah.\n\n" +
           "Cara mencatat transaksi:\n" +
           "1. Masuk ke halaman Dashboard utama.\n" +
           "2. Klik tombol 'Tambah Transaksi'.\n" +
           "3. Masukkan jumlah uang, kategori (makanan, transportasi, buku, dll.), tanggal, serta jenisnya (pemasukan/pengeluaran).\n" +
           "4. Klik Simpan, dan grafik keuangan Anda akan otomatis terupdate!\n\n" +
           "Coba catat pengeluaran terkecil Anda hari ini untuk membiasakan diri melacak keuangan.";
  }

  return "Maaf, saat ini AI utama tidak dapat memproses permintaan karena koneksi API Key bermasalah. Saya hanya dapat menjawab pertanyaan bawaan (template) seperti 'cara membuat anggaran' atau 'cara menabung'.";
}

const apiRouter = express.Router();

// Gemini AI Chat Auto-Reply Endpoint
apiRouter.post("/chat/auto-reply", async (req, res) => {
    try {
      const body = req.body || {};
      const { message, history } = body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      const apiKey = process.env.NEW_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn("No Gemini API key found, using local fallback.");
        const localReply = generateLocalAiReply(message);
        return res.json({ reply: localReply });
      }

      const systemInstruction = `
Kamu adalah ScholarWallet AI, asisten keuangan cerdas yang didesain khusus untuk mahasiswa.
Tugas utamamu adalah memberikan saran keuangan, menjawab pertanyaan seputar manajemen uang, dan memberikan panduan penggunaan aplikasi ScholarWallet.

Gaya Komunikasi:
- Ramah, profesional, suportif, dan menggunakan bahasa Indonesia yang baik dan gaul (ala mahasiswa).
- Panggil pengguna dengan sebutan "Kak" atau "kamu".
- Berikan saran yang praktis, aplikatif, dan mudah dipahami.
- Hindari memberikan saran investasi yang berisiko tinggi atau ilegal.

Konteks Aplikasi ScholarWallet:
- Fitur utama: Pencatatan Pemasukan/Pengeluaran, Budget Monitors (Anggaran), Savings & Goals (Target Tabungan).
- Jika pengguna bertanya cara menggunakan fitur, jelaskan langkah-langkahnya secara singkat.

Konteks Percakapan:
Pengguna mengirim pesan: "${message}"
${history ? `Riwayat percakapan sebelumnya: ${JSON.stringify(history)}` : ''}
      `.trim();

      const prompt = `Pesan pengguna: ${message}`;

      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            }
          }
        });
        
        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 1000,
            }
          });
        } catch (err: any) {
          throw err;
        }
        
        res.json({ reply: response.text });
      } catch (geminiError: any) {
        if (geminiError.message && (geminiError.message.includes("429") || geminiError.message.toLowerCase().includes("quota"))) {
           res.json({ reply: "Maaf, batas penggunaan AI harian (kuota) saat ini telah tercapai. Harap tunggu beberapa saat atau cek limit API Anda. Anda tetap bisa menggunakan fitur aplikasi seperti biasa." });
        } else if (geminiError.message && (geminiError.message.includes("503") || geminiError.message.toLowerCase().includes("unavailable") || geminiError.message.toLowerCase().includes("high demand"))) {
           res.json({ reply: "⚠️ **INFO PENTING**: Server AI Google saat ini sedang mengalami lonjakan permintaan (High Demand - Error 503) sehingga tidak dapat merespons pertanyaan Anda saat ini. Silakan coba beberapa saat lagi.\n\n*(Saat ini Anda menggunakan mode respons otomatis dasar)*" });
        } else if (geminiError.message && (geminiError.message.includes("403") || geminiError.message.toLowerCase().includes("denied"))) {
           res.json({ reply: "⚠️ **INFO PENTING**: API Key yang Anda masukkan diblokir atau ditolak oleh server (Error 403). Hal ini biasanya terjadi jika project di Google Cloud Anda ditangguhkan atau tidak memiliki akses ke Gemini API.\n\nUntuk mendapatkan API Key gratis yang baru, kunjungi **aistudio.google.com/app/apikey**, pilih **Create API key in new project**, dan masukkan key baru tersebut ke pengaturan aplikasi ini.\n\n*(Saat ini Anda menggunakan mode respons otomatis dasar)*" });
        } else {
           const localReply = generateLocalAiReply(message);
           res.json({ reply: localReply + `\n\n*(Catatan Teknis: Model AI gagal merespons dengan pesan error: ${geminiError.message || "Unknown error"}. Pastikan API Key valid)*` });
        }
      }
    } catch (error: any) {
      console.log("Error in auto-reply route:", error);
      res.json({ reply: `⚠️ Maaf, terjadi kesalahan internal di server AI. (${error.message || "Unknown Error"}). Anda bisa mencoba lagi nanti.` });
    }
});

export default apiRouter;
