"use client"; // Animasyon ve state olduğu için client tarafında çalışmalı
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Hero({ dramas }: { dramas: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Otomatik geçiş sayacı (Slider Mantığı)
  useEffect(() => {
    // Eğer dizi yoksa zamanlayıcıyı başlatma
    if (dramas.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === dramas.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // 5000ms = 5 saniye (İstersen 15000 yap)

    return () => clearInterval(interval);
  }, [dramas]);

  // Eğer veritabanından veri gelmediyse boş dönmesin, yükleniyor desin
  if (dramas.length === 0) return null;

  const currentDrama = dramas[currentIndex];

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden">
      
      {/* Arka Plan Resmi */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
        style={{ 
          backgroundImage: `url(${currentDrama.backdropImage || 'https://via.placeholder.com/1920x1080'})` 
        }}
      >
        {/* Karartma Efekti (Gradient) - Yazılar okunsun diye */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
      </div>

      {/* Yazılar ve İçerik */}
      <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-10 flex flex-col items-start space-y-4">
        
        {/* Kategori Etiketi (Varsa) */}
        <span className="bg-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Haftanın Önerisi
        </span>

        {/* Dizi Başlığı */}
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">
          {currentDrama.title}
        </h1>

        {/* Puan ve Yıl */}
        <div className="flex items-center space-x-4 text-gray-300">
          <span className="text-green-400 font-bold">{currentDrama.ratingAvg} Puan</span>
          <span>|</span>
          <span>{currentDrama.releaseYear}</span>
        </div>

        {/* Butonlar */}
        <div className="flex space-x-4 mt-4">
            {/* Detay Butonu */}
            <Link href={`/drama/${currentDrama.id}`} className="bg-white text-gray-900 px-6 py-3 rounded-md font-bold hover:bg-gray-200 transition flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              İncelemeyi Oku
            </Link>

            {/* Listeme Ekle Butonu */}
            <button className="bg-gray-600/80 backdrop-blur-sm text-white px-6 py-3 rounded-md font-bold hover:bg-gray-500/80 transition">
              + Listeme Ekle
            </button>
        </div>
      </div>
      
      {/* Sağ tarafta Slider Noktaları */}
      <div className="absolute right-8 bottom-1/2 flex flex-col space-y-2">
        {dramas.map((_, idx) => (
          <div 
            key={idx} 
            className={`w-3 h-3 rounded-full transition-all ${idx === currentIndex ? 'bg-pink-500 scale-125' : 'bg-gray-400/50'}`}
          />
        ))}
      </div>
    </div>
  );
}