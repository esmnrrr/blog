import { db } from '@/firebase'; // firebase dosyanın bir üst klasörde olduğunu varsayıyoruz
import { collection, getDocs } from 'firebase/firestore';

// Veriyi çeken asenkron fonksiyon
async function getDramas() {
  const querySnapshot = await getDocs(collection(db, "dramas"));
  // Gelen veriyi okunabilir bir listeye çeviriyoruz
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export default async function Home() {
  // Veriyi bekle ve al
  const dramas = await getDramas();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-8">Hikamse - K-Drama Listesi</h1>
      
      <div className="grid gap-4">
        {/* Dizileri burada listeliyoruz */}
        {dramas.map((drama: any) => (
          <div key={drama.id} className="border border-gray-700 p-6 rounded-lg bg-gray-800">
            <h2 className="text-2xl font-semibold text-pink-500">{drama.title}</h2>
            <p>Yıl: {drama.releaseYear}</p>
            <p>Puan: {drama.ratingAvg} / 10</p>
          </div>
        ))}
        
        {/* Eğer hiç veri yoksa bunu göster */}
        {dramas.length === 0 && (
          <p>Henüz hiç dizi eklenmemiş...</p>
        )}
      </div>
    </main>
  );
}