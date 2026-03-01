"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";

export default function RomantikCategory() {
  const [dramas, setDramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRomantikDramas() {
      try {
        // İŞTE SİHİRLİ KOD: Sadece "genre" alanı "romantik" olanları bul getir!
        const q = query(collection(db, "dramas"), where("genre", "==", "romantik"));
        const querySnapshot = await getDocs(q);
        
        const romantikList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setDramas(romantikList);
      } catch (error) {
        console.error("Diziler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchRomantikDramas();
  }, []);

  if (loading) return <div className="text-white text-center mt-20 font-bold text-xl">Diziler Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 pb-20">
      <div className="container mx-auto max-w-6xl mt-6">
        
        {/* Başlık Kısmı */}
        <div className="mb-10 border-b border-pink-500/30 pb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 drop-shadow-lg">
            Romantik Diziler 💖
          </h1>
          <p className="text-gray-400 mt-2">Kalbinizi ısıtacak en güzel aşk hikayeleri...</p>
        </div>

        {/* Dizileri Listeleme Kısmı */}
        {dramas.length === 0 ? (
          <div className="text-center text-gray-400 py-20 bg-gray-800/50 rounded-2xl border border-dashed border-gray-600">
            <p className="text-xl mb-2 font-semibold">Burada henüz rüzgar esmiyor 🍂</p>
            <p className="text-sm">Bu kategoriye henüz bir dizi eklenmemiş.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {dramas.map((drama) => (
              <Link href={`/drama/${drama.id}`} key={drama.id} className="group cursor-pointer">
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border border-gray-700 bg-gray-800 shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:border-pink-500 group-hover:shadow-pink-500/40">
                  
                  <img 
                    src={drama.posterImage || drama.backdropImage || "https://via.placeholder.com/300x450"} 
                    alt={drama.title} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-bold text-sm text-white line-clamp-2 drop-shadow-md mb-1">
                      {drama.title}
                    </h3>
                    <span className="text-xs bg-pink-600/80 text-white px-2 py-0.5 rounded w-fit font-bold shadow-lg">
                      ⭐ {drama.ratingAvg}
                    </span>
                  </div>
                  
                </div>
              </Link>
            ))}
          </div>
        )}
        
      </div>
    </main>
  );
}