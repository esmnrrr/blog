"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";

// URL'deki kelimeleri, ekranda görünecek şık isimlere çeviren sözlük
const KATEGORI_ISIMLERI: any = {
  "romantik": "Romantik / Komedi",
  "korku": "Korku / Gerilim",
  "gizem": "Gizem",
  "polisiye": "Polisiye",
  "fantastik": "Fantastik",
  "bilim-kurgu": "Bilim Kurgu",
  "dram": "Dram",
  "aksiyon": "Aksiyon",
  "aile": "Aile",
  "tarihi": "Tarihi",
  "program": "Program"
};

export default function KategoriPage() {
  const { slug } = useParams(); // URL'deki kategori adını havada yakalar (örn: "romantik")
  const [dramas, setDramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // URL'deki "romantik" yazısını "Romantik / Komedi" başlığına çeviriyoruz
  const kategoriAdi = KATEGORI_ISIMLERI[slug as string] || "Kategori";

  useEffect(() => {
    async function fetchDramasByCategory() {
      try {
        const querySnapshot = await getDocs(collection(db, "dramas"));
        const allDramas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

        // Dizileri kategoriye göre filtreleme işlemi
        const filteredDramas = allDramas.filter((drama) => {
          // Firebase'deki dizinin 'category' alanını okur (küçük harfe çevirerek garantileriz)
          const dramaCat = (drama.genre || drama.category || drama.kategori || "").toLowerCase();
          return dramaCat.includes((slug as string).toLowerCase());
        });

        setDramas(filteredDramas);
      } catch (error) {
        console.error("Diziler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchDramasByCategory();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex justify-center items-center text-xl font-bold">
        Diziler yükleniyor... 🎬
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20 pt-10 overflow-x-hidden">
      <div className="container mx-auto px-8 max-w-7xl">

        {/* Dinamik Kategori Başlığı */}
        <div className="flex items-center gap-3 mb-10 border-b border-gray-800 pb-4">
          <span className="text-4xl">🍿</span>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 tracking-tight">
            {kategoriAdi} Dizileri
          </h1>
        </div>

        {/* Diziler Grid Listesi (Ana Sayfadaki Şık Tasarımın Aynısı) */}
        {dramas.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-800">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"></path></svg>
            <p className="text-gray-400 text-lg font-medium">Bu kategoride henüz bir dizi bulunmuyor.</p>
            <p className="text-gray-600 text-sm mt-2">Firebase'e dizi eklerken <strong className="text-pink-500">category</strong> alanına <strong className="text-pink-500">"{slug}"</strong> yazmayı unutma!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
                      ⭐ {drama.ratingAvg || "N/A"}
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