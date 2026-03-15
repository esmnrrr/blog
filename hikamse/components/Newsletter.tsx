"use client";
import { useState, useEffect } from "react";
import { db } from "@/app/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export default function Newsletter() {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState<"initial" | "input" | "success">("initial");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    // Kullanıcı daha önce "Daha sonra" dediyse veya abone olduysa popup'ı hiç gösterme
    const isDismissed = localStorage.getItem("newsletterDismissed");
    const isSubscribed = localStorage.getItem("newsletterSubscribed");

    if (!isDismissed && !isSubscribed) {
      // Sayfa açıldıktan 3 saniye sonra zarifçe ekrana gelsin
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    // 3 gün boyunca tekrar gösterme (örnek olarak)
    localStorage.setItem("newsletterDismissed", "true"); 
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const q = query(collection(db, "subscribers"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setStatus("exists");
        return;
      }

      await addDoc(collection(db, "subscribers"), {
        email: email,
        subscribedAt: new Date(),
      });

      await fetch('/api/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      setStatus("success");
      setStep("success");
      localStorage.setItem("newsletterSubscribed", "true"); // Bir daha asla sorma

      // 3 saniye tebrik mesajını göster, sonra popup'ı tamamen kapat
      setTimeout(() => {
        setIsVisible(false);
      }, 3000);

    } catch (error) {
      console.error("Abonelik hatası:", error);
      setStatus("error");
    }
  };

  if (!isVisible) return null;

  return (
    // Ekranın sol altına sabitlenmiş şık bildirim kutusu
    <div className="fixed bottom-6 left-6 z-[9999] w-full max-w-[380px] p-5 rounded-2xl shadow-2xl bg-gray-900 bg-opacity-95 backdrop-blur-md border border-pink-500/20 animate-fade-in-up after:absolute after:inset-0 after:bg-gradient-to-t after:from-pink-900/10 after:to-transparent after:pointer-events-none after:rounded-2xl">
      <div className="flex items-start gap-4 relative z-10">
        
        {/* Çan İkonu */}
        <div className="shrink-0 bg-pink-600/20 p-2.5 rounded-xl border border-pink-500/30">
          <svg className="w-7 h-7 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </div>

        {/* İçerik */}
        <div className="flex-1">
          {step === "initial" && (
            <>
              <h3 className="text-[15px] font-black text-white mb-1 leading-tight drop-shadow-sm">
                Yeni İncelemeleri Kaçırma! 🍿
              </h3>
              <p className="text-[13px] text-gray-300 font-medium mb-4 leading-snug">
                Haftanın favori dizileri, en taze incelemeler ve sürpriz öneriler doğrudan e-posta kutuna gelsin!
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDismiss}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Daha sonra
                </button>
                <button 
                  onClick={() => setStep("input")}
                  className="flex-1 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-pink-600/30"
                >
                  Kaydol
                </button>
              </div>
            </>
          )}

          {step === "input" && (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 animate-fade-in relative z-20">
              <h3 className="text-[14px] font-black text-white mb-1">E-posta Adresin:</h3>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                required
                className="w-full text-sm px-3 py-2 rounded-lg bg-gray-800/80 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
              />
              <div className="flex items-center gap-2 mt-1">
                <button 
                  type="button"
                  onClick={() => setStep("initial")}
                  className="text-gray-400 text-xs font-bold hover:underline px-2"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 shadow-lg shadow-pink-600/30"
                >
                  {status === "loading" ? "Bekleniyor..." : "Abone Ol"}
                </button>
              </div>
              {status === "exists" && <p className="text-yellow-400 text-[11px] font-bold mt-1">😅 Bu e-posta zaten kayıtlı!</p>}
              {status === "error" && <p className="text-red-400 text-[11px] font-bold mt-1">❌ Bir hata oluştu!</p>}
            </form>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-2 animate-fade-in relative z-20">
              <span className="text-2xl mb-1">🎉</span>
              <p className="text-[14px] font-black text-green-400 text-center">Aramıza Hoş Geldin!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}