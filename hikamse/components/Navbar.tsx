"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import Fuse from "fuse.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile} from "firebase/auth";

import MobileMenu from "./MobileMenu";

// --- MOBİL MENÜ İÇİN LİSTELER ---
const kategoriler = [
  { isim: "Romantik / Komedi", link: "/kategori/romantik", icon: "💖" },
  { isim: "Korku / Gerilim", link: "/kategori/korku", icon: "👻" },
  { isim: "Gizem", link: "/kategori/gizem", icon: "🕵️‍♂️" },
  { isim: "Polisiye", link: "/kategori/polisiye", icon: "🚓" },
  { isim: "Fantastik", link: "/kategori/fantastik", icon: "✨" },
  { isim: "Bilim Kurgu", link: "/kategori/bilim-kurgu", icon: "👽" },
  { isim: "Dram", link: "/kategori/dram", icon: "🎭" },
  { isim: "Aksiyon", link: "/kategori/aksiyon", icon: "💥" },
  { isim: "Aile", link: "/kategori/aile", icon: "👨‍👩‍👧‍👦" },
  { isim: "Tarihi", link: "/kategori/tarihi", icon: "📜" },
  { isim: "Program", link: "/kategori/program", icon: "📺" },
];

const ruhHalleri = [
  { isim: "Çerezlik (Kafa Dağıtmalık)", link: "/ruh-hali/cerezlik", icon: "🍿" },
  { isim: "Ağlatanlar (Mendil Tüketen)", link: "/ruh-hali/aglatanlar", icon: "😭" },
  { isim: "Beyin Yakanlar", link: "/ruh-hali/beyin-yakan", icon: "🤯" },
  { isim: "Kalp Isıtanlar", link: "/ruh-hali/kalp-isitan", icon: "🥰" },
  { isim: "Tırnak Yedirten", link: "/ruh-hali/tirnak-yedirten", icon: "💅" },
  { isim: "İlham Veren", link: "/ruh-hali/ilham-veren", icon: "✨" },
];

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const [ruhHaliAcik, setRuhHaliAcik] = useState(false);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ARAMA SİSTEMİ İÇİN STATE'LER
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allDramas, setAllDramas] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // E-POSTA GİRİŞ/KAYIT SİSTEMİ İÇİN HAFIZALAR
  const [authModalAcik, setAuthModalAcik] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // true = Giriş Ekranı, false = Kayıt Ekranı
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Kullanıcı siteye girdiği an veritabanında kaydı var mı diye bak!
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        
        // async/await kullanmadan .then() ile en güvenli şekilde kontrol ediyoruz:
        getDoc(userRef).then((userSnap) => {
          // Eğer veritabanında kaydı yoksa hemen yeni dosya aç!
          if (!userSnap.exists()) {
            setDoc(userRef, {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: "user", // Sisteme ilk giren herkes normal 'user'dır
              createdAt: new Date()
            });
          }
        }).catch((err) => console.error("Kayıt hatası:", err));
      }
    });

    // SİTE AÇILDIĞINDA TÜM DİZİLERİ ÇEK
    const fetchAllDramas = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "dramas"));
        const dramas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllDramas(dramas);
      } catch (err) {
        console.error("Diziler çekilemedi:", err);
      }
    };
    fetchAllDramas();

    return () => unsubscribe();
  }, []);

  // ZEKİ ARAMA MOTORU
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) { // En az 2 harf yazılınca aramaya başla
      const fuse = new Fuse(allDramas, {
        keys: ["title", "cast", "genre"], // Sadece isimde değil, oyuncu ve türde de arasın!
        threshold: 0.4, // Hata toleransı (0 = kusursuz, 1 = alakasız. 0.4 idealdir)
      });
      
      const results = fuse.search(query);
      setSearchResults(results.map(r => r.item).slice(0, 5)); // En iyi 5 sonucu al
      setIsSearchOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchOpen(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Giriş hatası:", error);
    }
  };

  // E-POSTA İLE KAYIT OL & GİRİŞ YAP MOTORU
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isLogin) {
        // GİRİŞ YAPILIYOR
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // YENİ HESAP AÇILIYOR
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const newUser = userCredential.user;
        
        // İsmini profile kaydet
        await updateProfile(newUser, { displayName: name });
        
        // Veritabanında (users) bu kullanıcıya dosya aç
        await setDoc(doc(db, "users", newUser.uid), {
          uid: newUser.uid,
          email: newUser.email,
          displayName: name,
          photoURL: "", // Avatarı şimdilik boş, UI-Avatars otomatik harf çizecek
          role: "user",
          createdAt: new Date()
        });
      }
      
      // İşlem başarılıysa pencereyi kapat ve kutuları temizle
      setAuthModalAcik(false); 
      setEmail(""); setPassword(""); setName("");
    } catch (error: any) {
      console.error("Yetkilendirme hatası:", error);
      alert(
        error.message.includes("email-already-in-use") ? "Bu mail zaten kayıtlı! Giriş yapmayı dene." : 
        error.message.includes("wrong-password") || error.message.includes("invalid-credential") ? "E-posta veya şifre hatalı!" : 
        error.message.includes("weak-password") ? "Şifre en az 6 karakter olmalı!" : 
        "Bir hata oluştu. Lütfen tekrar dene."
      );
    }
    setAuthLoading(false);
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

          {/* ARAMA ÇUBUĞU */}
          <div className="relative ml-4">
            <div className="flex items-center bg-gray-800 border border-gray-600 rounded-full px-3 py-1.5 focus-within:border-pink-500 focus-within:ring-1 focus-within:ring-pink-500 transition-all w-64">
              <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              <input 
                type="text" 
                value={searchQuery}
                onChange={handleSearch}
                placeholder="Dizi, oyuncu ara..." 
                className="bg-transparent text-white text-sm outline-none w-full placeholder-gray-400"
              />
              {searchQuery && (
                <button onClick={() => {setSearchQuery(""); setIsSearchOpen(false);}} className="text-gray-400 hover:text-pink-500 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}
            </div>

            {/* ARAMA SONUÇLARI AÇILIR KUTUSU */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-72 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden z-50 right-0 md:left-0">
                {searchResults.map((drama) => (
                  <Link 
                    href={`/drama/${drama.id}`} 
                    key={drama.id} 
                    onClick={() => {setSearchQuery(""); setIsSearchOpen(false);}}
                    className="flex items-center gap-3 p-3 hover:bg-gray-700 transition border-b border-gray-700/50 last:border-none"
                  >
                    <img src={drama.posterImage || drama.backdropImage || "https://via.placeholder.com/50"} alt={drama.title} className="w-10 h-14 object-cover rounded" />
                    <div>
                      <h4 className="text-sm font-bold text-white line-clamp-1">{drama.title}</h4>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[10px] bg-pink-600/20 text-pink-400 px-1.5 py-0.5 rounded capitalize">{drama.genre || "Dizi"}</span>
                        <span className="text-[10px] text-yellow-500 font-bold">⭐ {drama.ratingAvg}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            
            {/* BULUNAMADI DURUMU */}
            {isSearchOpen && searchQuery.length > 1 && searchResults.length === 0 && (
              <div className="absolute top-full mt-2 w-72 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl p-4 text-center z-50 right-0 md:left-0">
                <span className="text-2xl block mb-2">🕵️‍♂️</span>
                <p className="text-sm text-gray-400">Sonuç bulunamadı.</p>
              </div>
            )}
          </div>

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
              onClick={() => setAuthModalAcik(true)}
              className="px-5 py-2 bg-pink-600 hover:bg-pink-700 rounded-full text-sm font-bold shadow-lg transition"
            >
              Giriş Yap
            </button>
          )}
        </div>

        {/* MOBİL HAMBURGER BUTONU */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-300 hover:text-white focus:outline-none p-1 ml-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

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

      {/* --- GİRİŞ / KAYIT OL PENCERESİ (MODAL) --- */}
      {authModalAcik && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-pink-500/30 p-8 rounded-3xl shadow-2xl w-full max-w-md relative animate-fade-in-up">
            
            {/* Kapat Butonu */}
            <button onClick={() => setAuthModalAcik(false)} className="absolute top-5 right-5 text-gray-400 hover:text-pink-500 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            <h2 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-6">
              {isLogin ? "Tekrar Hoş Geldin!" : "Aramıza Katıl!"}
            </h2>
            
            {/* E-Posta Formu */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-bold text-gray-400 mb-1 pl-1">Kullanıcı Adı</label>
                  <input required type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-pink-500 transition-colors" placeholder="Örn: KDramaQueen" />
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1 pl-1">E-Posta</label>
                <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-pink-500 transition-colors" placeholder="ornek@mail.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-400 mb-1 pl-1">Şifre</label>
                <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-pink-500 transition-colors" placeholder="En az 6 karakter" />
              </div>
              <button type="submit" disabled={authLoading} className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg hover:shadow-pink-500/40 mt-2">
                {authLoading ? "Bekleyin..." : (isLogin ? "Giriş Yap" : "Kayıt Ol")}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-gray-500 text-sm">
              <hr className="w-full border-gray-700" />
              <span className="px-3 font-bold uppercase tracking-wider text-xs">Veya</span>
              <hr className="w-full border-gray-700" />
            </div>

            {/* Google Butonu */}
            <button onClick={() => { handleGoogleLogin(); setAuthModalAcik(false); }} type="button" className="mt-6 w-full bg-white text-gray-900 font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors shadow-md">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              Google ile Devam Et
            </button>

            {/* Geçiş Linki */}
            <p className="mt-6 text-center text-sm text-gray-400">
              {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}{" "}
              <button onClick={() => { setIsLogin(!isLogin); setEmail(""); setPassword(""); }} className="text-pink-500 font-bold hover:underline">
                {isLogin ? "Hemen Kayıt Ol" : "Giriş Yap"}
              </button>
            </p>

          </div>
        </div>
      )}

      {/* HARİCİ DOSYADAN ÇAĞRILAN MOBİL MENÜ */}
      <MobileMenu 
        user={user} 
        handleLogout={handleLogout} 
        setAuthModalAcik={setAuthModalAcik} 
        searchQuery={searchQuery} 
        handleSearch={handleSearch} 
        setSearchQuery={setSearchQuery} 
        searchResults={searchResults} 
        isSearchOpen={isSearchOpen} 
        setIsSearchOpen={setIsSearchOpen} 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        kategoriler={kategoriler} 
        ruhHalleri={ruhHalleri} 
      />

    </nav>
  );
}