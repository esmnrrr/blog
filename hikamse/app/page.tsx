import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import Hero from '@/components/Hero'; // Hero bileşenini çağırdık

async function getDramas() {
  const querySnapshot = await getDocs(collection(db, "dramas"));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export default async function Home() {
  const dramas = await getDramas();

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      
      {/* 1. HERO SECTION (En üstte Slider) */}
      {/* Verileri Hero'ya gönderiyoruz */}
      <Hero dramas={dramas} />

      {/* 2. DİĞER İÇERİKLER */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6 text-pink-500 border-l-4 border-pink-500 pl-3">
          Son Eklenen İncelemeler
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {dramas.map((drama: any) => (
            <div key={drama.id} className="group relative bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition duration-300 shadow-lg">
              {/* Kart Resmi */}
              <div className="aspect-[2/3] w-full bg-gray-700 relative">
                 {/* Eğer poster yoksa gri kutu göster */}
                 {drama.backdropImage ? (
                   <img src={drama.backdropImage} alt={drama.title} className="w-full h-full object-cover" />
                 ) : (
                   <div className="flex items-center justify-center h-full text-gray-500">Görsel Yok</div>
                 )}
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition" />
              </div>
              
              {/* Kart Bilgileri */}
              <div className="p-4">
                <h3 className="font-bold text-lg truncate">{drama.title}</h3>
                <div className="flex justify-between text-sm text-gray-400 mt-2">
                  <span>{drama.releaseYear}</span>
                  <span className="text-yellow-500">★ {drama.ratingAvg}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}