"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import Fuse from "fuse.js";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [menuAcik, setMenuAcik] = useState(false);
  const [ruhHaliAcik, setRuhHaliAcik] = useState(false);

  // ARAMA SİSTEMİ İÇİN STATE'LER
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allDramas, setAllDramas] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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