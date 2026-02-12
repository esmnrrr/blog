"use client"; // Bu satır önemli, çünkü tıklama işlemi var
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth } from "@/app/firebase"; // Dosya yoluna dikkat
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);

  // Sayfa açılınca kullanıcının giriş yapıp yapmadığını kontrol et
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Google ile Giriş Yapma Fonksiyonu
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
    <nav className="flex items-center justify-between px-8 py-4 bg-gray-900 border-b border-gray-700 text-white">
      {/* Sol Taraf: Logo */}
      <Link href="/" className="text-2xl font-bold text-pink-500 tracking-tighter">
        HIKAMSE
      </Link>

      {/* Orta Taraf: Linkler */}
      <div className="hidden md:flex space-x-6 text-sm font-medium">
        <Link href="/" className="hover:text-pink-400 transition">Ana Sayfa</Link>
        <Link href="/romantik" className="hover:text-pink-400 transition">Romantik</Link>
        <Link href="/gizem" className="hover:text-pink-400 transition">Gizem</Link>
      </div>

      {/* Sağ Taraf: Arama ve Profil */}
      <div className="flex items-center space-x-4">
        {/* Kullanıcı Giriş Yapmışsa Profil Resmini Göster */}
        {user ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm hidden sm:block">Selam, {user.displayName.split(" ")[0]}</span>
            <img 
              src={user.photoURL} 
              alt="Profil" 
              className="w-10 h-10 rounded-full border-2 border-pink-500 cursor-pointer"
              onClick={handleLogout} // Resme basınca çıkış yapsın (şimdilik)
            />
          </div>
        ) : (
          // Giriş Yapmamışsa Butonu Göster
          <button 
            onClick={handleGoogleLogin}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-700 rounded-full text-sm font-bold transition"
          >
            Giriş Yap
          </button>
        )}
      </div>
    </nav>
  );
}