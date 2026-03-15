"use client";
import { useState } from "react";
import { db } from "@/app/firebase"; // Kendi firebase dosya yoluna göre ayarla (örn: '../firebase' olabilir)
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error, exists

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      // 1. Önce bu mail veritabanında var mı diye kontrol edelim (Spam engelleme)
      const q = query(collection(db, "subscribers"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setStatus("exists");
        return;
      }

      // 2. Mail yoksa yeni abone olarak Firebase'e ekleyelim
      await addDoc(collection(db, "subscribers"), {
        email: email,
        subscribedAt: new Date(),
      });

      setStatus("success");
      setEmail(""); // Kutucuğu temizle

      // 3 saniye sonra mesajı gizle
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      console.error("Abonelik hatası:", error);
      setStatus("error");
    }
  };

  return (
    <section className="w-full py-16 mt-12 border-t border-gray-800 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      {/* Arka plan süslemeleri */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-pink-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
          Yeni İncelemeleri Kaçırma! 🍿
        </h2>
        <p className="text-gray-400 text-sm md:text-base mb-8 max-w-xl mx-auto">
          Haftanın favori dizileri, en taze incelemeler ve sürpriz öneriler doğrudan e-posta kutuna gelsin. Spam yok, sadece kaliteli dizi muhabbeti.
        </p>

        <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresin..."
            required
            className="w-full sm:w-2/3 px-5 py-3 rounded-full bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-pink-600 hover:bg-pink-500 text-white font-bold transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pink-600/30"
          >
            {status === "loading" ? "Ekleniyor..." : "Abone Ol"}
          </button>
        </form>

        {/* Durum Mesajları */}
        <div className="mt-4 h-6 text-sm font-medium">
          {status === "success" && <p className="text-green-400">🎉 Harika! Bültene başarıyla abone oldun.</p>}
          {status === "exists" && <p className="text-yellow-400">😅 Bu e-posta adresi zaten bültenimize kayıtlı.</p>}
          {status === "error" && <p className="text-red-400">❌ Bir hata oluştu, lütfen tekrar dene.</p>}
        </div>
      </div>
    </section>
  );
}