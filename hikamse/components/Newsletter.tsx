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
    <div className="fixed bottom-6 left-6 z-[9999] w-full max-w-[380px] p-5 rounded-2xl shadow-2xl bg-gradient-to-br from-[#a88beb] to-[#f8ceec] border border-white/20 animate-fade-in-up">
      <div className="flex items-start gap-4">
        
        {/* Çan İkonu */}
        <div className="shrink-0 bg-white/30 p-2.5 rounded-xl backdrop-blur-md">
          <svg className="w-7 h-7 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </div>

        {/* İçerik */}
        <div className="flex-1">
          {step === "initial" && (
            <>
              <h3 className="text-[15px] font-black text-gray-900 mb-1 leading-tight drop-shadow-sm">
                Dünyanın dizisi, Hikamse'de 🔥
              </h3>
              <p className="text-[13px] text-gray-800 font-medium mb-4 leading-snug">
                Ücretsiz dizi keyfin devam etsin diye güncellemeleri kaçırma!
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleDismiss}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-900 text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Daha sonra
                </button>
                <button 
                  onClick={() => setStep("input")}
                  className="flex-1 bg-gray-900 hover:bg-black text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors shadow-sm"
                >
                  Kaydol
                </button>
              </div>
            </>
          )}

          {step === "input" && (
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2 animate-fade-in">
              <h3 className="text-[14px] font-black text-gray-900 mb-1">E-posta Adresin:</h3>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                required
                className="w-full text-sm px-3 py-2 rounded-lg bg-white/70 border border-white/50 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-900"
              />
              <div className="flex items-center gap-2 mt-1">
                <button 
                  type="button"
                  onClick={() => setStep("initial")}
                  className="text-gray-800 text-xs font-bold hover:underline px-2"
                >
                  İptal
                </button>
                <button 
                  type="submit"
                  disabled={status === "loading"}
                  className="flex-1 bg-gray-900 hover:bg-black text-white text-xs font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {status === "loading" ? "Bekleniyor..." : "Abone Ol"}
                </button>
              </div>
              {status === "exists" && <p className="text-red-600 text-[11px] font-bold mt-1">Bu e-posta zaten kayıtlı!</p>}
              {status === "error" && <p className="text-red-600 text-[11px] font-bold mt-1">Bir hata oluştu!</p>}
            </form>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center justify-center py-2 animate-fade-in">
              <span className="text-2xl mb-1">🎉</span>
              <p className="text-[14px] font-black text-gray-900 text-center">Aramıza Hoş Geldin!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}