"use client";
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useParams } from "next/navigation";
import Link from "next/link";

// URL'deki kelimeleri, ekranda görünecek emojili isimlere çeviren sözlük
const MOOD_ISIMLERI: any = {
  "cerezlik": "🍿 Çerezlik (Kafa Dağıtmalık)",
  "aglatanlar": "😭 Ağlatanlar (Mendil Tüketen)",
  "beyin-yakan": "🤯 Beyin Yakanlar",
  "kalp-isitan": "🥰 Kalp Isıtanlar",
  "tirnak-yedirten": "💅 Tırnak Yedirten",
  "ilham-veren": "✨ İlham Veren"
};

export default function RuhHaliPage() {
  const { slug } = useParams(); // URL'deki mood adını havada yakalar (örn: "beyin-yakan")
  const [dramas, setDramas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Sözlükten eşleştir, bulamazsa varsayılan metin yaz
  const moodAdi = MOOD_ISIMLERI[slug as string] || "Bu Ruh Halindeki";

  useEffect(() => {
    async function fetchDramasByMood() {
      try {
        const querySnapshot = await getDocs(collection(db, "dramas"));
        const allDramas = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

        // Dizileri YENİ EKLEDİĞİMİZ "mood" (ruh hali) alanına göre filtreliyoruz
        const filteredDramas = allDramas.filter((drama) => {
          const dramaMood = (drama.mood || "").toLowerCase();
          return dramaMood === (slug as string).toLowerCase();
        });

        setDramas(filteredDramas);
      } catch (error) {
        console.error("Diziler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    }

    if (slug) fetchDramasByMood();
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

        {/* Dinamik Ruh Hali Başlığı (Mor/Pembe Gradient) */}
        <div className="flex items-center gap-3 mb-10 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500 tracking-tight">
            {moodAdi} Diziler
          </h1>
        </div>

        {/* Diziler Grid Listesi */}
        {dramas.length === 0 ? (
          <div className="text-center py-20 bg-gray-800/30 rounded-2xl border border-gray-800">
            <span className="text-6xl block mb-4">👻</span>
            <p className="text-gray-400 text-lg font-medium">Bu ruh haline uygun henüz bir dizi eklenmemiş.</p>
            <p className="text-gray-600 text-sm mt-2">Admin panelinden yeni dizi eklerken bu ruh halini seçebilirsin!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {dramas.map((drama) => (
              <Link href={`/drama/${drama.id}`} key={drama.id} className="group cursor-pointer">
                {/* Kart Tasarımı (Hover olunca mor parlıyor) */}
                <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden border border-gray-700 bg-gray-800 shadow-xl transition-all duration-300 group-hover:-translate-y-2 group-hover:border-purple-500 group-hover:shadow-purple-500/40">
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
                    {/* Puan etiketi de mor oldu */}
                    <span className="text-xs bg-purple-600/80 text-white px-2 py-0.5 rounded w-fit font-bold shadow-lg">
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