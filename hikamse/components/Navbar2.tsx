"use client"; // Bu satır önemli, çünkü tıklama işlemi var
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "@/app/firebase"; // Dosya yoluna dikkat
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Sayfa açılınca kullanıcının giriş yapıp yapmadığını kontrol et
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Google ile Giriş Yapma Fonksiyonu - Popup
    const handleGoogleLogin = async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error("Giriş hatası:", error);
      }
    };

  // Çıkış Yapma Fonksiyonu
  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav className="flex items-center justify-between px-8 py-4 bg-gray-900 border-b border-gray-700 text-white relative z-50">
      {/* Sol Taraf: Logo */}
      <Link href="/" className="text-2xl font-bold text-pink-500 tracking-tighter">
        HIKAMSE
      </Link>

      {/* Orta Taraf: Linkler ve Tam Ekran Mega Menü */}
      <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
        
        {/* Ana Sayfa Linki */}
        <Link href="/" className="hover:text-pink-400 transition">Ana Sayfa</Link>
        
        {/* Kategoriler Hover Grubu */}
        <div className="group">
          <button className="flex items-center space-x-1 hover:text-pink-400 transition-colors py-2 outline-none">
            <span>Kategoriler</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </button>

          {/* GİZLİ TAM EKRAN MEGA MENÜ (Fare üzerine gelince tüm ekranı kaplar) */}
          <div className="absolute top-full left-0 w-full bg-gray-900/95 backdrop-blur-xl border-b border-pink-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.5)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[99999]">
           
            {/* İçerik Konteyneri (Ortalamak için) */}
            <div className="container mx-auto px-8 py-10">
              
              {/* 3 Sütunlu Grid Sistemi */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-y-6 gap-x-12 max-w-5xl mx-auto">
                <Link href="/kategori/romantik" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>💖</span> <span>Romantik / Komedi</span></Link>
                <Link href="/kategori/korku" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>👻</span> <span>Korku / Gerilim</span></Link>
                <Link href="/kategori/gizem" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>🕵️‍♂️</span> <span>Gizem</span></Link>
                
                <Link href="/kategori/polisiye" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>🚓</span> <span>Polisiye</span></Link>
                <Link href="/kategori/fantastik" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>✨</span> <span>Fantastik</span></Link>
                <Link href="/kategori/bilim-kurgu" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>👽</span> <span>Bilim Kurgu</span></Link>
                
                <Link href="/kategori/dram" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>🎭</span> <span>Dram</span></Link>
                <Link href="/kategori/aksiyon" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>💥</span> <span>Aksiyon</span></Link>
                <Link href="/kategori/aile" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>👨‍👩‍👧‍👦</span> <span>Aile</span></Link>
                <Link href="/kategori/tarihi" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>📜</span> <span>Tarihi</span></Link>
                <Link href="/kategori/program" className="text-gray-300 hover:text-pink-400 hover:translate-x-1 transition-transform flex items-center space-x-2"><span>📺</span> <span>Program</span></Link>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf: Profil ve Giriş İşlemleri */}
      <div className="flex items-center space-x-4">
        {user ? (
          // Giriş Yapılmışsa Görünecek Kısım
          <div className="flex items-center space-x-3">
            <span className="text-sm hidden sm:block font-medium">
              Selam, {user.displayName?.split(" ")[0]}
            </span>
            
            {/* Profil Resmi (Tıklayınca /profile sayfasına gider) */}
            <Link href="/profile">
              <img 
                src={user.photoURL || "https://via.placeholder.com/150"} 
                alt="Profil" 
                // YENİ: Resim yüklenemezse isminin baş harfinden pembe bir logo yapar!
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.displayName || 'U'}&background=db2777&color=fff&bold=true`;
                }}
                className="w-10 h-10 rounded-full border-2 border-pink-500 cursor-pointer hover:scale-110 hover:border-white transition object-cover"
                title="Profilime Git"
              />
            </Link>

            {/* Çıkış Butonu */}
            <button 
              onClick={handleLogout}
              className="text-xs bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1.5 rounded transition ml-2"
            >
              Çıkış
            </button>
          </div>
        ) : (
          // Giriş Yapılmamışsa Görünecek Buton
          <button 
            onClick={handleGoogleLogin}
            className="px-5 py-2 bg-pink-600 hover:bg-pink-700 rounded-full text-sm font-bold shadow-lg transition"
          >
            Giriş Yap
          </button>
        )}
      </div>
    </nav>
  );
}