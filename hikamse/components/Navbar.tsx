"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "@/app/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const [ruhHaliAcik, setRuhHaliAcik] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Giriş hatası:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <nav
      className="bg-gray-900 border-b border-gray-700 text-white relative"
      style={{ zIndex: 9999 }}
      onMouseLeave={() => { setMenuAcik(false); setRuhHaliAcik(false); }}
    >
      {/* Üst Satır */}
      <div className="flex items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-pink-500 tracking-tighter">
          HIKAMSE
        </Link>

        {/* Orta */}
        <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="hover:text-pink-400 transition">Ana Sayfa</Link>

          {/* Kategoriler Butonu */}
          <button
            onMouseEnter={() => { setMenuAcik(true); setRuhHaliAcik(false); }}
            className="flex items-center space-x-1 hover:text-pink-400 transition-colors py-2 outline-none"
          >
            <span>Kategoriler</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${menuAcik ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Ruh Haline Göre Butonu */}
          <button
            onMouseEnter={() => { setRuhHaliAcik(true); setMenuAcik(false); }}
            className="flex items-center space-x-1 hover:text-purple-400 transition-colors py-2 outline-none"
          >
            <span>Ruh Haline Göre</span>
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${ruhHaliAcik ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Sağ */}
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm hidden sm:block font-medium">
                Selam, {user.displayName?.split(" ")[0]}
              </span>
              <Link href="/profile">
                <img
                  src={user.photoURL || ""}
                  alt="Profil"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${user.displayName || "U"}&background=db2777&color=fff&bold=true`;
                  }}
                  className="w-10 h-10 rounded-full border-2 border-pink-500 cursor-pointer hover:scale-110 hover:border-white transition object-cover"
                />
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1.5 rounded transition"
              >
                Çıkış
              </button>
            </div>
          ) : (
            <button
              onClick={handleGoogleLogin}
              className="px-5 py-2 bg-pink-600 hover:bg-pink-700 rounded-full text-sm font-bold shadow-lg transition"
            >
              Giriş Yap
            </button>
          )}
        </div>
      </div>

      {/* Kategori Barı */}
      {menuAcik && (
        <div className="absolute top-[100%] left-0 w-full bg-gray-900 bg-opacity-75 backdrop-blur-md border-b border-pink-500/30 shadow-2xl py-4 z-[9999]">
          
          <div className="flex justify-center w-full px-8">
            {/* 3'erli yan yana sıralama mantığı (Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-20 gap-y-3 w-fit">
              <Link href="/kategori/romantik" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>💖</span><span>Romantik / Komedi</span></Link>
              <Link href="/kategori/korku" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>👻</span><span>Korku / Gerilim</span></Link>
              <Link href="/kategori/gizem" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>🕵️‍♂️</span><span>Gizem</span></Link>
              
              <Link href="/kategori/polisiye" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>🚓</span><span>Polisiye</span></Link>
              <Link href="/kategori/fantastik" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>✨</span><span>Fantastik</span></Link>
              <Link href="/kategori/bilim-kurgu" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>👽</span><span>Bilim Kurgu</span></Link>
              
              <Link href="/kategori/dram" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>🎭</span><span>Dram</span></Link>
              <Link href="/kategori/aksiyon" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>💥</span><span>Aksiyon</span></Link>
              <Link href="/kategori/aile" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>👨‍👩‍👧‍👦</span><span>Aile</span></Link>
              
              <Link href="/kategori/tarihi" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>📜</span><span>Tarihi</span></Link>
              <Link href="/kategori/program" className="text-gray-300 hover:text-pink-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>📺</span><span>Program</span></Link>
            </div>
          </div>

        </div>
      )}

      {/* Ruh Hali Barı */}
      {ruhHaliAcik && (
        <div className="absolute top-[100%] left-0 w-full bg-gray-900 bg-opacity-75 backdrop-blur-md border-b border-purple-500/30 shadow-2xl py-4 z-[9999]">
          <div className="flex justify-center w-full px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-20 gap-y-3 w-fit">
              <Link href="/ruh-hali/cerezlik" className="text-gray-300 hover:text-purple-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>🍿</span><span>Çerezlik (Kafa Dağıtmalık)</span></Link>
              <Link href="/ruh-hali/aglatanlar" className="text-gray-300 hover:text-purple-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>😭</span><span>Ağlatanlar (Mendil Tüketen)</span></Link>
              <Link href="/ruh-hali/beyin-yakan" className="text-gray-300 hover:text-purple-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>🤯</span><span>Beyin Yakanlar</span></Link>
              <Link href="/ruh-hali/kalp-isitan" className="text-gray-300 hover:text-purple-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>🥰</span><span>Kalp Isıtanlar</span></Link>
              <Link href="/ruh-hali/tirnak-yedirten" className="text-gray-300 hover:text-purple-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>💅</span><span>Tırnak Yedirten</span></Link>
              <Link href="/ruh-hali/ilham-veren" className="text-gray-300 hover:text-purple-400 hover:-translate-y-1 transition-transform flex items-center gap-2"><span>✨</span><span>İlham Veren</span></Link>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
}