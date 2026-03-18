"use client";
import Link from "next/link";
import { useState } from "react";

export default function MobileMenu({ 
  user, 
  handleLogout, 
  setAuthModalAcik, 
  searchQuery, 
  handleSearch, 
  setSearchQuery, 
  searchResults, 
  isSearchOpen, 
  setIsSearchOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  kategoriler,
  ruhHalleri
}: any) {
  const [mobileKategoriAcik, setMobileKategoriAcik] = useState(false);
  const [mobileRuhHaliAcik, setMobileRuhHaliAcik] = useState(false);

  return (
    <div className={`md:hidden absolute top-[100%] left-0 w-full bg-gray-900 border-b border-pink-500/30 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden z-40 ${mobileMenuOpen ? "max-h-[85vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"}`}>
      <div className="p-5 flex flex-col space-y-4">
        
        {/* MOBİL ARAMA ÇUBUĞU */}
        <div className="relative w-full mb-2">
          <div className="flex items-center bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 focus-within:border-pink-500 transition-all">
            <svg className="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input type="text" value={searchQuery} onChange={handleSearch} placeholder="Dizi ara..." className="bg-transparent text-white text-base outline-none w-full placeholder-gray-400" />
            {searchQuery && (
              <button onClick={() => {setSearchQuery(""); setIsSearchOpen(false);}} className="text-gray-400 hover:text-pink-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            )}
          </div>

          {/* Mobil Arama Sonuçları */}
          {isSearchOpen && searchResults.length > 0 && (
            <div className="mt-3 w-full bg-gray-800 border border-gray-600 rounded-xl shadow-xl overflow-hidden">
              {searchResults.map((drama: any) => (
                <Link href={`/drama/${drama.id}`} key={drama.id} onClick={() => {setSearchQuery(""); setIsSearchOpen(false); setMobileMenuOpen(false);}} className="flex items-center gap-3 p-3 border-b border-gray-700/50 hover:bg-gray-700">
                  <img src={drama.posterImage || drama.backdropImage || "https://via.placeholder.com/50"} alt={drama.title} className="w-10 h-14 object-cover rounded" />
                  <div>
                    <h4 className="text-sm font-bold text-white line-clamp-1">{drama.title}</h4>
                    <span className="text-[10px] text-yellow-500 font-bold">⭐ {drama.ratingAvg}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Menü Linkleri */}
        <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-gray-200 border-b border-gray-800 pb-3">Ana Sayfa</Link>

        {/* Mobil Kategoriler */}
        <div className="border-b border-gray-800 pb-2">
          <button onClick={() => setMobileKategoriAcik(!mobileKategoriAcik)} className="flex items-center justify-between w-full text-lg font-bold text-gray-200 py-1">
            Kategoriler 
            <svg className={`w-5 h-5 transition-transform ${mobileKategoriAcik ? "rotate-180 text-pink-500" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {mobileKategoriAcik && (
            <div className="flex flex-col pl-4 mt-3 space-y-3 border-l-2 border-pink-500/30 ml-1">
              {kategoriler.map((k: any) => (
                <Link key={k.isim} href={k.link} onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-pink-400 flex items-center gap-3 text-sm">
                  <span className="text-base">{k.icon}</span><span>{k.isim}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Mobil Ruh Halleri */}
        <div className="border-b border-gray-800 pb-2">
          <button onClick={() => setMobileRuhHaliAcik(!mobileRuhHaliAcik)} className="flex items-center justify-between w-full text-lg font-bold text-gray-200 py-1">
            Ruh Haline Göre 
            <svg className={`w-5 h-5 transition-transform ${mobileRuhHaliAcik ? "rotate-180 text-purple-500" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {mobileRuhHaliAcik && (
            <div className="flex flex-col pl-4 mt-3 space-y-3 border-l-2 border-purple-500/30 ml-1">
              {ruhHalleri.map((r: any) => (
                <Link key={r.isim} href={r.link} onClick={() => setMobileMenuOpen(false)} className="text-gray-400 hover:text-purple-400 flex items-center gap-3 text-sm">
                  <span className="text-base">{r.icon}</span><span>{r.isim}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Çıkış / Giriş Butonu */}
        {user ? (
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left text-red-400 font-bold text-lg pt-2 flex items-center gap-2">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
             Güvenli Çıkış
          </button>
        ) : (
          <button onClick={() => { setAuthModalAcik(true); setMobileMenuOpen(false); }} className="w-full text-left text-pink-500 font-bold text-lg pt-2 flex items-center gap-2">
             Giriş Yap / Kayıt Ol
          </button>
        )}

      </div>
    </div>
  );
}