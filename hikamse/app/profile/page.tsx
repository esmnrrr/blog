"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebase";
import { collection, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [library, setLibrary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const q = collection(db, "users", currentUser.uid, "library");
        const querySnapshot = await getDocs(q);
        
        const userDramas = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setLibrary(userDramas);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-white text-center mt-20">Yükleniyor...</div>;
  if (!user) return <div className="text-white text-center mt-20">Bu sayfayı görmek için lütfen giriş yapın.</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-8 pb-20">
      <div className="container mx-auto max-w-6xl">
        
        {/* PROFİL KARTI (Üst Kısım) */}
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 bg-gray-800 p-8 rounded-xl mb-12 shadow-lg border border-gray-700">
          <img 
            src={user.photoURL || "https://via.placeholder.com/150"} 
            alt="Profil" 
            className="w-24 h-24 rounded-full border-4 border-pink-500 shadow-xl" 
          />
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <p className="text-gray-400">{user.email}</p>
            <div className="mt-3 bg-pink-600/20 text-pink-400 text-sm font-bold px-4 py-1.5 rounded-full inline-block">
              {library.length} Dizi Kayıtlı
            </div>
          </div>
        </div>

        {/* DİZİ KÜTÜPHANESİ (Alt Kısım) */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-700 pb-2">
          <h2 className="text-2xl font-bold text-pink-500">
            İzleme Listem
          </h2>
        </div>
        
        {library.length === 0 ? (
          // Liste Boşsa
          <div className="text-center text-gray-400 py-16 bg-gray-800 rounded-lg border border-dashed border-gray-600">
            <p className="text-lg mb-2">Henüz listene hiçbir dizi eklemedin.</p>
            <Link href="/" className="text-pink-500 hover:text-pink-400 font-bold transition">
              Ana sayfaya dön ve dizi keşfet!
            </Link>
          </div>
        ) : (
          // İŞTE YENİ TASARIM: LİSTE DOLUYSA KÜÇÜK KUTULAR HALİNDE GÖSTER
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {library.map((drama) => (
              <Link href={`/drama/${drama.id}`} key={drama.id} className="group">
                <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700 group-hover:border-pink-500 transition-all duration-300 shadow-lg hover:scale-105 hover:shadow-pink-500/20">
                  
                  {/* Resim Kısmı (Sabit Boyutlandırıldı) */}
                  <div className="relative h-64 w-full bg-gray-700">
                    <img 
                      // Eğer dikey poster yoksa yatay resmi kesip koyar, boş kalmaz
                      src={drama.posterImage || drama.backdropImage || "https://via.placeholder.com/300x450"} 
                      alt={drama.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                  </div>
                  
                  {/* Yazı Kısmı */}
                  <div className="p-4 flex flex-col flex-grow justify-between">
                    <h3 className="font-bold text-sm text-white line-clamp-2">{drama.title}</h3>
                    <div className="mt-3">
                      <span className="text-xs text-pink-400 font-semibold bg-pink-900/30 px-2 py-1 rounded">
                        {drama.status}
                      </span>
                    </div>
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