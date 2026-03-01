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

  // YENİ EKLENEN DURUMLAR (State)
  const [userStatus, setUserStatus] = useState("Plan to Watch"); 
  const [userRating, setUserRating] = useState<number>(0); 

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
      const data = docSnap.data();
      setUserStatus(data.status || "Plan to Watch");
      setUserRating(data.rating || 0);
    }
  };

  // 3. LİSTEYE KAYDET VEYA GÜNCELLE FONKSİYONU
  const handleSaveToList = async () => {
    if (!user) {
      alert("Listeye eklemek için önce giriş yapmalısın!");
      return;
    }
    
    setBtnLoading(true);
    const dramaId = id as string;
    const docRef = doc(db, "users", user.uid, "library", dramaId);

    try {
      await setDoc(docRef, {
        title: drama.title || "İsimsiz",
        posterImage: drama.posterImage || "",
        addedAt: new Date(),
        status: userStatus, 
        rating: userRating  
      }, { merge: true }); 
      
      setIsAdded(true);
      alert(isAdded ? "Listen güncellendi! ✅" : "Listene eklendi! 🎉");
    } catch (error) {
      console.error("Hata:", error);
      alert("Bir hata oluştu :(");
    }
    setBtnLoading(false);
  };

  // 4. LİSTEDEN TAMAMEN SİLME FONKSİYONU
  const handleRemoveFromList = async () => {
    if (!confirm("Bu diziyi listenden tamamen silmek istediğine emin misin?")) return;
    
    setBtnLoading(true);
    const dramaId = id as string;
    try {
      await deleteDoc(doc(db, "users", user.uid, "library", dramaId));
      setIsAdded(false);
      setUserStatus("Plan to Watch"); 
      setUserRating(0); 
      alert("Listeden çıkarıldı.");
    } catch (error) {
      console.error("Hata:", error);
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
            <div className="flex items-center space-x-4 text-gray-300 text-sm mb-4"> 
              <span className="bg-pink-600 text-white px-2 py-1 rounded font-bold">{drama.ratingAvg} / 10</span>
              <span>{drama.releaseYear}</span>
            </div>
            
            {/* KONTROL ÇUBUĞU */}
            <div className="mt-4 flex flex-wrap items-center gap-8 bg-black/40 backdrop-blur-md p-3 rounded-2xl w-fit shadow-2xl">
              
              {/* Durum Seçici */}
              <div className="relative">
                <select 
                  value={userStatus} 
                  onChange={(e) => setUserStatus(e.target.value)}
                  className="appearance-none bg-gray-800/80 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 pl-4 pr-10 rounded-xl outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-pink-500"
                >
                  <option value="Plan to Watch" className="bg-gray-900 text-white">📌 İzlenecekler</option>
                  <option value="Watching" className="bg-gray-900 text-white">📺 İzliyorum</option>
                  <option value="Completed" className="bg-gray-900 text-white">✅ Bitti</option>
                  <option value="Dropped" className="bg-gray-900 text-white">❌ Bıraktım</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {/* Puan Seçici */}
              <div className="relative">
                <select 
                  value={userRating} 
                  onChange={(e) => setUserRating(Number(e.target.value))}
                  className="appearance-none bg-gray-800/80 hover:bg-gray-700 text-white text-sm font-semibold py-2.5 pl-4 pr-10 rounded-xl outline-none cursor-pointer transition-colors focus:ring-2 focus:ring-pink-500"
                >
                  <option value={0} className="bg-gray-900 text-white">⭐ Puanım</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <option key={num} value={num} className="bg-gray-900 text-white">⭐ {num} / 10</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>

              {/* Araya İnce Bir Çizgi */}
              {isAdded && <div className="w-px h-8 bg-white/20 hidden sm:block mx-1"></div>}

              {/* Akıllı Butonlar (GÜNCELLENDİ) */}
              {isAdded ? (
                <div className="flex items-center space-x-3">
                  {/* Güncelle Butonu */}
                  <button onClick={handleSaveToList} disabled={btnLoading} className="bg-pink-600 hover:bg-pink-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-pink-500/30 flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                    Güncelle
                  </button>
                  {/* Sil Butonu */}
                  <button onClick={handleRemoveFromList} disabled={btnLoading} className="bg-red-600 hover:bg-red-500 text-white px-8 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Sil
                  </button>
                </div>
              ) : (
                <button onClick={handleSaveToList} disabled={btnLoading} className="bg-pink-600 hover:bg-pink-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-pink-500/30 flex items-center ml-1">
                  <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Listeme Ekle
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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

        {/* SAĞ TARAF: Fragman */}
        <div className="space-y-6">

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
             <h3 className="text-xl font-bold mb-4 text-white">Fragman</h3>
             <div className="aspect-video bg-black rounded overflow-hidden">
                {drama.trailerUrl ? (
                  <iframe width="100%" height="100%" src={drama.trailerUrl.replace("watch?v=", "embed/")} allowFullScreen className="border-none"></iframe>
                ) : <div className="text-gray-500 text-center pt-10">Fragman Yok</div>}
             </div>
          </div>

        </div>

      </div>
    </main>
  );
}