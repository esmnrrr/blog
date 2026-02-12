"use client"; // Etkileşim (Spoiler butonu) olduğu için Client Component yapıyoruz
import { useEffect, useState } from "react";
import { db } from "@/app/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useParams } from "next/navigation";

export default function DramaDetail() {
  const { id } = useParams(); // URL'deki ID'yi yakalıyoruz
  const [drama, setDrama] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSpoiler, setShowSpoiler] = useState(false); // Spoiler kilidi

  // Sayfa açılınca veriyi çek
  useEffect(() => {
    async function fetchDrama() {
      if (!id) return;
      const docRef = doc(db, "dramas", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDrama(docSnap.data());
      } else {
        console.log("Böyle bir dizi yok!");
      }
      setLoading(false);
    }
    fetchDrama();
  }, [id]);

  if (loading) return <div className="text-white text-center mt-20">Yükleniyor...</div>;
  if (!drama) return <div className="text-white text-center mt-20">Dizi bulunamadı :(</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20">
      
      {/* 1. ÜST KISIM (Kapak ve Başlık) */}
      <div className="relative h-[50vh] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${drama.backdropImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 container mx-auto flex items-end">
          <div className="hidden md:block w-48 h-72 rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800 mr-8">
             {/* Dikey Poster Varsa Göster */}
             {drama.posterImage ? (
                <img src={drama.posterImage} className="w-full h-full object-cover" />
             ) : (
                <div className="bg-gray-700 w-full h-full"></div>
             )}
          </div>
          
          <div className="mb-4">
            <h1 className="text-5xl font-bold mb-2">{drama.title}</h1>
            <div className="flex items-center space-x-4 text-gray-300 text-sm">
              <span className="bg-pink-600 text-white px-2 py-1 rounded font-bold">{drama.ratingAvg} / 10</span>
              <span>{drama.releaseYear}</span>
              <span>{drama.genres?.join(", ")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. İÇERİK KISMI */}
      <div className="container mx-auto px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* SOL TARA (Yazılar) */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Spoilersiz İnceleme */}
          <section>
            <h2 className="text-2xl font-bold text-pink-500 mb-4 border-b border-gray-700 pb-2">
              Genel Bakış
            </h2>
            <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {drama.reviewIntro || "Bu dizi için henüz giriş yazısı girilmemiş."}
            </div>
          </section>

          {/* Spoilerlı Alan (Özel Özellik!) */}
          <section className="bg-gray-800 p-6 rounded-xl border border-red-900/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-500 flex items-center">
                ⚠️ Spoilerlı Bölge
              </h2>
              <button 
                onClick={() => setShowSpoiler(!showSpoiler)}
                className="text-sm bg-gray-700 px-3 py-1 rounded hover:bg-gray-600 transition"
              >
                {showSpoiler ? "Gizle" : "Göster"}
              </button>
            </div>

            <div className={`transition-all duration-500 ${showSpoiler ? 'blur-0' : 'blur-md select-none'}`}>
               <p className="text-gray-300 leading-relaxed">
                 {drama.reviewSpoiler || "Bu dizi için spoilerlı inceleme henüz girilmemiş."}
               </p>
               {!showSpoiler && (
                 <div className="absolute inset-0 flex items-center justify-center">
                    <button 
                      onClick={() => setShowSpoiler(true)}
                      className="bg-red-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:scale-105 transition"
                    >
                      Spoiler'ı Gör
                    </button>
                 </div>
               )}
            </div>
          </section>

        </div>

        {/* SAĞ TARAF (Bilgi Kutusu & Fragman) */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
             <h3 className="text-xl font-bold mb-4 text-white">Fragman</h3>
             {/* Fragman Embed Kodu Buraya Gelecek */}
             <div className="aspect-video bg-black rounded overflow-hidden">
                {drama.trailerUrl ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={drama.trailerUrl.replace("watch?v=", "embed/")} 
                    allowFullScreen 
                    className="border-none"
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">Fragman Yok</div>
                )}
             </div>
          </div>

          <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-lg font-bold transition shadow-lg shadow-pink-600/20">
            + Listeme Ekle
          </button>
        </div>

      </div>
    </main>
  );
}