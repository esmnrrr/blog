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

  // Google ile Giriş Yapma Fonksiyonu
  // Eski ve sorunsuz yöntem (Popup)
    const handleGoogleLogin = async () => {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider); // Burayı Popup yaptık
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