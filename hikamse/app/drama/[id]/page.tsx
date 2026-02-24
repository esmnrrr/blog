"use client";
import { useEffect, useState } from "react";
import { db, auth } from "@/app/firebase"; 
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams } from "next/navigation";

export default function DramaDetail() {
  const { id } = useParams();
  const [drama, setDrama] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showSpoiler, setShowSpoiler] = useState(false);
  
  const [user, setUser] = useState<any>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  // 1. Kullanıcıyı ve Diziyi Çek
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && id) {
        checkIfAdded(currentUser.uid, id as string);
      }
    });

    async function fetchDrama() {
      if (!id) return;
      const docRef = doc(db, "dramas", id as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDrama(docSnap.data());
      }
      setLoading(false);
    }

    fetchDrama();
    return () => unsubscribe();
  }, [id]);

  // 2. Listede Ekli mi Kontrol Et
  const checkIfAdded = async (uid: string, dramaId: string) => {
    const docRef = doc(db, "users", uid, "library", dramaId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setIsAdded(true);
    }
  };

  // 3. BUTON TIKLAMA İŞLEMİ (Veritabanına Yaz/Sil)
  const handleListToggle = async () => {
    if (!user) {
      alert("Listeye eklemek için önce giriş yapmalısın!");
      return;
    }
    
    setBtnLoading(true);
    const dramaId = id as string;
    const docRef = doc(db, "users", user.uid, "library", dramaId);

    try {
      if (isAdded) {
        // Ekliyse Sil
        await deleteDoc(docRef);
        setIsAdded(false);
        alert("Listeden çıkarıldı.");
      } else {
        // Ekli Değilse Ekle
        await setDoc(docRef, {
          title: drama.title || "İsimsiz",
          posterImage: drama.posterImage || "",
          addedAt: new Date(),
          status: "Plan to Watch"
        });
        setIsAdded(true);
        alert("Listene eklendi! 🎉");
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu :(");
    }
    setBtnLoading(false);
  };

  if (loading) return <div className="text-white text-center mt-20">Yükleniyor...</div>;
  if (!drama) return <div className="text-white text-center mt-20">Dizi bulunamadı :(</div>;

  return (
    <main className="min-h-screen bg-gray-900 text-white pb-20">
      
      {/* ÜST KISIM (Kapak, Poster, Başlık) */}
      <div className="relative h-[50vh] w-full">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${drama.backdropImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 container mx-auto flex items-end">
          <div className="hidden md:block w-48 h-72 rounded-lg overflow-hidden shadow-2xl border-4 border-gray-800 mr-8 relative z-10">
             {drama.posterImage ? (
                <img src={drama.posterImage} className="w-full h-full object-cover" />
             ) : <div className="bg-gray-700 w-full h-full"></div>}
          </div>
          
          <div className="mb-4 relative z-10">
            <h1 className="text-5xl font-bold mb-2">{drama.title}</h1>
            <div className="flex items-center space-x-4 text-gray-300 text-sm">
              <span className="bg-pink-600 text-white px-2 py-1 rounded font-bold">{drama.ratingAvg} / 10</span>
              <span>{drama.releaseYear}</span>
            </div>
          </div>
        </div>
      </div>

      {/* İÇERİK KISMI (Burayı geri getirdim!) */}
      <div className="relative z-20 container mx-auto px-8 mt-8 grid grid-cols-1 md:grid-cols-3 gap-12">
        
        {/* SOL TARAF: İnceleme ve Spoiler */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-pink-500 mb-4 border-b border-gray-700 pb-2">Genel Bakış</h2>
            <div className="text-gray-300 leading-relaxed text-lg whitespace-pre-line">
              {drama.reviewIntro || "Giriş yazısı yok."}
            </div>
          </section>

          <section className="bg-gray-800 p-6 rounded-xl border border-red-900/50">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-red-500 flex items-center">⚠️ Spoilerlı Bölge</h2>
              <button onClick={() => setShowSpoiler(!showSpoiler)} className="text-sm bg-gray-700 px-3 py-1 rounded">
                {showSpoiler ? "Gizle" : "Göster"}
              </button>
            </div>
            <div className={`transition-all duration-500 ${showSpoiler ? 'blur-0' : 'blur-md select-none'}`}>
               <p className="text-gray-300 leading-relaxed">{drama.reviewSpoiler || "Spoiler yok."}</p>
            </div>
          </section>
        </div>

        {/* SAĞ TARAF: Fragman ve Buton */}
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-lg">
             <h3 className="text-xl font-bold mb-4 text-white">Fragman</h3>
             <div className="aspect-video bg-black rounded overflow-hidden">
                {drama.trailerUrl ? (
                  <iframe width="100%" height="100%" src={drama.trailerUrl.replace("watch?v=", "embed/")} allowFullScreen className="border-none"></iframe>
                ) : <div className="text-gray-500 text-center pt-10">Fragman Yok</div>}
             </div>
          </div>

          {/* İŞTE O EFSANE BUTON */}
          <button 
            type="button"
            onClick={handleListToggle}
            disabled={btnLoading}
            className={`w-full py-4 rounded-lg font-bold text-lg transition shadow-lg flex justify-center items-center
              ${isAdded 
                ? "bg-gray-700 hover:bg-red-600 text-white" 
                : "bg-pink-600 hover:bg-pink-700 text-white"
              }`}
          >
            {btnLoading ? (
              <span>İşleniyor...</span>
            ) : isAdded ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Listemde Ekli (Çıkar)
              </>
            ) : (
              "+ Listeme Ekle"
            )}
          </button>
        </div>

      </div>
    </main>
  );
}